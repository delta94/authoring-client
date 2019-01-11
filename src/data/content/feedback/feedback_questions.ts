import * as Immutable from 'immutable';
import { LikertSeries } from './likert_series';
import { Likert } from './likert';
import { FeedbackMultipleChoice } from './feedback_multiple_choice';
import { FeedbackOpenResponse } from './feedback_open_response';
import createGuid from 'utils/guid';
import { getChildren } from '../common';
import { getKey } from 'data/common';

export type FeedbackQuestion =
  LikertSeries
  | Likert
  | FeedbackMultipleChoice
  | FeedbackOpenResponse;

type FeedbackQuestionsParams = {
  guid?: string;
  questions?: Immutable.OrderedMap<string, FeedbackQuestion>;
};

const defaultFeedbackQuestionsParams: FeedbackQuestionsParams = {
  guid: '',
  questions: Immutable.OrderedMap<string, FeedbackQuestion>(),
};

export class FeedbackQuestions extends Immutable.Record(defaultFeedbackQuestionsParams) {
  guid: string;
  questions: Immutable.OrderedMap<string, FeedbackQuestion>;

  constructor(params?: FeedbackQuestionsParams) {
    super(params);
  }

  with(values: FeedbackQuestionsParams): FeedbackQuestions {
    return this.merge(values) as this;
  }

  static fromPersistence(
    json: any, guid: string, notify: () => void = () => null): FeedbackQuestions {
    let model = new FeedbackQuestions({ guid });

    const o = json.questions;

    getChildren(o).forEach((item) => {
      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'likert_series':
          model = model.with({
            questions: model.questions.set(id, LikertSeries.fromPersistence(item, id, notify)),
          });
          break;
        case 'likert':
          model = model.with({
            questions: model.questions.set(id, Likert.fromPersistence(item, id, notify)),
          });
          break;
        case 'multiple_choice':
          model = model.with({
            questions: model.questions.set(
              id, FeedbackMultipleChoice.fromPersistence(item, id, notify)),
          });
          break;
        case 'open_response':
          model = model.with({
            questions: model.questions.set(
              id, FeedbackOpenResponse.fromPersistence(item, id, notify)),
          });
          break;
        default:
      }
    });

    return model;
  }

  toPersistence(): Object {
    const children = this.questions.size === 0
      ? [(new LikertSeries()).toPersistence()]
      : this.questions.toArray().map(item => item.toPersistence());

    return {
      questions: {
        '#array': children,
      },
    };
  }
}