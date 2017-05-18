import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment, getChildren } from '../common';
import { getKey } from '../../common';

export type SourceParams = {
  src?: string,
  type?: string,
  guid?: string,
};

const defaultContent = {
  contentType: 'Source',
  src: '',
  type: '',
  guid: '',
};

export class Source extends Immutable.Record(defaultContent) {
  
  contentType: 'Source';
  src: string;
  type: string;
  guid: string;
  
  constructor(params?: SourceParams) {
    super(augment(params));
  }

  with(values: SourceParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) : Source {

    const t = (root as any).source;

    let model = new Source({ guid });
    
    if (t['@src'] !== undefined) {
      model = model.with({ src: t['@src'] });
    }
    if (t['@type'] !== undefined) {
      model = model.with({ type: t['@type'] });
    }
    
    return model;
  }

  toPersistence() : Object {
    return {
      source: {
        '@src': this.src,
        '@type': this.type,
      },
    };
  }
}
