import * as Immutable from 'immutable';
import { ContentModel } from 'data/models';
import { ContentElement } from 'data/content/common/interfaces';
import { findNodes } from 'data/models/utils/workbook';
import { caseOf } from 'utils/utils';

export const collectInlines = (model: ContentModel): Immutable.Map<string, ContentElement> => {
  if (model.modelType === 'WorkbookPageModel') {
    const found = findNodes(model, (n) => {
      return n.contentType === 'WbInline';
    }).map(e => [e.idref, e]);

    return Immutable.Map<string, ContentElement>(found);
  }
  return Immutable.Map<string, ContentElement>();
};

export const collectInlinesNested =
  (model: ContentModel): Immutable.Map<string, ContentElement> => {
    if (model.modelType === 'WorkbookPageModel') {
      const inlineRefs = findNodes(model, (n) => {
        return n.contentType === 'WbInline'
          || n.contentType === 'Multipanel';
      }).map(e => caseOf<(string | ContentElement)[]>(e.contentType)({
        Multipanel: () => [e.inline.idref, e],
        WbInline: () => [e.idref, e],
      })([e.idref, e]));

      return Immutable.Map<string, ContentElement>(inlineRefs);
    }
    return Immutable.Map<string, ContentElement>();
  };
