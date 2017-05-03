const Immutable = require('immutable');

import {types} from './k8s-actions';
import {getQN} from './k8s';

const moreRecent = (a, b) => {
  const metaA  = a.get('metadata').toJSON();
  const metaB  = b.get('metadata').toJSON();
  if (metaA.uid !== metaB.uid) {
    return new Date(metaA.creationTimestamp) > new Date(metaB.creationTimestamp);
  }
  return parseInt(metaA.resourceVersion, 10) > parseInt(metaB.resourceVersion, 10);
};

const removeFromList = (list, resource) => {
  const qualifiedName = getQN(resource);
  // eslint-disable-next-line no-console
  console.log(`deleting ${qualifiedName}`);
  return list.delete(qualifiedName);
};

const updateList = (list, resource) => {
  const qualifiedName = getQN(resource);
  const current = list.get(qualifiedName);
  const next = Immutable.fromJS(resource);

  if (!current) {
    return list.set(qualifiedName, next);
  }

  if (!moreRecent(next, current)) {
    return list;
  }

  return list.set(qualifiedName, next);
};

const loadList = (list, resources) => {
  // TODO: not supported in ie :(
  const existingKeys = new Set(list.keys());
  return list.withMutations(list => {
    (resources || []).forEach(r => {
      const qualifiedName = getQN(r);
      existingKeys.delete(qualifiedName);
      const next = Immutable.fromJS(r);
      const current = list.get(qualifiedName);
      if (!current || moreRecent(next, current)) {
        list.set(qualifiedName, next);
      }
    });
    existingKeys.forEach(k => {
      const r = list.get(k);
      if (!r.getIn(['metadata', 'deletionTimestamp'])) {
        return;
      }
      list.delete(k);
    });
  });
};

export default (state, action)  => {
  if (!state) {
    return Immutable.Map();
  }
  const {k8sObjects, id} = action;
  const list = state.getIn([id, 'data']);

  let newList;

  switch (action.type) {
    case 'models':
      return state.set('MODELS', action.models);

    case types.resources:
      return state.set('RESOURCES', action.resources);

    case types.filterList:
      return state.setIn([id, 'filters', action.name], action.value);

    case types.watchK8sObject:
      return state.set(id, Immutable.Map({
        loadError: '',
        loaded: false,
        data: {},
      }));

    case types.modifyObject:
      return state.mergeIn([id], {
        loadError: '',
        loaded: true,
        data: k8sObjects,
      });

    case types.watchK8sList:
      if (list) {
        return state;
      }

      return state.set(id, Immutable.Map({
        loadError: '',
        // has the data set been loaded successfully
        loaded: false,
        // Canonical data
        data: Immutable.Map(),
        // client side filters to be applied externally (ie, we keep all data intact)
        filters: Immutable.Map(),
        // The name of an element in the list that has been "selected"
        selected: null,
      }));

    case types.stopK8sWatch:
      return state.delete(id);

    case types.loaded:
      if (!list) {
        return state;
      }
      // eslint-disable-next-line no-console
      console.info(`loaded ${id}`);
      state = state.mergeDeep({
        [id]: {loaded: true, loadError: ''}
      });
      newList = loadList(list, k8sObjects);
      break;
    case types.deleteFromList:
      if (!list) {
        return state;
      }
      newList = removeFromList(list, k8sObjects);
      break;
    case types.addToList:
    case types.modifyList:
      if (!list) {
        return state;
      }
      newList = updateList(list, k8sObjects);
      break;
    case types.errored:
      if (!list) {
        return state;
      }
      return state.mergeDeep({
        [id]: {
          'loadError': k8sObjects,
          'data': {},
          'loaded': false
        }
      });
  }
  return state.setIn([id, 'data'], newList);
};