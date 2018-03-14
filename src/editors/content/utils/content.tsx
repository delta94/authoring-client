import * as React from 'react';
import colors from 'styles/colors';
import distinct from 'styles/palettes/distinct';
import flatui from 'styles/palettes/flatui';

export const CONTENT_COLORS = {
  ContiguousText: flatui.orange,
  CodeBlock: flatui.wetAsphalt,
  Quote: distinct.distinctLavender,
  Math: distinct.distinctLime,
  Cite: distinct.distinctMagenta,
  Xref: distinct.distinctMaroon,
  Example: distinct.distinctMint,
  Pullout: distinct.distinctNavy,
  Section: distinct.distinctBlue,
  Image: flatui.sunflower,
  Activity: distinct.distinctGreen,
  WbInline: flatui.amethyst,
  YouTube: colors.youtubeRed,
};

export const CONTENT_ICONS = {
  ContiguousText: <i className="unicode-icon">T</i>,
  CodeBlock: <i className={'fa fa-code'}/>,
  Example: <i className={'fa fa-bar-chart'}/>,
  Pullout: <i className={'fa fa-external-link-square'}/>,
  Section: <i className={'fa fa-list-alt'}/>,
  YouTube: <i className={'fa fa-youtube'}/>,
  Image: <i className={'fa fa-image'}/>,
  WbInline: <i className={'fa fa-flask'}/>,
  Activity: <i className={'fa fa-check'}/>,
};

export const getContentColor = (type: string) => CONTENT_COLORS[type] || colors.grayLight;

export const getContentIcon = (type: string) => CONTENT_ICONS[type]
  || <i className={'fa fa-question'}/>;
