import * as Immutable from 'immutable';

import { Unsupported } from './unsupported';
import createGuid from '../../utils/guid';
import { getKey } from '../common';
import { getChildren, augment } from './common';

import { ObjRef } from './objref';
import { Title } from './title';
import { Content } from './content';
import { Question } from './question';

export type PoolParams = {
  id?: string;
  objrefs?: Immutable.OrderedMap<string, ObjRef>,
  title?: Title,
  content?: Content,
  sections?: Immutable.OrderedMap<string, Unsupported>,
  questions?: Immutable.OrderedMap<string, Question>,
  guid?: string;
};

const defaultPoolParams = {
  contentType: 'Pool',
  id: createGuid(),
  objrefs: Immutable.OrderedMap<string, ObjRef>(),
  title: new Title({ text: 'Pool Title' }),
  content: new Content(),
  sections: Immutable.OrderedMap<string, Unsupported>(),
  questions: Immutable.OrderedMap<string, Question>(),
  guid: '',
};

export class Pool extends Immutable.Record(defaultPoolParams) {

  contentType: 'Pool';
  id: string;
  objrefs: Immutable.OrderedMap<string, ObjRef>;
  title: Title;
  content: Content;
  sections: Immutable.OrderedMap<string, Unsupported>;
  questions: Immutable.OrderedMap<string, Question>;
  guid: string;
  
  constructor(params?: PoolParams) {
    super(augment(params));
  }

  with(values: PoolParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(json: any, guid: string) {

    let model = new Pool({ guid });

    const s = json.pool;

    if (s['@id'] !== undefined) {
      model = model.with({ id: s['@id'] });
    }
    
    getChildren(s).forEach((item) => {
      
      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'title':
          model = model.with({ title: Title.fromPersistence(item, id) });
          break;
        case 'objref':
          model = model.with({ objrefs: model.objrefs.set(id, ObjRef.fromPersistence(item, id)) });
          break;
        case 'content':
          model = model.with({ content: Content.fromPersistence(item, id) });
          break;
        case 'question':
          model = model.with({ 
            questions: model.questions.set(id, Question.fromPersistence(item, id)), 
          });
          break;
        case 'section':
          model = model.with({ 
            sections: model.sections.set(id, Unsupported.fromPersistence(item, id)),
          });
          break;
        default:
          
      }
    });

    return model;
  }

  toPersistence() : Object {

    const children = [

      this.title.toPersistence(),

      ...this.objrefs
        .toArray()
        .map(item => item.toPersistence()),

      this.content.toPersistence(),

      ...this.sections
        .toArray()
        .map(item => item.toPersistence()),

      ...this.questions
        .toArray()
        .map(item => item.toPersistence()),
    ];

    return {
      pool: {
        '@id': this.id,
        '#array': children,
      },
    };
  }
}