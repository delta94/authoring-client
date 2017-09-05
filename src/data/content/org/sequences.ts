import * as Immutable from 'immutable';

import { defaultIdGuid, getChildren } from '../common';
import { getKey } from '../../common';
import { Maybe } from 'tsmonad';
import { ProgressConstraints } from './progress_constraints';
import { Sequence } from './sequence';
import { Include } from './include';
import createGuid from '../../../utils/guid';

import * as types from './types';

export type SequencesParams = {
  progressConstraints?: Maybe<ProgressConstraints>
  children?: Immutable.OrderedMap<string, Sequence | Include>,
  guid?: string,
};

const defaultContent = {
  contentType: types.ContentTypes.Sequences,
  progressConstraints: Maybe.nothing<ProgressConstraints>(),
  children: Immutable.OrderedMap<string, Sequence | Include>(),
  guid: '',
};

export class Sequences extends Immutable.Record(defaultContent) {
  
  contentType: types.ContentTypes.Sequences;
  progressConstraints: Maybe<ProgressConstraints>;
  children: Immutable.OrderedMap<string, Sequence | Include>;
  guid: string;
  
  constructor(params?: SequencesParams) {
    super(defaultIdGuid(params));
  }

  with(values: SequencesParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) {

    const s = (root as any).sequences;
    let model = new Sequences({ guid });
    
    getChildren(s).forEach((item) => {
      
      const key = getKey(item);
      const id = createGuid();
     
      switch (key) {
        case 'progress_constraints':
          model = model.with(
            { progressConstraints: Maybe.just(ProgressConstraints.fromPersistence(item, id)) });
          break;
        case 'sequence':
          model = model.with(
            { children: model.children.set(id, Sequence.fromPersistence(item, id)) });
          break;
        case 'include':
          model = model.with(
            { children: model.children.set(id, Include.fromPersistence(item, id)) });
          break;
        default:
          
      }
    });
    
    return model;
  }

  toPersistence() : Object {

    const children : Object[] = [];

    this.progressConstraints.lift(p => children.push(p.toPersistence()));
    this.children.toArray().forEach(c => children.push(c.toPersistence()));
    
    const s = { 
      sequences: {
        '#array': children,
      }, 
    };

    return s;
  }
}