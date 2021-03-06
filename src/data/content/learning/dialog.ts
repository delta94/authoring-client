import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { Title } from 'data/content/learning/title';
import { augment, getChildren, ensureIdGuidPresent } from 'data/content/common';
import { getKey } from 'data/common';
import createGuid from 'utils/guid';
import { IFrame } from 'data/content/learning/iframe';
import { YouTube } from 'data/content/learning/youtube';
import { Image } from 'data/content/learning/image';
import { Video } from 'data/content/learning/video';
import { Audio } from 'data/content/learning/audio';
import { Speaker } from 'data/content/learning/speaker';
import { Line } from 'data/content/learning/line';
import { MediaItem } from 'data/contentTypes';

export type DialogParams = {
  guid?: string,
  title?: Title,
  media?: Maybe<MediaItem>,
  speakers?: Immutable.OrderedMap<string, Speaker>,
  lines?: Immutable.OrderedMap<string, Line>,
};

const defaultContent = {
  contentType: 'Dialog',
  elementType: 'dialog',
  guid: '',
  title: Title.fromText('Dialog Title'),
  media: Maybe.nothing<MediaItem>(),
  speakers: Immutable.OrderedMap<string, Speaker>(),
  lines: Immutable.OrderedMap<string, Line>(),
};

export class Dialog extends Immutable.Record(defaultContent) {

  contentType: 'Dialog';
  elementType: 'dialog';
  guid: string;
  title: Title;
  media: Maybe<MediaItem>;
  speakers: Immutable.OrderedMap<string, Speaker>;
  lines: Immutable.OrderedMap<string, Line>;

  constructor(params?: DialogParams) {
    super(augment(params));
  }

  with(values: DialogParams) {
    return this.merge(values) as this;
  }

  clone(): Dialog {
    // A map from old speaker ids to cloned speaker ids
    let speakerMap = Immutable.Map<string, string>();

    return ensureIdGuidPresent(this.with({
      title: this.title.clone(),
      media: this.media.lift(media => media.clone()),
      speakers: this.speakers.mapEntries(([_, v]) => {
        const clone: Speaker = v.clone();
        speakerMap = speakerMap.set(v.id, clone.id);
        return [clone.guid, clone];
      }).toOrderedMap() as Immutable.OrderedMap<string, Speaker>,
      lines: this.lines.mapEntries(([_, v]) => {
        // Line will not change the `speaker` idref attribute.
        // We need to set it to the cloned speaker id stored in the map.
        const clone: Line = v.clone().with({ speaker: speakerMap.get(v.speaker) });
        return [clone.guid, clone];
      }).toOrderedMap() as Immutable.OrderedMap<string, Line>,
    }));
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): Dialog {

    const m = (root as any).dialog;
    let model = new Dialog().with({ guid });

    if (m['@title'] !== undefined) {
      model = model.with({ title: m['@title'] });
    }

    getChildren(m).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();
      switch (key) {
        case 'speaker':
          model = model.with({
            speakers: model.speakers.set(id, Speaker.fromPersistence(item, id, notify)),
          });
          break;
        case 'line':
          model = model.with({
            lines: model.lines.set(id, Line.fromPersistence(item, id, notify)),
          });
          break;
        case 'title':
          model = model.with({
            title: Title.fromPersistence(item, id, notify),
          });
          break;
        // Switch for each type of MediaItem
        case 'audio':
          model = model.with({
            media: Maybe.just(Audio.fromPersistence(item, id, notify)),
          });
          break;
        case 'image':
          model = model.with({
            media: Maybe.just(Image.fromPersistence(item, id, notify)),
          });
          break;
        case 'video':
          model = model.with({
            media: Maybe.just(Video.fromPersistence(item, id, notify)),
          });
          break;
        case 'youtube':
          model = model.with({
            media: Maybe.just(YouTube.fromPersistence(item, id, notify)),
          });
          break;
        case 'iframe':
          model = model.with({
            media: Maybe.just(IFrame.fromPersistence(item, id, notify)),
          });
          break;
        default:
      }
    });

    return model;
  }

  toPersistence(): Object {
    const media = [];
    this.media.lift(m => media.push(m.toPersistence()));

    const m = {
      dialog: {
        '#array': [
          this.title.toPersistence(),
          ...media,
          ...this.speakers.toArray().map(s => s.toPersistence()),
          ...this.lines.toArray().map(l => l.toPersistence()),
        ],
      },
    };

    return m;
  }
}
