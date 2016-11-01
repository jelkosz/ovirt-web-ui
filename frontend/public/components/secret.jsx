import React from 'react';

import {angulars} from './react-wrapper';
import {makeDetailsPage, makeListPage, makeList} from './factory';
import ConfigMapAndSecretData from './configmap-and-secret-data';
import {Cog, LabelList, ResourceIcon, Timestamp, detailsPage} from './utils';
import classnames from 'classnames';


const SecretCog = ({secret}) => {
  const kind = angulars.kinds.SECRET;
  const {factory: {ModifyLabels, Delete}} = Cog;
  return <Cog options={[ModifyLabels, Delete].map(f => f(kind, secret))} size="small" anchor="left"></Cog>;
};

const SecretHeader = () => <div className="row co-m-table-grid__head">
  <div className="col-md-4">Secret Name</div>
  <div className="col-md-4">Secret Data</div>
  <div className="col-md-4">Secret Age</div>
</div>;

const SecretRow = ({obj: secret}) => {
  const data = Object.keys(secret.data || {}).length;
  const age = moment(secret.metadata.creationTimestamp).fromNow();

  return <div className="row co-resource-list__item">
    <div className="col-md-4">
      <SecretCog secret={secret}></SecretCog>
      <ResourceIcon kind="secret"></ResourceIcon>
      <a href={`ns/${secret.metadata.namespace}/secrets/${secret.metadata.name}/details`} title={secret.metadata.uid}>{secret.metadata.name}</a>
    </div>
    <div className="col-md-4">{data}</div>
    <div className="col-md-4">{age}</div>
  </div>;
};

const SecretDetails = (secret) => {
  return <div className="col-md-12">
    <div className="co-m-pane">
      <div className="co-m-pane__body">
        <dl>
          <dt>Name</dt>
          <dd>{secret.metadata.name}</dd>
          <dt>Labels</dt>
          <dd><LabelList kind="secret" labels={secret.metadata.labels} /></dd>
          <dt>Created At</dt>
          <dd><Timestamp timestamp={secret.metadata.creationTimestamp} /></dd>
        </dl>
      </div>

      <div></div>

      <div className="co-m-pane__heading">
        <h1 className="co-m-pane__title">Data</h1>
      </div>
      <div className="co-m-pane__body">
        <ConfigMapAndSecretData data={secret.data} decode={window.atob} />
      </div>
    </div>
  </div>;
};

const withSecretsList = (Row) => {
  return class WithSecretsList extends React.Component {
    constructor (props) {
      super(props);
      this.state = {open: false};
    }

    onClick_ (e) {
      e.preventDefault();
      this.setState({open: !this.state.open});
    }

    render () {
      const {obj: {metadata: {namespace}, secrets}} = this.props;
      const filters = {selector: {field: 'metadata.name', values: new Set(_.map(secrets, 'name'))}};

      return (
        <div onClick={this.onClick_.bind(this)} ref="target" className={classnames({clickable: !!secrets})} >
          <Row {...this.props} />
          {
            this.state.open && secrets &&
            <SecretsList namespace={namespace} filters={filters}></SecretsList>
          }
        </div>
      );
    }
  };
};

const pages = [{href: 'details', name: 'Details', component: detailsPage(SecretDetails)}];

const SecretsList = makeList('Secrets', 'SECRET', SecretHeader, SecretRow);
const SecretsPage = makeListPage('SecretsPage', 'SECRET', SecretsList);
const SecretsDetailsPage = makeDetailsPage('SecretsDetailsPage', 'SECRET', pages);

export {SecretsList, SecretsPage, SecretsDetailsPage, withSecretsList};