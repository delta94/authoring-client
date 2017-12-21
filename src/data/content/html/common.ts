export type PurposeType = {
  value: string,
  label: string,
};

// tslint:disable-next-line
export const PurposeTypes : PurposeType[] = [
  { value: 'checkpoint', label: 'Checkpoint' },
  { value: 'lab', label: 'Lab' },
  { value: 'learnbydoing', label: 'Learn by doing' },
  { value: 'learnmore', label: 'Learn more' },
  { value: 'manystudentswonder', label: 'Many students wonder' },
  { value: 'myresponse', label: 'My response' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'simulation', label: 'Simulation' },
  { value: 'walkthrough', label: 'Walkthrough' },
  { value: 'didigetthis', label: 'Did I get this?' },
];

export enum EntityTypes {

  // Block Sentinels
  pullout_begin = 'pullout_begin',
  pullout_end = 'pullout_end',
  example_begin = 'example_begin',
  example_end = 'example_end',
  figure_begin = 'figure_begin',
  figure_end = 'figure_end',
  section_begin = 'section_begin',
  section_end = 'section_end',
  title_begin = 'title_begin',
  title_end = 'title_end',
  definition_begin = 'definition_begin',
  definition_end = 'definition_end',
  pronunciation_begin = 'pronunciation_begin',
  pronunciation_end = 'pronunciation_end',
  translation_begin = 'translation_begin',
  translation_end = 'translation_end',
  meaning_begin = 'meaning_begin',
  meaning_end = 'meaning_end',
  material_begin = 'material_begin',
  material_end = 'material_end',

  // Inline sentinels
  formula_begin = 'formula_begin',
  formula_end = 'formula_end',

  // Inline entities
  activity_link = 'activity_link',
  link = 'link',
  image_link = 'image_link',
  image_activity_link = 'image_activity_link',
  code = 'code',
  formula = 'formula',
  math = 'math',
  quote = 'quote',
  bdo = 'bdo',
  xref = 'xref',
  wb_manula = 'wb_manual',
  cite = 'cite',
  image = 'image',
  input_ref = 'input_ref',
  
  // Block entities
  codeblock = 'codeblock',
  objref = 'objref',
  wb_inline = 'wb_inline',
  table = 'table',
  audio = 'audio',
  video = 'video',
  youtube = 'youtube',
  unsupported = 'unsupported',
  iframe = 'iframe',
  activity = 'activity',
}

export type BlockData = 
  PulloutBegin | PulloutEnd | 
  SectionBegin | SectionEnd | 
  ExampleBegin | ExampleEnd |
  DefinitionBegin | DefinitionEnd |
  TitleBegin | TitleEnd |
  PronunciationBegin | PronunciationEnd |
  TranslationBegin | TranslationEnd |
  MeaningBegin | MeaningEnd |
  Title | Empty;

export interface DefinitionBegin {
  type: 'definition_begin';
  term: string;
}

export interface DefinitionEnd {
  type: 'definition_end';
}

export interface TitleBegin {
  type: 'title_begin';
}

export interface TitleEnd {
  type: 'title_end';
}

export interface MaterialBegin {
  type: 'material_begin';
}

export interface MaterialEnd {
  type: 'material_end';
}


export interface PronunciationBegin {
  type: 'pronunciation_begin';
  src: string;
  srcType: string;
}

export interface PronunciationEnd {
  type: 'pronunciation_end';
}

export interface TranslationBegin {
  type: 'translation_begin';
}

export interface TranslationEnd {
  type: 'translation_end';
}

export interface MeaningBegin {
  type: 'meaning_begin';
}

export interface MeaningEnd {
  type: 'meaning_end';
}

export interface PulloutBegin {
  type: 'pullout_begin';
  subType: string;
}

export interface PulloutEnd {
  type: 'pullout_end';
  subType: string;
}

export interface SectionBegin {
  type: 'section_begin';
  purpose: string;
}

export interface SectionEnd {
  type: 'section_end';
  purpose: string;
}

export interface ExampleBegin {
  type: 'example_begin';
}

export interface ExampleEnd {
  type: 'example_end';
}

export interface Title {
  type: 'title';
}

export interface Empty {
  type: '';
}


export type RawInlineStyle = {
  offset: number,
  length: number,
  style: string,
};

export type RawEntityRange = {
  offset: number,
  length: number,
  key: string,
};

export type RawContentBlock = {
  key: string,
  text: string,
  type: string,
  depth: number,
  inlineStyleRanges: RawInlineStyle[],
  entityRanges: RawEntityRange[],
  data: any,
};

export type RawEntity = {
  type: string,
  mutability: string,
  data: Object,
};

export function getKey(item) {
  return Object.keys(item).filter(k => !k.startsWith('@'))[0];
}

const seenKeys = {};
const MULTIPLIER = Math.pow(2, 24);

export function generateRandomKey(): string {
  let key;
  while (key === undefined || seenKeys.hasOwnProperty(key) || !isNaN(+key)) {
    key = Math.floor(Math.random() * MULTIPLIER).toString(32);
  }
  seenKeys[key] = true;
  return key;
}

export type RawEntityMap = Object;

export type RawDraft = {
  entityMap : RawEntityMap,
  blocks: RawContentBlock[],
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
};


addStyle('bold', 'BOLD');
addStyle('italic', 'ITALIC');
addStyle('emphasis', 'BOLD');
addStyle('deemphasis', 'DEEMPHASIS');
addStyle('highlight', 'HIGHLIGHT');
addStyle('line-through', 'STRIKETHROUGH');
addStyle('oblique', 'OBLIQUE');
addStyle('var', 'CODE');
addStyle('cite', 'CITE');
addStyle('term', 'TERM');
addStyle('ipa', 'IPA');
addStyle('foreign', 'FOREIGN');
addStyle('var', 'CODE');
addStyle('sub', 'SUBSCRIPT');
addStyle('sup', 'SUPERSCRIPT');
addStyle('quote', 'QUOTE');

export const emStyles = {
  bold: true,
  italic: true,
  emphasis: true,
  deemphasis: true,
  highlight: true,
  'line-through': true,
  oblique: true,
};


export const sectionBlockStyles = {
  1: 'header-one',
  2: 'header-two',
  3: 'header-three',
  4: 'header-four',
  5: 'header-five',
  6: 'header-six',
};

export const blockStylesMap = {
  'header-one': 1,
  'header-two': 2,
  'header-three': 3,
  'header-four': 4,
  'header-five': 5,
  'header-six': 6,
};
