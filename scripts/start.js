process.env.NODE_ENV = 'development';

var path = require('path');
var chalk = require('chalk');
var readlineSync = require('readline-sync');
var request = require('request');
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var historyApiFallback = require('connect-history-api-fallback');
var httpProxyMiddleware = require('http-proxy-middleware');
var execSync = require('child_process').execSync;
var opn = require('opn');
var detect = require('detect-port');
var checkRequiredFiles = require('./utils/checkRequiredFiles');
var prompt = require('./utils/prompt');
var config = require('../config/webpack.config.dev');
var paths = require('../config/paths');
var env = require('../config/env')
var rimraf = require('rimraf')
var formatMessage = require('./utils/utils').formatMessage
var isLikelyASyntaxError = require('./utils/utils').isLikelyASyntaxError

// Tools like Cloud9 rely on this.
var DEFAULT_PORT = process.env.PORT || 3000;
var compiler;
var handleCompile;

// You can safely remove this after ejecting.
// We only use this block for testing of Create React App itself:
var isSmokeTest = process.argv.some(arg => arg.indexOf('--smoke-test') > -1);
if (isSmokeTest) {
  handleCompile = function (err, stats) {
    if (err || stats.hasErrors() || stats.hasWarnings()) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  };
}

var isFirstClear = true;
function clearConsole() {
  // On first run, clear completely so it doesn't show half screen on Windows.
  // On next runs, use a different sequence that properly scrolls back.
  process.stdout.write(isFirstClear ? '\x1bc' : '\x1b[2J\x1b[0f');
  isFirstClear = false;
}

function setupCompiler(port, protocol) {

  // Delete flow folder, because package flow wan't to do that before start
  rimraf('/tmp/flow', function () { console.log('Flow folder deleted'); });
  // "Compiler" is a low-level interface to Webpack.
  // It lets us listen to some events and provide our own custom messages.
  compiler = webpack(config, handleCompile);

  // "invalid" event fires when you have changed a file, and Webpack is
  // recompiling a bundle. WebpackDevServer takes care to pause serving the
  // bundle, so if you refresh, it'll wait instead of serving the old one.
  // "invalid" is short for "bundle invalidated", it doesn't imply any errors.
  compiler.plugin('invalid', function() {
    clearConsole();
    console.log('Compiling...');
  });

  // "done" event fires when Webpack has finished recompiling the bundle.
  // Whether or not you have warnings or errors, you will get this event.
  compiler.plugin('done', function(stats) {
    clearConsole();
    var hasErrors = stats.hasErrors();
    var hasWarnings = stats.hasWarnings();
    if (!hasErrors && !hasWarnings) {
      console.log(chalk.green('Compiled successfully!'));
      console.log();
      console.log('The app is running at:');
      console.log();
      console.log('  ' + chalk.cyan(protocol + '://localhost:' + port + '/'));
      console.log();
      return;
    }

    // We have switched off the default Webpack output in WebpackDevServer
    // options so we are going to "massage" the warnings and errors and present
    // them in a readable focused way.
    // We use stats.toJson({}, true) to make output more compact and readable:
    // https://github.com/facebookincubator/create-react-app/issues/401#issuecomment-238291901
    var json = stats.toJson({}, true);
    var formattedErrors = json.errors.map(message =>
      'Error in ' + formatMessage(message)
    );
    var formattedWarnings = json.warnings.map(message =>
      'Warning in ' + formatMessage(message)
    );
    if (hasErrors) {
      console.log(chalk.red('Failed to compile.'));
      console.log();
      if (formattedErrors.some(isLikelyASyntaxError)) {
        // If there are any syntax errors, show just them.
        // This prevents a confusing ESLint parsing error
        // preceding a much more useful Babel syntax error.
        formattedErrors = formattedErrors.filter(isLikelyASyntaxError);
      }
      formattedErrors.forEach(message => {
        console.log(message);
        console.log();
      });
      // If errors exist, ignore warnings.
      return;
    }
    if (hasWarnings) {
      console.log(chalk.yellow('Compiled with warnings.'));
      console.log();
      formattedWarnings.forEach(message => {
        console.log(message);
        console.log();
      });
      // Teach some ESLint tricks.
      console.log('You may use special comments to disable some warnings.');
      console.log('Use ' + chalk.yellow('// eslint-disable-next-line') + ' to ignore the next line.');
      console.log('Use ' + chalk.yellow('/* eslint-disable */') + ' to ignore all warnings in a file.');
    }
  });
}

function openBrowser(port, protocol) {
  if (process.platform === 'darwin') {
    try {
      // Try our best to reuse existing tab
      // on OS X Google Chrome with AppleScript
      execSync('ps cax | grep "Google Chrome"');
      execSync(
        'osascript chrome.applescript ' + protocol + '://localhost:' + port + '/',
        {cwd: path.join(__dirname, 'utils'), stdio: 'ignore'}
      );
      return;
    } catch (err) {
      // Ignore errors.
    }
  }
  // Fallback to opn
  // (It will always open new tab)
  opn(protocol + '://localhost:' + port + '/').catch(err => {
    // ignore errors - can happen when starting the server in docker container
  })
}

// We need to provide a custom onError function for httpProxyMiddleware.
// It allows us to log custom error messages on the console.
function onProxyError(proxy) {
  return function(err, req, res){
    var host = req.headers && req.headers.host;
    console.log(
      chalk.red('Proxy error:') + ' Could not proxy request ' + chalk.cyan(req.url) +
      ' from ' + chalk.cyan(host) + ' to ' + chalk.cyan(proxy) + '.'
    );
    console.log(
      'See https://nodejs.org/api/errors.html#errors_common_system_errors for more information (' +
      chalk.cyan(err.code) + ').'
    );
    console.log();

    // And immediately send the proper error response to the client.
    // Otherwise, the request will eventually timeout with ERR_EMPTY_RESPONSE on the client side.
    if (res.writeHead && !res.headersSent) {
        res.writeHead(500);
    }
    res.end('Proxy error: Could not proxy request ' + req.url + ' from ' +
      host + ' to ' + proxy + ' (' + err.code + ').'
    );
  }
}

function addMiddleware(devServer) {
  // `proxy` lets you to specify a fallback server during development.
  // Every unrecognized request will be forwarded to it.
  var proxy = process.env.ENGINE_URL || require(paths.appPackageJson).proxy;
  if (proxy) {
    if (typeof proxy !== 'string') {
      console.log(chalk.red('When specified, "proxy" in package.json must be a string.'));
      console.log(chalk.red('Instead, the type of "proxy" was "' + typeof proxy + '".'));
      console.log(chalk.red('Either remove "proxy" from package.json, or make it a string.'));
      process.exit(1);
    }

    // Otherwise, if proxy is specified, we will let it handle any request.
    // There are a few exceptions which we won't send to the proxy:
    // - /index.html (served as HTML5 history API fallback)
    // - /*.hot-update.json (WebpackDevServer uses this too for hot reloading)
    // - /sockjs-node/* (WebpackDevServer uses this for hot reloading)
    // Tip: use https://www.debuggex.com/ to visualize the regex
    var mayProxy = /^(?!\/(index\.html$|.*\.hot-update\.json$|sockjs-node\/)).*$/;
    devServer.use(mayProxy,
      // Pass the scope regex both to Express and to the middleware for proxying
      // of both HTTP and WebSockets to work without false positives.
      httpProxyMiddleware(pathname => mayProxy.test(pathname), {
        target: proxy,
        logLevel: 'silent',
        onError: onProxyError(proxy),
        secure: false,
        changeOrigin: true
      })
    );
  }
  // Finally, by now we have certainly resolved the URL.
  // It may be /index.html, so let the dev server try serving it again.
  devServer.use(devServer.middleware);
}

function runDevServer(port, protocol) {
  var devServer = new WebpackDevServer(compiler, {
    // Silence WebpackDevServer's own logs since they're generally not useful.
    // It will still show compile warnings and errors with this setting.
    clientLogLevel: 'info',
    // By default WebpackDevServer also serves files from the current directory.
    // This might be useful in legacy apps. However we already encourage people
    // to use Webpack for importing assets in the code, so we don't need to
    // additionally serve files by their filenames. Otherwise, even if it
    // works in development, those files will be missing in production, unless
    // we explicitly copy them. But even if we copy all the files into
    // the build output (which doesn't seem to be wise because it may contain
    // private information such as files with API keys, for example), we would
    // still have a problem. Since the filenames would be the same every time,
    // browsers would cache their content, and updating file content would not
    // work correctly. This is easily solved by importing assets through Webpack
    // because if it can then append content hashes to filenames in production,
    // just like it does for JS and CSS. And because we configured "html" loader
    // to be used for HTML files, even <link href="./src/something.png"> would
    // get resolved correctly by Webpack and handled both in development and
    // in production without actually serving it by that path.
    contentBase: [],
    // Enable hot reloading server. It will provide /sockjs-node/ endpoint
    // for the WebpackDevServer client so it can learn when the files were
    // updated. The WebpackDevServer client is included as an entry point
    // in the Webpack development configuration. Note that only changes
    // to CSS are currently hot reloaded. JS changes will refresh the browser.
    hot: true,
    // It is important to tell WebpackDevServer to use the same "root" path
    // as we specified in the config. In development, we always serve from /.
    publicPath: config.output.publicPath,
    // WebpackDevServer is noisy by default so we emit custom message instead
    // by listening to the compiler events with `compiler.plugin` calls above.
    quiet: false,
    // Reportedly, this avoids CPU overload on some systems.
    // https://github.com/facebookincubator/create-react-app/issues/293
    watchOptions: {
      ignored: /node_modules/
    },
    //This is for redirecting to root path if path doesn't exists
    historyApiFallback: {
      index: config.output.publicPath
    },

    stats: 'errors-only',

    // Enable HTTPS if the HTTPS environment variable is set to 'true'
    https: protocol === "https" ? true : false
  });

  // Our custom middleware proxies requests to /index.html or a remote API.
  addMiddleware(devServer);

  // Launch WebpackDevServer.
  devServer.listen(port, (err, result) => {
    if (err) {
      return console.log(err);
    }

    clearConsole();
    console.log(chalk.cyan('Starting server...'));
    console.log();
    openBrowser(port, protocol);
  });
}

function run(port) {
  var protocol = process.env.HTTPS === 'true' ? "https" : "http";
  setupCompiler(port, protocol);
  runDevServer(port, protocol);

/*
  var protocol = process.env.HTTPS === 'true' ? "https" : "http";
  checkRequiredFiles();
  getUserInfo(protocol, port).then(userInfo => {
    injectUserInfo(userInfo);
    setupCompiler(port, protocol);
    runDevServer(port, protocol);
  }).catch(err => {
    console.error(`Failed obtaining oVirt auth token: ${err}`)
  })
*/
}

// We attempt to use the default port but if it is busy, we offer the user to
// run on a different port. `detect()` Promise resolves to the next free port.
detect(DEFAULT_PORT).then(port => {
  if (port === DEFAULT_PORT) {
    run(port);
    return;
  }

  clearConsole();
  var question =
    chalk.yellow('Something is already running on port ' + DEFAULT_PORT + '.') +
    '\n\nWould you like to run the app on another port instead?';

  prompt(question, true).then(shouldChangePort => {
    if (shouldChangePort) {
      run(port);
    }
  });
}).catch(err => {
    console.error(err);
});

function getUserInfo (protocol, port) {
  var engineUrl = process.env.ENGINE_URL;
  if (!engineUrl) {
    throw new Error('Please run script with the `ENGINE_URL` environment variable set.')
  }
  console.log(`Please authenticate against oVirt running at ${engineUrl}`);

  var DEFAULT_USER = 'admin@internal';
  var DEFAULT_DOMAIN = 'internal-authz';
  /**
   * This is value of user ID, please change it according to your system.
   * It can be found by `protocol://[engine_URL]/api/users/`, where
   * engine_URL - is oVirt engine URL.
   *
   * If userId will be null, then feature `Options` and SSH Public Key will
   * be disabled and hidden. 
   * @type {String}
   */
  var username = readlineSync.question(`oVirt user (${DEFAULT_USER}): `, {
    defaultInput: DEFAULT_USER
  });

  var password = readlineSync.question('oVirt password: ', {
    noEchoBack: true
  });

  var domain = readlineSync.question(`oVirt domain (${DEFAULT_DOMAIN}): `, {
    defaultInput: DEFAULT_DOMAIN
  });


  return new Promise((resolve, reject) => {
    request(`${engineUrl}/sso/oauth/token?` +
      'grant_type=urn:ovirt:params:oauth:grant-type:http&scope=ovirt-app-api', {
      json: true,
      auth: {
        user: username,
        pass: password,
      },
      strictSSL: false,
    }, (err, response, body) => {
      if (err) {
        return reject(err)
      }
      if (body['access_token']) {
        const usersApiUrl = `${engineUrl}/api/users`
        request(usersApiUrl, { json: true, strictSSL: false, headers: { Authorization: `Bearer ${body['access_token']}` } }, (userErr, userResponse, userBody) => {
          // This request not always return current user data, it may be caused by server error, or current user isn't administrator and have no permissions for that
          if (!userErr && userBody.user && userBody.user.length > 0 ) {
            for (let i in userBody.user) {
              if (userBody.user[i]['user_name'] === (username.slice(0, username.indexOf('@')) + '@' + domain)) {
                resolve({
                  userName: username.slice(0, username.indexOf('@')),
                  ssoToken: body.access_token,
                  domain: domain,
                  userId: userBody.user[i].id,
                })
                return
              }
            }
          }
          var userId = readlineSync.question(`oVirt user id (optional, it can be found at ${usersApiUrl}) : `, {
            defaultInput: null,
          });            
          resolve({
            userName: username.slice(0, username.indexOf('@')),
            ssoToken: body.access_token,
            domain: domain,
            userId: userId,
          })
        })
      } else {
        reject(JSON.stringify(body))
      }
    })
  });
}

function injectUserInfo (userInfo) {
  env['window.userInfo'] = JSON.stringify(userInfo);
}
