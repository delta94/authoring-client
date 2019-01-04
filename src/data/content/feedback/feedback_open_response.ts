import * as Immutable from 'immutable';
import { getChildren } from 'data/content/common';
import { getKey } from 'data/common';
import createGuid from 'utils/guid';
import { FeedbackPrompt } from './feedback_prompt';

type FeedbackOpenResponseParams = {
  guid?: string;
  id?: string;
  prompt?: FeedbackPrompt;
  // required = does this question require a response?
  required?: boolean;
};

const defaultFeedbackOpenResponseParams: FeedbackOpenResponseParams = {
  guid: '',
  id: '',
  prompt: new FeedbackPrompt(),
  required: false,
};

export class FeedbackOpenResponse extends Immutable.Record(defaultFeedbackOpenResponseParams) {
  guid: string;
  id: string;
  prompt: FeedbackPrompt;
  required: boolean;

  constructor(params?: FeedbackOpenResponseParams) {
    super(params);
  }

  with(values: FeedbackOpenResponseParams): FeedbackOpenResponse {
    return this.merge(values) as this;
  }

  static fromPersistence(
    json: any, guid: string, notify: () => void = () => null): FeedbackOpenResponse {
    let model = new FeedbackOpenResponse({ guid });

    const o = json.open_response;

    // '@id' required
    model = model.with({ id: o['@id'] });

    if (o['@required'] !== undefined) {
      model = model.with({
        required:
          // JSON.parse will convert to boolean
          JSON.parse((o['@required'] as string).toLowerCase()),
      });
    } else {
      model = model.with({ required: false });
    }

    getChildren(o).forEach((item) => {
      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'prompt':
          model = model.with({
            prompt: FeedbackPrompt.fromPersistence(item, id, notify),
          });
          break;
        default:
          break;
      }
    });

    return model;
  }

  toPersistence(): Object {
    const children = [
      this.prompt.toPersistence(),
    ];

    const dto = {
      open_response: {
        '@id': this.id,
      },
    };

    if (this.required) {
      dto.open_response['@required'] = this.required.toString();
    }
    dto.open_response['#array'] = children;

    return dto;
  }
}
