import * as Immutable from 'immutable';
import { augment, ensureIdGuidPresent } from '../common';

export type PopoutParams = {
  enable?: boolean,
  content?: string,
  guid?: string,
};

const defaultContent = {
  contentType: 'Popout',
  elementType: 'popout',
  enable: false,
  content: '',
  guid: '',
};

export class Popout extends Immutable.Record(defaultContent) {

  contentType: 'Popout';
  elementType: 'popout';
  enable: boolean;
  content: string;
  guid: string;

  constructor(params?: PopoutParams) {
    super(augment(params));
  }

  with(values: PopoutParams) {
    return this.merge(values) as this;
  }

  clone() : Popout {
    return ensureIdGuidPresent(this);
  }

  static fromPersistence(root: Object, guid: string, notify: () => void) : Popout {

    const cb = (root as any).popout;

    let model = new Popout({ guid });

    if (cb['@enable'] !== undefined) {
      model = model.with({ enable: cb['@enable'] === 'true' });
    }
    if (cb['#text'] !== undefined) {
      model = model.with({ content: cb['#text'] });
    }

    return model;
  }

  toPersistence() : Object {
    return {
      popout: {
        '@enable': this.enable ? 'true' : 'false',
        '#text': this.content,
      },
    };
  }
}
