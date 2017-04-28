import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment, getChildren } from '../common';
import { Row } from './row';
import { getKey } from '../../common';
import { Param } from './param';

export type CellHeaderParams = {
  align?: string,
  colspan?: string,
  rowspan?: string,
  content?: any,
  guid?: string
};

const defaultContent = {
  contentType: 'CellHeader',
  align: 'left',
  colspan: '1',
  rowspan: '1',
  content: '',
  guid: ''
}

export class CellHeader extends Immutable.Record(defaultContent) {
  
  contentType: 'CellHeader';
  align: string;
  colspan: string;
  rowspan: string;
  content: any;
  guid: string;
  
  constructor(params?: CellHeaderParams) {
    super(augment(params));
  }

  with(values: CellHeaderParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) : CellHeader {

    let t = (root as any).th;

    let model = new CellHeader({ guid });
    
    if (t['@colspan'] !== undefined) {
      model = model.with({ colspan: t['@colspan']});
    }
    if (t['@rowspan'] !== undefined) {
      model = model.with({ rowspan: t['@rowspan']});
    }
    if (t['@align'] !== undefined) {
      model = model.with({ align: t['@align']});
    }
    
    model = model.with({content: getChildren(t)});
    
    return model;
  }

  toPersistence() : Object {
    return {
      'th': {
        '@colspan': this.colspan,
        '@rowspan': this.rowspan,
        '@align': this.align,
        '#array': this.content
      } 
    };
  }
}
