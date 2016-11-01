import React from 'react';

import {Cog, ResourceIcon} from '../utils';

import {angulars} from '../react-wrapper';

export const Rules = ({rules, metadata: {name, namespace}}) => {
  const rulesList = rules.map((rule, i) =>
    <div className="row co-resource-list__item" key={i}>
      <Rule {...rule} name={name} namespace={namespace} i={i} />
    </div>
  );

  return (
    <div>
      <hr />
      <h1 className="co-section-title">
        Rules
      </h1>
      <div className="co-m-table-grid co-m-table-grid--bordered">
        <div className="row co-m-table-grid__head">
          <div style={{marginLeft: 10}}>
            <div className="col-lg-2 col-md-3 col-sm-4 col-xs-2">
              Actions
            </div>
            <div className="col-lg-2 col-md-3 col-sm-4 col-xs-2">
              API Groups
            </div>
            <div className="col-lg-8 col-md-6 col-sm-4 col-xs-8">
              Resources
            </div>
          </div>
        </div>
        <div className="co-m-table-grid__body">
          {rulesList}
        </div>
      </div>
    </div>
  );
};

const Actions = ({verbs}) => {
  let actions = [];
  _.each(verbs, a => {
    if (a === '*') {
      actions = <div className="rbac-rule-row">All</div>;
      return false;
    }
    actions.push(<div className="rbac-rule-row" key={a}>{a}</div>);
  });
  return <div>{actions}</div>;
};

const Groups = ({apiGroups}) => {
  // defaults to [""]
  if (!apiGroups || !apiGroups[0]) {
    return <div className="rbac-rule-row" key={0}>core/v1</div>;
  }
  let groups = [];
  _.each(apiGroups, g => {
    if (g === '*') {
      groups = <div className="rbac-rule-row">All</div>;
      return false;
    }
    groups.push(<div className="rbac-rule-row" key={g}>{g}</div>);
  });
  return <div>{groups}</div>;
};

const Resources = ({resources, nonResourceURLs}) => {
  let allResources = [];
  resources && _.each([...new Set(resources)].sort(), r => {
    if (r === '*') {
      allResources = [<span key={r} className="rbac-rule-resource rbac-rule-row">All Resources</span>];
      return false;
    }
    const base = r.split('/')[0];
    const kind = _.find(angulars.kinds, k => k.plural === base);

    allResources.push(<span key={r} className="rbac-rule-resource rbac-rule-row">
      <ResourceIcon kind={kind ? kind.id : r} /> {r}
    </span>);
  });

  if (nonResourceURLs && nonResourceURLs.length) {
    if (allResources.length) {
      allResources.push(<hr key={'hr'} className="resource-separator" />);
    }
    let URLs = [];
    _.each(nonResourceURLs.sort(), r => {
      if (r === '*') {
        URLs = [<div className="rbac-rule-row" key={r}>All Non-resource URLs</div>];
        return false;
      }
      URLs.push(<div className="rbac-rule-row" key={r}>{r}</div>);
    });
    allResources.push.apply(allResources, URLs);
  }
  return <div>{allResources}</div>;
};

const DeleteRule = (name, namespace, i) => ({
  label: 'Delete Rule ...',
  callback: angulars.modal('confirm', {
    title: 'Delete Rule ',
    message: `Are you sure you want to delete Rule #${i}?`,
    btnText: 'Delete Rule',
    executeFn: () => () => {
      const kind = angulars.k8s[namespace ? 'roels' : 'clusterroles'];
      return kind.patch({metadata: {name, namespace}}, [{
        op: 'remove', path: `/rules/${i}`,
      }]);
    },
  })
});

const EditRule = (name, namespace, i) => ({
  label: 'Edit Rule ...',
  href: namespace ? `ns/${namespace}/roles/${name}/${i}/edit` : `clusterroles/${name}/${i}/edit`,
});

const RuleCog = ({name, namespace, i}) => {
  const options = [
    EditRule,
    DeleteRule,
  ].map(f => f(name, namespace, i));
  return <Cog options={options} size="small" anchor="left"></Cog>;
};

const Rule = ({resources, nonResourceURLs, verbs, apiGroups, name, namespace, i}) => <div className="rbac-rule">
  <div className="rbac-rule--cog">
    <RuleCog name={name} namespace={namespace} i={i} />
  </div>
  <div className="rbac-rule--rule">
    <div className="col-lg-2 col-md-3 col-sm-4 col-xs-4">
      <Actions verbs={verbs} />
    </div>
    <div className="col-lg-2 col-md-3 col-sm-4 col-xs-4">
      <Groups apiGroups={apiGroups} />
    </div>
    <div className="col-lg-8 col-md-6 col-sm-4 col-xs-8">
      <Resources resources={resources} nonResourceURLs={nonResourceURLs} />
    </div>
  </div>
</div>;