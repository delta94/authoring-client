import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { augment, getChildren, ensureIdGuidPresent } from 'data/content/common';
import { Image } from 'data/content/learning/image';
import { LinkTarget } from 'data/content/learning/common';

export type LinkParams = {
  target?: LinkTarget,
  href?: string,
  internal?: boolean,
  title?: string,
  content?: Maybe<Image>,
  guid?: string,
};

const defaultContent = {
  contentType: 'Link',
  elementType: 'link',
  target: LinkTarget.New,
  href: 'https://oli.cmu.edu',
  internal: false,
  title: '',
  content: Maybe.nothing<Image>(),
  guid: '',
};

export class Link extends Immutable.Record(defaultContent) {
  contentType: 'Link';
  elementType: 'link';
  content: Maybe<Image>;
  target: LinkTarget;
  href: string;
  internal: boolean;
  title: string;
  guid: string;

  constructor(params?: LinkParams) {
    super(augment(params));
  }

  with(values: LinkParams) {
    return this.merge(values) as this;
  }


  clone(): Link {
    return ensureIdGuidPresent(this.with({
      content: this.content.lift(i => i.clone()),
    }));
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): Link {
    const t = (root as any).link;

    let model = new Link({ guid });

    if (t['@title'] !== undefined) {
      model = model.with({ title: t['@title'] });
    }
    if (t['@href'] !== undefined) {
      model = model.with({ href: t['@href'] });
    }
    if (t['@internal'] !== undefined) {
      model = model.with({ internal: t['@internal'] === 'true' });
    }
    if (t['@target'] !== undefined) {
      model = model.with({ target: t['@target'] });
    }

    const children = getChildren(t);

    if (children instanceof Array
      && children.length === 1 && (children[0] as any).image !== undefined) {
      model = model.with({ content: Maybe.just(Image.fromPersistence(children[0], '', notify)) });
    }

    return model;
  }

  toPersistence(): Object {
    const link = {
      link: {
        '@title': this.title,
        '@href': this.href,
        '@target': this.target,
        '@internal': this.internal ? 'true' : 'false',
      },
    };

    const imageContent: Image = this.content.caseOf({
      just: c => [c.toPersistence()],
      nothing: () => undefined,
    });

    if (imageContent) {
      link.link['#array'] = imageContent;
    }

    return link;
  }
}
