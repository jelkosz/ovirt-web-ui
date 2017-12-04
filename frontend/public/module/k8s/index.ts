/* eslint-disable no-undef */

export * from './discover-service.js';
export * from './enum';
export * from './job';
export * from './k8s';
export * from './node';
export * from './pods';
export * from './resource';
export { modelFor, allModels, referenceFor, referenceForCRD, referenceForModel, kindForReference, referenceForOwnerRef } from './k8s-models';

export type OwnerReference = {
  name: string;
  kind: string;
  uid: string;
  apiVersion: string;
};

export type K8sResourceKind = {
  apiVersion: string;
  kind: string;
  metadata: {
    annotations?: {[key: string]: string},
    name: string,
    namespace?: string,
    labels?: {[key: string]: string},
    ownerReferences?: OwnerReference[],
    [key: string]: any,
  };
  spec?: {
    selector?: {
      matchLabels?: {[key: string]: any},
    },
    [key: string]: any
  };
  status?: {[key: string]: any};
};

export type CustomResourceDefinitionKind = {
  spec: {
    version: string;
    group: string;
    names: {
      kind: string;
      singular: string;
      plural: string;
      listKind: string;
      shortNames?: string[];
    };
    scope?: 'Namespaced';
  }
} & K8sResourceKind;

export type K8sKind = {
  abbr: string;
  kind: string;
  label: string;
  labelPlural: string;
  path: string;
  plural: string;

  id?: string;
  crd?: boolean;
  apiVersion?: string;
  group?: string;
  basePath?: string;
  namespaced?: boolean;
  selector?: {matchLabels?: {[key: string]: string}};
  labels?: {[key: string]: string};
  annotations?: {[key: string]: string};
};

// Change this to a regex-type if it ever becomes a thing (https://github.com/Microsoft/TypeScript/issues/6579)
export type K8sFullyQualifiedResourceReference = string;

/**
 * The canonical, unique identifier for a Kubernetes resource type.
 * Maintains backwards-compatibility with references using the `kind` string field.
 */
export type K8sResourceKindReference = K8sFullyQualifiedResourceReference | string;