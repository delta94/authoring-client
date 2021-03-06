import * as Immutable from 'immutable';
import createGuid from 'utils/guid';
import { augment, getChildren, except, ensureIdGuidPresent, setId } from 'data/content/common';
import { getKey } from 'data/common';
import { Title } from 'data/content/learning/title';
import { ContentElements, BOX_ELEMENTS } from 'data/content/common/elements';
import { Maybe } from 'tsmonad';

export type ExampleParams = {
  id?: string,
  title?: Title,
  purpose?: Maybe<string>,
  content?: ContentElements,
  guid?: string,
};

const defaultContent = {
  contentType: 'Example',
  elementType: 'example',
  id: '',
  title: Title.fromText('Title'),
  purpose: Maybe.nothing(),
  content: new ContentElements().with({ supportedElements: Immutable.List<string>(BOX_ELEMENTS) }),
  guid: '',
};

export class Example extends Immutable.Record(defaultContent) {
  contentType: 'Example';
  elementType: 'example';
  id: string;
  title: Title;
  purpose: Maybe<string>;
  content: ContentElements;
  guid: string;

  constructor(params?: ExampleParams) {
    super(augment(params, true));
  }

  with(values: ExampleParams) {
    return this.merge(values) as this;
  }

  clone(): Example {
    return ensureIdGuidPresent(this.with({
      title: this.title.clone(),
      content: this.content.clone(),
    }));
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): Example {
    const t = (root as any).example;

    let model = new Example({ guid });

    model = setId(model, t, notify);

    if (t['@purpose'] !== undefined) {
      model = model.with({ purpose: Maybe.just(t['@purpose']) });
    }

    getChildren(t).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'title':
          model = model.with({ title: Title.fromPersistence(item, id, notify) });
          break;
        default:
      }
    });

    model = model.with({
      content: ContentElements
        .fromPersistence(except(getChildren(t), 'title'), '', BOX_ELEMENTS, null, notify),
    });

    return model;
  }

  toPersistence(): Object {

    const content = this.content.content.size === 0
      ? [{ p: { '#text': ' ' } }]
      : this.content.toPersistence();

    const s = {
      example: {
        '@id': this.id ? this.id : createGuid(),
        '#array': [
          this.title.toPersistence(),
          ...content,
        ],
      },
    };

    this.purpose.lift(p => s.example['@purpose'] = p);

    return s;
  }
}
