import * as React from 'react';
import colors from 'styles/colors';
import distinct from 'styles/palettes/distinct';
import flatui from 'styles/palettes/flatui';

export const CONTENT_COLORS = {
  Param: flatui.silver,
  Applet: flatui.greenSea,
  Flash: flatui.greenSea,
  Director: flatui.greenSea,
  Mathematica: flatui.greenSea,
  Panopto: flatui.greenSea,
  Unity: flatui.greenSea,
  ContiguousText: flatui.orange,
  CodeBlock: flatui.wetAsphalt,
  Composite: flatui.belizeHole,
  Math: distinct.distinctLime,
  Cite: distinct.distinctMagenta,
  Xref: distinct.distinctMaroon,
  Example: flatui.turquoise,
  Figure: flatui.greenSea,
  Pullout: distinct.distinctNavy,
  Section: distinct.distinctBlue,
  Dialog: distinct.distinctTeal,
  Line: distinct.distinctTeal,
  Speaker: distinct.distinctTeal,
  Image: flatui.sunflower,
  Activity: distinct.distinctGreen,
  WbInline: flatui.amethyst,
  YouTube: colors.youtubeRed,
  Audio: flatui.pumpkin,
  Video: flatui.midnightBlue,
  IFrame: flatui.carrot,
  Instructions: flatui.emerald,
  Ul: distinct.distinctOlive,
  Ol: distinct.distinctOlive,
  Li: distinct.distinctMint,
  Table: flatui.pomegranite,
  CellData: flatui.pomegranite,
  CellHeader: flatui.pomegranite,
  Conjugation: flatui.midnightBlue,
  Conjugate: flatui.midnightBlue,
  BlockCode: flatui.concrete,
  BlockFormula: colors.pink,
  BlockQuote: distinct.distinctLavender,
  Definition: flatui.orange,
  Meaning: flatui.asbestos,
  Translation: flatui.amethyst,
  Pronunciation: flatui.alizarin,
  Materials: distinct.distinctBrown,
  Hint: flatui.alizarin,
  Alternatives: flatui.sunflower,
  Alternative: flatui.pumpkin,
  Sym: colors.warning,
};

export const CONTENT_ICONS = {
  Applet: <i className={'fa fa-coffee'}/>,
  Flash: <i className={'fa fa-bolt'}/>,
  Director: <i className={'fa fa-compass'}/>,
  Panopto: <i className={'fa fa-video-camera'}/>,
  Unity: <i className={'fa fa-gamepad'}/>,
  Param: <i className={'fa fa-sticky-note-o'}/>,
  Mathematica: <i className="unicode-icon">&int;</i>,
  ContiguousText: <i className="unicode-icon">T</i>,
  CodeBlock: <i className={'fa fa-code'}/>,
  Composite: <i className={'fa fa-clone'}/>,
  Conjugation: <i className={'fa fa-language'}/>,
  Conjugate: <i className={'fa fa-language'}/>,
  BlockCode: <i className={'fa fa-code'}/>,
  Example: <i className={'fa fa-bar-chart'}/>,
  Figure: <i className={'fa fa-address-card'}/>,
  Pullout: <i className={'fa fa-external-link-square'}/>,
  Section: <i className={'fa fa-list-alt'}/>,
  Dialog: <i className={'fa fa-comments'}/>,
  Speaker: <i className={'fa fa-comments'}/>,
  Line: <i className={'fa fa-comments'}/>,
  YouTube: <i className={'fa fa-youtube'}/>,
  Image: <i className={'fa fa-image'}/>,
  Audio: <i className={'fa fa-volume-up'}/>,
  WbInline: <i className={'fa fa-flask'}/>,
  Activity: <i className={'fa fa-check'}/>,
  Video: <i className={'fa fa-film'}/>,
  IFrame: <i className={'fa fa-window-maximize'}/>,
  Instructions: <i className={'fa fa-file-text'}/>,
  Ul: <i className={'fa fa-list-ul'}/>,
  Ol: <i className={'fa fa-list-ol'}/>,
  Li: <i className={'fa fa-list'}/>,
  Table: <i className={'fa fa-table'}/>,
  CellData: <i className={'fa fa-table'}/>,
  CellHeader: <i className={'fa fa-table'}/>,
  BlockQuote: <i className={'fa fa-quote-right'}/>,
  BlockFormula: <i className="unicode-icon">&#8721;</i>,
  Definition: <i className={'fa fa-book'}/>,
  Meaning: <i className={'fa fa-comment'}/>,
  Translation: <i className={'fa fa-globe'}/>,
  Pronunciation: <i className={'fa fa-headphones'}/>,
  Materials: <i className={'fa fa-columns'}/>,
  Hint: <i className={'fa fa-hand-o-left'}/>,
  Alternatives: <i className={'fa fa-cogs'}/>,
  Alternative: <i className={'fa fa-cog'}/>,
  Sym: <i className={'fa fa-sun-o'}/>,
};

export const getContentColor = (type: string) => CONTENT_COLORS[type] || colors.grayLight;

export const getContentIcon = (type: string) => CONTENT_ICONS[type]
  || <i className={'fa fa-question'}/>;
