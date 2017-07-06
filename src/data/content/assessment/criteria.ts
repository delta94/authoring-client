import * as Immutable from 'immutable';

import { Html } from '../html';
import { augment } from '../common';
import { getKey } from '../../common';

export type GradingCriteriaParams = {
  score?: string,
  name?: string,
  body?: Html,
  guid?: string,
};

const defaultGradingCriteria = {
  contentType: 'GradingCriteria',
  score: '0',
  name: '',
  body: new Html(),
  guid: '',
};

export class GradingCriteria extends Immutable.Record(defaultGradingCriteria) {
  
  contentType: 'GradingCriteria';
  score: string;
  name: string;
  body: Html;
  guid: string;
  
  constructor(params?: GradingCriteriaParams) {
    super(augment(params));
  }

  with(values: GradingCriteriaParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) : GradingCriteria {

    const c = (root as any).grading_criteria;

    let model = new GradingCriteria({ guid });
    model = model.with({ body: Html.fromPersistence(c, '') });
    
    if (c['@score'] !== undefined) {
      model = model.with({ score: c['@score'] });
    }
    if (c['@name'] !== undefined) {
      model = model.with({ name: c['@name'] });
    }
    
    return model;
  }

  toPersistence() : Object {

    const body = this.body.toPersistence();
    const criteria = { criteria: (body as any) };

    criteria.criteria['@score'] = this.score;
    criteria.criteria['@name'] = this.name;

    return criteria;
  }
}