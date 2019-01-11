import * as Immutable from 'immutable';
import createGuid from 'utils/guid';
import { INLINE_ELEMENTS, ContentElements, MATERIAL_ELEMENTS } from '../common/elements';

type FeedbackDescriptionParams = {
  guid?: string;
  content?: ContentElements;
};

const defaultFeedbackDescriptionParams: FeedbackDescriptionParams = {
  guid: '',
  content: new ContentElements().with({ supportedElements: Immutable.List(MATERIAL_ELEMENTS) }),
};

export class FeedbackDescription extends Immutable.Record(defaultFeedbackDescriptionParams) {
  guid: string;
  content: ContentElements;

  constructor(params?: FeedbackDescriptionParams) {
    super(params);
  }

  with(values: FeedbackDescriptionParams): FeedbackDescription {
    return this.merge(values) as this;
  }

  static fromPersistence(
    json: any, guid: string, notify: () => void = () => null): FeedbackDescription {
    let model = new FeedbackDescription({ guid });

    const o = json.description;

    model = model.with({
      content: ContentElements
        .fromPersistence(o, createGuid(), INLINE_ELEMENTS, null, notify),
    });

    return model;
  }

  toPersistence(): Object {
    return {
      description: {
        '#array': this.content.toPersistence(),
      },
    };
  }
}