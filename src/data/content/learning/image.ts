import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment, getChildren, ensureIdGuidPresent, setId } from '../common';
import { getKey } from '../../common';

import { Popout } from './popout';
import { Alternate } from './alternate';
import { Title } from './title';
import { Caption } from './caption';
import { Cite } from './cite';

export type ImageParams = {
  id?: string,
  title?: string,
  src?: string,
  alt?: string,
  width?: string,
  height?: string,
  style?: string,
  valign?: string,
  popout?: Popout,
  alternate?: Alternate,
  titleContent?: Title,
  caption?: Caption,
  cite?: Cite,
  guid?: string,
};

const defaultContent = {
  contentType: 'Image',
  elementType: 'image',
  id: '',
  title: '',
  src: '',
  alt: '',
  width: '',
  height: '',
  style: 'inline',
  valign: 'middle',
  popout: new Popout(),
  alternate: new Alternate(),
  titleContent: new Title(),
  caption: new Caption(),
  cite: new Cite(),
  guid: '',
};

export class Image extends Immutable.Record(defaultContent) {

  contentType: 'Image';
  elementType: 'image';
  id: string;
  title: string;
  src: string;
  alt: string;
  width: string;
  height: string;
  style: string;
  valign: string;
  popout: Popout;
  alternate: Alternate;
  titleContent: Title;
  caption: Caption;
  cite: Cite;
  guid: string;

  constructor(params?: ImageParams) {
    super(augment(params, true));
  }

  with(values: ImageParams) {
    return this.merge(values) as this;
  }

  clone() : Image {
    return ensureIdGuidPresent(this.with({
      popout: this.popout.clone(),
      alternate: this.alternate.clone(),
      titleContent: this.titleContent.clone(),
      caption: this.caption.clone(),
      cite: this.cite.clone(),
    }));
  }

  static fromPersistence(root: Object, guid: string, notify: () => void) : Image {

    const t = (root as any).image;

    let model = new Image({ guid });

    model = setId(model, t, notify);

    if (t['@title'] !== undefined) {
      model = model.with({ title: t['@title'] });
    }
    if (t['@src'] !== undefined) {
      model = model.with({ src: t['@src'] });
    }
    if (t['@alt'] !== undefined) {
      model = model.with({ alt: t['@alt'] });
    }
    if (t['@height'] !== undefined) {
      model = model.with({ height: t['@height'] });
    }
    if (t['@width'] !== undefined) {
      model = model.with({ width: t['@width'] });
    }
    if (t['@style'] !== undefined) {
      model = model.with({ style: t['@style'] });
    }
    if (t['@vertical-align'] !== undefined) {
      model = model.with({ valign: t['@vertical-align'] });
    }


    getChildren(t).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'popout':
          model = model.with({ popout: Popout.fromPersistence(item, id, notify) });
          break;
        case 'alternate':
          model = model.with(
            { alternate: Alternate.fromPersistence(item, id, notify) });
          break;
        case 'title':
          model = model.with(
            { titleContent: Title.fromPersistence(item, id, notify) });
          break;
        case 'caption':
          model = model.with({ caption: Caption.fromPersistence(item, id, notify) });
          break;
        case 'cite':
          model = model.with({ cite: Cite.fromPersistence(item, id, notify) });
          break;
        default:

      }
    });

    return model;
  }

  toPersistence() : Object {

    const children = [
      this.titleContent.toPersistence(),
      // this.cite.toPersistence(toP),
      this.caption.toPersistence(),
      this.popout.toPersistence(),
      this.alternate.toPersistence(),
    ];

    const obj = {
      image: {
        '@id': this.id ? this.id : createGuid(),
        '@title': this.title,
        '@src': this.src === '' ? 'https://via.placeholder.com/400x300'
          + '?text=Click+to+edit+image' : this.src,
        '@alt': this.alt,
        '@style': this.style,
        '@vertical-align': this.valign,
        '#array': children,
      },
    };

    if (this.height.trim() !== '') {
      obj.image['@height'] = this.height.trim();
    }
    if (this.width.trim() !== '') {
      obj.image['@width'] = this.width.trim();
    }

    return obj;
  }
}
