import * as React from 'react';
import { Cite } from 'data/content/learning/cite';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { InputLabel } from 'editors/content/common/InputLabel';
import { TextInput } from 'editors/content/common/TextInput';

export interface CiteEditorProps extends AbstractContentEditorProps<Cite> {

}

export interface CiteEditorState {

}

/**
 * The content editor for Table.
 */
export class CiteEditor
  extends AbstractContentEditor<Cite, CiteEditorProps, CiteEditorState> {

  constructor(props) {
    super(props);

    this.onEntryEdit = this.onEntryEdit.bind(this);

  }

  onEntryEdit(entry) {
    this.props.onEdit(this.props.model.with({ entry }));
  }

  renderSidebar() {
    return null;
  }
  renderToolbar() {
    return null;
  }

  renderMain() : JSX.Element {

    const { entry } = this.props.model;

    return (
      <div className="itemWrapper">

        <InputLabel label="Entry">
          <TextInput width="100%" label=""
            editMode={this.props.editMode}
            value={entry}
            type="text"
            onEdit={this.onEntryEdit}
          />
        </InputLabel>

      </div>);
  }

}

