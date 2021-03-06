import { Clipboard } from 'types/clipboard';
import {
  SET_ITEM,
  SetItemAction,
} from 'actions/clipboard';

export type ActionTypes = SetItemAction;
export type ClipboardState = Clipboard;

const initialState = new Clipboard();

export const clipboard = (
  state: ClipboardState = initialState,
  action: ActionTypes,
): ClipboardState => {
  switch (action.type) {
    case SET_ITEM:
      return state.with({
        item: action.item,
        page: action.page,
      });
    default:
      return state;
  }
};
