import { getKey } from '../common';
import createGuid from '../../utils/guid';

export function getChildren(item) : Object[] {

  if (item['#array'] !== undefined) {
    return item['#array'];
  }
  return [item];
}

export function augment(params) {
  if (params === undefined) {
    return { guid: createGuid() };
  }
  if (params.guid === undefined) {
    return Object.assign({}, params, { guid: createGuid() });
  }

  return params;
}


export function defaultIdGuid(params) {

  const id = createGuid();

  const defaults = {
    id,
    guid: id,
  };

  return Object.assign({}, defaults, params);
}

