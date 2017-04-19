import * as Immutable from 'immutable';

export type UnsupportedParams = {
  contentType?: 'Unsupported',
  data: Object,
  guid: string
};

export class Unsupported extends Immutable.Record({contentType: 'Unsupported', guid: '', data: {}}) {
  
  contentType: 'Unsupported';
  data: Object;
  guid: string;
  
  constructor(params?: UnsupportedParams) {
    params ? super(params) : super();
  }

  with(values: UnsupportedParams) {
    return this.merge(values) as this;
  }

  toPersistence() : Object {
    return this.data;
  } 

  static fromPersistence(data: Object, guid: string) : Unsupported {
    return new Unsupported().with({ data, guid });
  }
}