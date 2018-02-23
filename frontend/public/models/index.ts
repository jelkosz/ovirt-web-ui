// eslint-disable-next-line no-unused-vars
import { K8sKind } from '../module/k8s';

export const UICatalogEntryModel: K8sKind = {
  kind: 'UICatalogEntry-v1',
  label: 'UICatalogEntry-v1',
  labelPlural: 'UICatalogEntry-v1s',
  apiGroup: 'app.coreos.com',
  apiVersion: 'v1alpha1',
  path: 'uicatalogentry-v1s',
  abbr: 'CE',
  namespaced: true,
  crd: true,
  plural: 'uicatalogentry-v1s',
};

export const ClusterServiceVersionModel: K8sKind = {
  kind: 'ClusterServiceVersion-v1',
  label: 'Application',
  labelPlural: 'Applications',
  apiGroup: 'app.coreos.com',
  apiVersion: 'v1alpha1',
  path: 'clusterserviceversion-v1s',
  abbr: 'CSV',
  namespaced: true,
  crd: true,
  plural: 'clusterserviceversion-v1s',
  propagationPolicy : 'Foreground',
};

export const InstallPlanModel: K8sKind = {
  kind: 'InstallPlan-v1',
  label: 'InstallPlan-v1',
  labelPlural: 'InstallPlan-v1s',
  apiGroup: 'app.coreos.com',
  apiVersion: 'v1alpha1',
  path: 'installplan-v1s',
  abbr: 'IP',
  namespaced: true,
  crd: true,
  plural: 'installplan-v1s',
};

export const SubscriptionModel: K8sKind = {
  kind: 'Subscription-v1',
  label: 'Subscription-v1',
  labelPlural: 'Subscription-v1s',
  apiGroup: 'app.coreos.com',
  apiVersion: 'v1alpha1',
  path: 'subscription-v1s',
  abbr: 'SUB',
  namespaced: true,
  crd: true,
  plural: 'subscription-v1s',
};

export const EtcdClusterModel: K8sKind = {
  kind: 'EtcdCluster',
  label: 'etcd Cluster',
  labelPlural: 'Etcd Clusters',
  apiGroup: 'etcd.database.coreos.com',
  apiVersion: 'v1beta2',
  path: 'etcdclusters',
  abbr: 'EC',
  namespaced: true,
  crd: true,
  plural: 'etcdclusters',
  propagationPolicy : 'Foreground',
};

export const PrometheusModel: K8sKind = {
  kind: 'Prometheus',
  label: 'Prometheus',
  labelPlural: 'Prometheuses',
  apiGroup: 'monitoring.coreos.com',
  apiVersion: 'v1',
  path: 'prometheuses',
  abbr: 'PI',
  namespaced: true,
  crd: true,
  plural: 'prometheuses',
  propagationPolicy : 'Foreground',
};

export const ServiceMonitorModel: K8sKind = {
  kind: 'ServiceMonitor',
  label: 'Service Monitor',
  labelPlural: 'Service Monitors',
  apiGroup: 'monitoring.coreos.com',
  apiVersion: 'v1',
  path: 'servicemonitors',
  abbr: 'SM',
  namespaced: true,
  crd: true,
  plural: 'servicemonitors',
  propagationPolicy : 'Foreground',
};

export const AlertmanagerModel: K8sKind = {
  kind: 'Alertmanager',
  label: 'Alertmanager',
  labelPlural: 'Alertmanagers',
  apiGroup: 'monitoring.coreos.com',
  apiVersion: 'v1',
  path: 'alertmanagers',
  abbr: 'AM',
  namespaced: true,
  crd: true,
  plural: 'alertmanagers',
  propagationPolicy : 'Foreground',
};

export const VaultServiceModel: K8sKind = {
  kind: 'VaultService',
  label: 'VaultService',
  labelPlural: 'VaultServices',
  apiGroup: 'vault.security.coreos.com',
  apiVersion: 'v1alpha1',
  path: 'vaultservices',
  abbr: 'VS',
  namespaced: true,
  crd: true,
  plural: 'vaultservices',
  propagationPolicy : 'Foreground',
};

export const ClusterModel: K8sKind = {
  kind: 'Cluster',
  label: 'Cluster',
  labelPlural: 'Clusters',
  apiGroup: 'multicluster.coreos.com',
  path: 'clusters',
  apiVersion: 'v1',
  crd: true,
  plural: 'clusters',
  abbr: 'C',
  namespaced: false,
};

export const ChargebackReportModel: K8sKind = {
  kind: 'Report',
  label: 'Report',
  labelPlural: 'Reports',
  apiGroup: 'chargeback.coreos.com',
  path: 'reports',
  apiVersion: 'v1alpha1',
  crd: true,
  plural: 'reports',
  abbr: 'R',
  namespaced: true,
};

export const ServiceModel: K8sKind = {
  apiVersion: 'v1',
  legacy: true,
  label: 'Service',
  path: 'services',
  plural: 'services',
  abbr: 'S',
  namespaced: true,
  kind: 'Service',
  id: 'service',
  labelPlural: 'Services'
};

export const PodModel: K8sKind = {
  apiVersion: 'v1',
  legacy: true,
  label: 'Pod',
  path: 'pods',
  plural: 'pods',
  abbr: 'P',
  namespaced: true,
  kind: 'Pod',
  id: 'pod',
  labelPlural: 'Pods'
};

export const ContainerModel: K8sKind = {
  apiVersion: 'v1',
  legacy: true,
  label: 'Container',
  path: 'containers',
  plural: 'containers',
  abbr: 'C',
  kind: 'Container',
  id: 'container',
  labelPlural: 'Containers'
};

export const DaemonSetModel: K8sKind = {
  label: 'Daemon Set',
  path: 'daemonsets',
  apiGroup: '',
  plural: 'daemonsets',
  apiVersion: 'apps/v1beta2',
  abbr: 'DS',
  namespaced: true,
  propagationPolicy: 'Foreground',
  kind: 'DaemonSet',
  id: 'daemonset',
  labelPlural: 'Daemon Sets'
};

export const ReplicationControllerModel: K8sKind = {
  apiVersion: 'v1',
  legacy: true,
  label: 'Replication Controller',
  path: 'replicationcontrollers',
  plural: 'replicationcontrollers',
  abbr: 'RC',
  namespaced: true,
  propagationPolicy: 'Foreground',
  kind: 'ReplicationController',
  id: 'replicationcontroller',
  labelPlural: 'Replication Controllers'
};

export const HorizontalPodAutoscalerModel: K8sKind = {
  label: 'Horizontal Pod Autoscaler',
  path: 'horizontalpodautoscalers',
  plural: 'horizontalpodautoscalers',
  apiVersion: 'autoscaling/v1',
  apiGroup: '',
  abbr: 'HPA',
  kind: 'HorizontalPodAutoscaler',
  id: 'horizontalpodautoscaler',
  labelPlural: 'Horizontal Pod Autoscalers'
};

export const ServiceAccountModel: K8sKind = {
  apiVersion: 'v1',
  legacy: true,
  label: 'Service Account',
  path: 'serviceaccounts',
  plural: 'serviceaccounts',
  abbr: 'SA',
  namespaced: true,
  kind: 'ServiceAccount',
  id: 'serviceaccount',
  labelPlural: 'Service Accounts'
};

export const ReplicaSetModel: K8sKind = {
  label: 'Replica Set',
  apiVersion: 'apps/v1beta2',
  path: 'replicasets',
  apiGroup: '',
  plural: 'replicasets',
  abbr: 'RS',
  namespaced: true,
  propagationPolicy: 'Foreground',
  kind: 'ReplicaSet',
  id: 'replicaset',
  labelPlural: 'Replica Sets'
};

export const DeploymentModel: K8sKind = {
  label: 'Deployment',
  apiVersion: 'apps/v1beta2',
  path: 'deployments',
  apiGroup: '',
  plural: 'deployments',
  abbr: 'D',
  namespaced: true,
  propagationPolicy: 'Foreground',
  kind: 'Deployment',
  id: 'deployment',
  labelPlural: 'Deployments'
};

export const JobModel: K8sKind = {
  label: 'Job',
  apiVersion: 'batch/v1',
  path: 'jobs',
  apiGroup: '',
  plural: 'jobs',
  abbr: 'J',
  namespaced: true,
  propagationPolicy: 'Foreground',
  kind: 'Job',
  id: 'job',
  labelPlural: 'Jobs'
};

export const NodeModel: K8sKind = {
  apiVersion: 'v1',
  legacy: true,
  label: 'Node',
  path: 'nodes',
  plural: 'nodes',
  abbr: 'N',
  kind: 'Node',
  id: 'node',
  labelPlural: 'Nodes'
};

export const EventModel: K8sKind = {
  apiVersion: 'v1',
  legacy: true,
  label: 'Event',
  path: 'events',
  plural: 'events',
  abbr: 'E',
  namespaced: true,
  kind: 'Event',
  id: 'event',
  labelPlural: 'Events'
};

export const ComponentStatusModel: K8sKind = {
  apiVersion: 'v1',
  legacy: true,
  label: 'Component Status',
  labelPlural: 'Component Statuses',
  path: 'componentstatuses',
  plural: 'componentstatuses',
  abbr: 'CS',
  kind: 'ComponentStatus',
  id: 'componentstatus'
};

export const NamespaceModel: K8sKind = {
  apiVersion: 'v1',
  legacy: true,
  label: 'Namespace',
  path: 'namespaces',
  plural: 'namespaces',
  abbr: 'N',
  kind: 'Namespace',
  id: 'namespace',
  labelPlural: 'Namespaces'
};

export const IngressModel: K8sKind = {
  label: 'Ingress',
  labelPlural: 'Ingresses',
  apiGroup: 'extensions',
  apiVersion: 'v1beta1',
  path: 'ingresses',
  plural: 'ingresses',
  abbr: 'I',
  namespaced: true,
  kind: 'Ingress',
  id: 'ingress'
};

export const ConfigMapModel: K8sKind = {
  apiVersion: 'v1',
  legacy: true,
  label: 'Config Map',
  path: 'configmaps',
  plural: 'configmaps',
  abbr: 'CM',
  namespaced: true,
  kind: 'ConfigMap',
  id: 'configmap',
  labelPlural: 'Config Maps'
};

export const SecretModel: K8sKind = {
  apiVersion: 'v1',
  legacy: true,
  label: 'Secret',
  path: 'secrets',
  plural: 'secrets',
  abbr: 'S',
  namespaced: true,
  kind: 'Secret',
  id: 'secret',
  labelPlural: 'Secrets'
};

export const ClusterRoleBindingModel: K8sKind = {
  label: 'Cluster Role Binding',
  apiGroup: 'rbac.authorization.k8s.io',
  apiVersion: 'v1beta1',
  path: 'clusterrolebindings',
  plural: 'clusterrolebindings',
  abbr: 'CRB',
  kind: 'ClusterRoleBinding',
  id: 'clusterrolebinding',
  labelPlural: 'Cluster Role Bindings'
};

export const ClusterRoleModel: K8sKind = {
  label: 'Cluster Role',
  apiGroup: 'rbac.authorization.k8s.io',
  apiVersion: 'v1beta1',
  path: 'clusterroles',
  plural: 'clusterroles',
  abbr: 'CR',
  kind: 'ClusterRole',
  id: 'clusterrole',
  labelPlural: 'Cluster Roles'
};

export const RoleBindingModel: K8sKind = {
  label: 'Role Binding',
  apiGroup: 'rbac.authorization.k8s.io',
  apiVersion: 'v1beta1',
  path: 'rolebindings',
  plural: 'rolebindings',
  abbr: 'RB',
  namespaced: true,
  kind: 'RoleBinding',
  id: 'rolebinding',
  labelPlural: 'Role Bindings'
};

export const RoleModel: K8sKind = {
  label: 'Role',
  apiGroup: 'rbac.authorization.k8s.io',
  apiVersion: 'v1beta1',
  path: 'roles',
  plural: 'roles',
  abbr: 'R',
  namespaced: true,
  kind: 'Role',
  id: 'role',
  labelPlural: 'Roles'
};

export const TectonicVersionModel: K8sKind = {
  label: 'Tectonic Version',
  apiGroup: 'tco.coreos.com',
  apiVersion: 'v1',
  path: 'tectonicversions',
  plural: 'tectonicversions',
  abbr: 'TV',
  namespaced: true,
  kind: 'TectonicVersion',
  id: 'tectonicversion',
  labelPlural: 'Tectonic Versions'
};

export const ChannelOperatorConfigModel: K8sKind = {
  label: 'Channel Operator Config',
  apiGroup: 'tco.coreos.com',
  apiVersion: 'v1',
  path: 'channeloperatorconfigs',
  plural: 'channeloperatorconfigs',
  abbr: 'COC',
  namespaced: true,
  kind: 'ChannelOperatorConfig',
  id: 'channeloperatorconfig',
  labelPlural: 'Channel Operator Configs'
};

export const AppVersionModel: K8sKind = {
  label: 'AppVersion',
  apiGroup: 'tco.coreos.com',
  apiVersion: 'v1',
  path: 'appversions',
  plural: 'appversions',
  abbr: 'AV',
  namespaced: true,
  kind: 'AppVersion',
  id: 'appversion',
  labelPlural: 'AppVersions'
};

export const PersistentVolumeModel: K8sKind = {
  label: 'Persistent Volume',
  apiVersion: 'v1',
  legacy: true,
  path: 'persistentvolumes',
  plural: 'persistentvolumes',
  abbr: 'PV',
  kind: 'PersistentVolume',
  id: 'persistentvolume',
  labelPlural: 'Persistent Volumes'
};

export const PersistentVolumeClaimModel: K8sKind = {
  label: 'Persistent Volume Claim',
  apiVersion: 'v1',
  legacy: true,
  path: 'persistentvolumeclaims',
  plural: 'persistentvolumeclaims',
  abbr: 'PVC',
  namespaced: true,
  kind: 'PersistentVolumeClaim',
  id: 'persistentvolumeclaim',
  labelPlural: 'Persistent Volume Claims'
};

export const PetsetModel: K8sKind = {
  apiVersion: 'v1',
  legacy: true,
  label: 'Petset',
  plural: 'petsets',
  abbr: 'PS',
  path: 'petsets',
  propagationPolicy: 'Foreground',
  kind: 'Petset',
  id: 'petset',
  labelPlural: 'Petsets'
};

export const StatefulSetModel: K8sKind = {
  label: 'Stateful Set',
  apiGroup: '',
  apiVersion: 'apps/v1beta2',
  path: 'statefulsets',
  plural: 'statefulsets',
  abbr: 'SS',
  namespaced: true,
  propagationPolicy: 'Foreground',
  kind: 'StatefulSet',
  id: 'statefulset',
  labelPlural: 'Stateful Sets'
};

export const ResourceQuotaModel: K8sKind = {
  label: 'Resource Quota',
  apiVersion: 'v1',
  legacy: true,
  path: 'resourcequotas',
  plural: 'resourcequotas',
  abbr: 'RQ',
  namespaced: true,
  kind: 'ResourceQuota',
  id: 'resourcequota',
  labelPlural: 'Resource Quotas'
};

export const NetworkPolicyModel: K8sKind = {
  label: 'Network Policy',
  labelPlural: 'Network Policies',
  apiVersion: 'v1',
  apiGroup: 'networking.k8s.io',
  path: 'networkpolicies',
  plural: 'networkpolicies',
  abbr: 'NP',
  namespaced: true,
  kind: 'NetworkPolicy',
  id: 'networkpolicy'
};

export const PodVulnModel: K8sKind = {
  apiVersion: 'v1',
  legacy: true,
  label: 'Pod Vuln',
  labelPlural: 'Pod Vulns',
  path: 'podvulns',
  plural: 'podvulns',
  abbr: 'V',
  namespaced: true,
  kind: 'PodVuln',
  id: 'podvuln'
};

// const starModel: K8sKind = {
//   id: 'all',
//   plural: 'all',
//   labelPlural: 'All',
//   abbr: '*',
//   kind: '*'
// };
// export {starModel as Model};

export const CustomResourceDefinitionModel: K8sKind = {
  label: 'Custom Resource Definition',
  apiGroup: 'apiextensions.k8s.io',
  apiVersion: 'v1beta1',
  path: 'customresourcedefinitions',
  abbr: 'CRD',
  namespaced: false,
  plural: 'customresourcedefinitions',
  kind: 'CustomResourceDefinition',
  id: 'customresourcedefinition',
  labelPlural: 'Custom Resource Definitions'
};

export const CronJobModel: K8sKind = {
  label: 'Cron Job',
  apiVersion: 'batch/v1beta1',
  path: 'cronjobs',
  apiGroup: '',
  plural: 'cronjobs',
  abbr: 'CJ',
  namespaced: true,
  kind: 'CronJob',
  id: 'cronjob',
  labelPlural: 'Cron Jobs'
};

export const StorageClassModel: K8sKind = {
  label: 'Storage Class',
  labelPlural: 'Storage Classes',
  apiVersion: 'v1',
  path: 'storageclasses',
  apiGroup: 'storage.k8s.io',
  plural: 'storageclasses',
  abbr: 'SC',
  namespaced: false,
  kind: 'StorageClass',
  id: 'storageclass'
};