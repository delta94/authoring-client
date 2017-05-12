import * as Immutable from 'immutable';
import { insertBlocksAfter, stateFromKey, containerPrecondition } from './common';
import { EntityTypes, generateRandomKey } from '../../../../../data/content/html/common';
import { AbstractCommand } from '../../command';
import { EditorState, RichUtils, SelectionState, ContentBlock, Modifier, CharacterMetadata} from 'draft-js';



export class InsertSectionCommand extends AbstractCommand<EditorState> {

  precondition(editorState: EditorState) : boolean {
    return containerPrecondition(editorState, 
      [EntityTypes.section_begin, EntityTypes.pullout_begin, EntityTypes.example_begin], 
      [EntityTypes.section_end, EntityTypes.pullout_end, EntityTypes.example_end]
    );
  }

  execute(editorState: EditorState, context, services) : Promise<EditorState> {

    const ss = editorState.getSelection();
    const key = ss.getAnchorKey();

    const beginBlockKey = generateRandomKey();
    const contentKey = generateRandomKey();
    const endBlockKey = generateRandomKey();

    let content = editorState.getCurrentContent();
    content = content.createEntity(EntityTypes.section_begin, 'IMMUTABLE', { type: 'section_begin', purpose: 'checkpoint' });
    const beginKey = content.getLastCreatedEntityKey();

    content = content.createEntity(EntityTypes.section_end, 'IMMUTABLE', { type: 'section_end', beginBlockKey});
    const endKey = content.getLastCreatedEntityKey();

    const beginCharList = Immutable.List().push(new CharacterMetadata({entity: beginKey}));
    const emptyCharList = Immutable.List().push(new CharacterMetadata());
    const endCharList = Immutable.List().push(new CharacterMetadata({entity: endKey}));

    const blocks = [
      new ContentBlock({type: 'atomic', key: beginBlockKey, text: ' ', characterList: beginCharList}),
      new ContentBlock({type: 'unstyled', key: contentKey, text: ' ', characterList: emptyCharList}),
      new ContentBlock({type: 'atomic', key: endBlockKey, text: ' ', characterList: endCharList}),
      new ContentBlock({type: 'unstyled', key: contentKey, text: ' ', characterList: emptyCharList})
    ];

    content = insertBlocksAfter(content, key, blocks);
    
    return Promise.resolve(EditorState.forceSelection(EditorState.push(editorState, content, 'insert-fragment'), stateFromKey(contentKey)));
  }
}