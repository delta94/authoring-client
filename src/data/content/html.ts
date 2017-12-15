import * as Immutable from 'immutable';
import { ContentState } from 'draft-js';
import { toPersistence } from './html/topersistence';
import { toDraft } from './html/todraft';
import createGuid from '../../utils/guid';
import { augment } from './common';
import { cloneDuplicatedEntities } from 'editors/content/common/draft/DraftWrapper.tsx';

const emptyContent = ContentState.createFromText('');


export type HtmlParams = {
  contentState?: ContentState,
  guid?: string,
};

const defaultHtmlParams = {
  contentType: 'Html',
  contentState: emptyContent,
  guid: undefined,
};

export class Html extends Immutable.Record(defaultHtmlParams) {

  contentType: 'Html';

  contentState: ContentState;
  guid: string;

  constructor(params?: HtmlParams) {
    super(augment(params));
  }

  with(values: HtmlParams) {
    return this.merge(values) as this;
  }

  toPersistence() : any {
    return toPersistence(this.contentState);
  }

  clone() {
    return this.with({
      contentState: cloneDuplicatedEntities(this.contentState),
    });
  }

  static fromText(text: string) : Html {
    return new Html().with({ contentState: ContentState.createFromText(text) });
  }

  static fromPersistence(json: Object, guid: string) : Html {
    return new Html().with({ contentState: toDraft(json), guid });
  }
}
