package server

import (
	"bytes"
	"encoding/base64"
	"errors"
	"fmt"
	"html/template"
	"io"
	"net/http"
	"net/url"
	"os"
	"path"
	"strconv"
	"time"

	"github.com/coreos/pkg/capnslog"
	"github.com/coreos/pkg/health"

	"github.com/coreos-inc/bridge/auth"
	"github.com/coreos-inc/bridge/pkg/proxy"
	"github.com/coreos-inc/bridge/version"
)

const (
	BridgeAPIVersion      = "v1"
	K8sAPIVersion         = "v1"
	IndexPageTemplateName = "index.html"

	AuthLoginEndpoint         = "/auth/login"
	AuthLoginCallbackEndpoint = "/auth/callback"
	AuthLoginSuccessEndpoint  = "/"
	AuthLoginErrorEndpoint    = "/error"
	AuthLogoutEndpoint        = "/auth/logout"
)

var (
	plog = capnslog.NewPackageLogger("github.com/coreos-inc/bridge", "server")
)

type jsGlobals struct {
	K8sAPIVersion   string `json:"k8sAPIVersion"`
	AuthDisabled    bool   `json:"authDisabled"`
	KubectlClientID string `json:"kubectlClientID"`
	BasePath        string `json:"basePath"`
	LoginURL        string `json:"loginURL"`
	LoginSuccessURL string `json:"loginSuccessURL"`
	LoginErrorURL   string `json:"loginErrorURL"`
	LogoutURL       string `json:"logoutURL"`
}

type Server struct {
	K8sProxyConfig     *proxy.Config
	DexProxyConfig     *proxy.Config
	BaseURL            *url.URL
	PublicDir          string
	TectonicVersion    string
	TectonicTier       string
	TectonicExpiration time.Time
	Auther             *auth.Authenticator
	KubectlClientID    string

	// Helpers for logging into kubectl and rendering kubeconfigs. These fields
	// may be nil.
	KubectlAuther  *auth.Authenticator
	KubeConfigTmpl *KubeConfigTmpl
}

func (s *Server) AuthDisabled() bool {
	return s.Auther == nil
}

func (s *Server) HTTPHandler() http.Handler {
	mux := http.NewServeMux()

	var k8sHandler http.Handler = proxy.NewProxy(s.K8sProxyConfig)
	if !s.AuthDisabled() {
		k8sHandler = authMiddleware(s.Auther, k8sHandler)
	}
	handle := func(path string, handler http.Handler) {
		mux.Handle(proxy.SingleJoiningSlash(s.BaseURL.Path, path), handler)
	}
	handleFunc := func(path string, handler http.HandlerFunc) { handle(path, handler) }

	handle("/api/kubernetes/", http.StripPrefix(proxy.SingleJoiningSlash(s.BaseURL.Path, "/api/kubernetes/"), k8sHandler))

	if !s.AuthDisabled() {
		handleFunc(AuthLoginEndpoint, s.Auther.LoginFunc)
		handleFunc(AuthLogoutEndpoint, s.Auther.LogoutFunc)
		handleFunc(AuthLoginCallbackEndpoint, s.Auther.CallbackFunc)

		if s.KubectlAuther != nil {
			handleFunc("/api/tectonic/kubectl/code", s.KubectlAuther.LoginFunc)
			handleFunc("/api/tectonic/kubectl/config", s.handleRenderKubeConfig)
		}
	}

	if s.DexProxyConfig != nil {
		handle("/api/dex/", http.StripPrefix(proxy.SingleJoiningSlash(s.BaseURL.Path, "/api/dex/"), proxy.NewProxy(s.DexProxyConfig)))
	}

	handleFunc("/api/", notFoundHandler)

	staticHandler := http.StripPrefix(proxy.SingleJoiningSlash(s.BaseURL.Path, "/static/"), http.FileServer(http.Dir(s.PublicDir)))
	handle("/static/", staticHandler)

	handleFunc("/health", health.Checker{
		Checks: []health.Checkable{},
	}.ServeHTTP)

	useVersionHandler := s.versionHandler
	if !s.AuthDisabled() {
		useVersionHandler = authMiddleware(s.Auther, http.HandlerFunc(s.versionHandler))
	}
	handleFunc("/version", useVersionHandler)

	mux.HandleFunc(s.BaseURL.Path, s.indexHandler)

	return http.Handler(mux)
}

type apiError struct {
	Err string `json:"error"`
}

func (s *Server) handleRenderKubeConfig(w http.ResponseWriter, r *http.Request) {
	statusCode, err := func() (int, error) {
		if r.Method != "POST" {
			return http.StatusMethodNotAllowed, errors.New("not found")
		}
		if s.KubeConfigTmpl == nil {
			return http.StatusNotImplemented, errors.New("Kubeconfig generation not configured.")
		}
		oauth2Code := r.FormValue("code")
		if oauth2Code == "" {
			return http.StatusBadRequest, errors.New("No 'code' form value provided.")
		}

		token, err := s.KubectlAuther.ExchangeAuthCode(oauth2Code)
		if err != nil {
			return http.StatusInternalServerError, fmt.Errorf("Failed to exchange auth token: %v", err)
		}
		buff := new(bytes.Buffer)
		if err := s.KubeConfigTmpl.Execute(buff, token.IDToken, token.RefreshToken); err != nil {
			return http.StatusInternalServerError, fmt.Errorf("Failed to render kubeconfig: %v", err)
		}
		w.Header().Set("Content-Length", strconv.Itoa(buff.Len()))
		buff.WriteTo(w)
		return 0, nil
	}()
	if err != nil {
		sendResponse(w, statusCode, apiError{err.Error()})
	}
}

func (s *Server) indexHandler(w http.ResponseWriter, r *http.Request) {
	jsg := &jsGlobals{
		K8sAPIVersion:   K8sAPIVersion,
		AuthDisabled:    s.AuthDisabled(),
		KubectlClientID: s.KubectlClientID,
		BasePath:        s.BaseURL.Path,
		LoginURL:        proxy.SingleJoiningSlash(s.BaseURL.String(), AuthLoginEndpoint),
		LoginSuccessURL: proxy.SingleJoiningSlash(s.BaseURL.String(), AuthLoginSuccessEndpoint),
		LoginErrorURL:   proxy.SingleJoiningSlash(s.BaseURL.String(), AuthLoginErrorEndpoint),
		LogoutURL:       proxy.SingleJoiningSlash(s.BaseURL.String(), AuthLogoutEndpoint),
	}
	tpl := template.New(IndexPageTemplateName)
	tpl.Delims("[[", "]]")
	tpls, err := tpl.ParseFiles(path.Join(s.PublicDir, IndexPageTemplateName))
	if err != nil {
		fmt.Printf("index.html not found in configured public-dir path: %v", err)
		os.Exit(1)
	}

	if err := tpls.ExecuteTemplate(w, IndexPageTemplateName, jsg); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func (s *Server) versionHandler(w http.ResponseWriter, r *http.Request) {
	sendResponse(w, http.StatusOK, struct {
		Version        string    `json:"version"`
		ConsoleVersion string    `json:"consoleVersion"`
		Tier           string    `json:"tier"`
		Expiration     time.Time `json:"expiration"`
	}{
		Version:        s.TectonicVersion,
		ConsoleVersion: version.Version,
		Tier:           s.TectonicTier,
		Expiration:     s.TectonicExpiration,
	})
}

func notFoundHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusNotFound)
	w.Write([]byte("not found"))
}

// KubeConfigTmpl is a template which can be rendered into kubectl config file
// ready to talk to a tectonic installation.
type KubeConfigTmpl struct {
	clientID     string
	clientSecret string

	k8sURL           string
	k8sCAPEMBase64ed string

	dexURL           string
	dexCAPEMBase64ed string
}

// NewKubeConfigTmpl takes the necessary arguments required to create a KubeConfigTmpl.
func NewKubeConfigTmpl(clientID, clientSecret, k8sURL, dexURL string, k8sCA, dexCA []byte) *KubeConfigTmpl {
	encode := func(b []byte) string {
		if b == nil {
			return ""
		}
		return base64.StdEncoding.EncodeToString(b)
	}
	return &KubeConfigTmpl{
		clientID:         clientID,
		clientSecret:     clientSecret,
		k8sURL:           k8sURL,
		dexURL:           dexURL,
		k8sCAPEMBase64ed: encode(k8sCA),
		dexCAPEMBase64ed: encode(dexCA),
	}
}

// Execute renders a kubectl config file unqiue to an authentication session.
func (k *KubeConfigTmpl) Execute(w io.Writer, idToken, refreshToken string) error {
	data := kubeConfigTmplData{
		K8sCA:        k.k8sCAPEMBase64ed,
		K8sURL:       k.k8sURL,
		DexCA:        k.dexCAPEMBase64ed,
		DexURL:       k.dexURL,
		ClientID:     k.clientID,
		ClientSecret: k.clientSecret,
		IDToken:      idToken,
		RefreshToken: refreshToken,
	}
	return kubeConfigTmpl.Execute(w, data)
}

type kubeConfigTmplData struct {
	K8sCA, K8sURL          string
	DexCA, DexURL          string
	ClientID, ClientSecret string
	IDToken                string
	RefreshToken           string
}

var kubeConfigTmpl = template.Must(template.New("kubeConfig").Parse(`apiVersion: v1
kind: Config

clusters:
- cluster:
    server: {{ .K8sURL }}{{ if .K8sCA }}
    certificate-authority-data: {{ .K8sCA }}{{ end }}
  name: tectonic

users:
- name: tectonic-oidc
  user:
    auth-provider:
      config:
        client-id: {{ .ClientID }}
        client-secret: {{ .ClientSecret }}
        id-token: {{ .IDToken }}{{ if .DexCA }}
        idp-certificate-authority-data: {{ .DexCA }}{{ end }}
        idp-issuer-url: {{ .DexURL }}
        refresh-token: {{ .RefreshToken }}
      name: oidc

preferences: {}

contexts:
- context:
    cluster: tectonic
    user: tectonic-oidc
  name: tectonic

current-context: tectonic
`))

// DirectorFromTokenExtractor creates a new reverse proxy director
// that rewrites the Authorization header of the request using the
// tokenExtractor parameter.
// (see https://golang.org/src/net/http/httputil/reverseproxy.go?s=778:806)
func DirectorFromTokenExtractor(config *proxy.Config, tokenExtractor func(*http.Request) (string, error)) func(*http.Request) {
	return func(r *http.Request) {
		// At this writing, the only errors we can get from TokenExtractor
		// are benign and correct variations on "no token found"
		token, err := tokenExtractor(r)
		if err != nil {
			plog.Errorf("Received an error while extracting token: %v", err)
		} else {
			r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))
		}

		// The header removal must happen after the token extraction
		// because the token extraction relies on the `Cookie` header,
		// which also happens to be the header that is removed.
		for _, h := range config.HeaderBlacklist {
			r.Header.Del(h)
		}

		r.Host = config.Endpoint.Host
		r.URL.Host = config.Endpoint.Host
		r.URL.Path = proxy.SingleJoiningSlash(config.Endpoint.Path, r.URL.Path)
		r.URL.Scheme = config.Endpoint.Scheme
	}
}