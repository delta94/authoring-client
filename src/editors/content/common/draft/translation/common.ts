
export type RawInlineStyle = {
  offset: number,
  length: number,
  style: string 
};

export type RawEntityRange = {
  offset: number,
  length: number,
  key: string
}

export type RawContentBlock = {
  key: string,
  text: string,
  type: string,
  depth: number,
  inlineStyleRanges: RawInlineStyle[],
  entityRanges: RawEntityRange[],
  data: any
};

export type RawEntity = {
  type: string,
  mutability: string,
  data: Object
};



export type RawEntityMap = Object;

export type RawDraft = {
  entityMap : RawEntityMap,
  blocks: RawContentBlock[]
};

export const ARRAY = '#array';
export const TITLE = '@title';
export const STYLE = '@style';
export const TEXT = '#text';
export const CDATA = '#cdata';

export const styleMap = {};
const addStyle = (oliStyle, draftStyle) => {
  styleMap[oliStyle] = draftStyle;
  styleMap[draftStyle] = oliStyle;
}


addStyle('bold', 'BOLD');
addStyle('italic', 'ITALIC');
addStyle('var', 'CODE');
addStyle('cite', 'CITE');
addStyle('term', 'TERM');
addStyle('ipa', 'IPA');
addStyle('foreign', 'FOREIGN');
addStyle('var', 'CODE');
addStyle('sub', 'SUBSCRIPT');
addStyle('sup', 'SUPERSCRIPT');

export const emStyles = {
  bold: true,
  italic: true
}


export const sectionBlockStyles = {
  1: 'header-one',
  2: 'header-two',
  3: 'header-three',
  4: 'header-four',
  5: 'header-five',
  6: 'header-six'
};

export const blockStylesMap = {
  'header-one': 1,
  'header-two': 2,
  'header-three': 3,
  'header-four': 4,
  'header-five': 5,
  'header-six': 6,
}