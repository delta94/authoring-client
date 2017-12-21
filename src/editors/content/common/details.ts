import * as contentTypes from '../../../data/contentTypes';

const MAX_LENGTH = 50;

export function getHtmlDetails(html : contentTypes.Html, length = MAX_LENGTH) : string {

  const block = html.contentState.getBlocksAsArray()
    .find(b => b.getType !== 'atomic' && b.getText() !== ' ');

  if (block === undefined) {
    return '';
  }

  return maxLength(block.getText(), MAX_LENGTH);
}

function maxLength(text: string, length: number) : string {
  if (text.length <= length) {
    return text;
  }

  return text.substr(0, length - 3) + '...';
}
