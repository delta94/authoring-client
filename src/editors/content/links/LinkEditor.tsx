import * as React from 'react';
import { Link } from 'data/content/learning/link';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { TextInput } from 'editors/content/common/TextInput';
import { InputLabel } from 'editors/content/common/InputLabel';

export interface LinkEditorProps extends AbstractContentEditorProps<Link> {

}

export interface LinkEditorState {

}

/**
 * The content editor for Table.
 */
export class LinkEditor
  extends AbstractContentEditor<Link, LinkEditorProps, LinkEditorState> {

  constructor(props) {
    super(props);

    this.onTargetEdit = this.onTargetEdit.bind(this);
    this.onHrefEdit = this.onHrefEdit.bind(this);
  }

  onTargetEdit(target) {
    this.props.onEdit(this.props.model.with({ target }));
  }

  onHrefEdit(href) {
    this.props.onEdit(this.props.model.with({ href }));
  }

  renderSidebar() {
    return null;
  }
  renderToolbar() {
    return null;
  }

  renderMain() : JSX.Element {

    const { href, target } = this.props.model;

    return (
      <div className="itemWrapper">

        <InputLabel label="href">
          <TextInput width="100%" label=""
            editMode={this.props.editMode}
            value={href}
            type="text"
            onEdit={this.onHrefEdit}
          />
        </InputLabel>

        <InputLabel label="target">
          <TextInput width="100%" label=""
            editMode={this.props.editMode}
            value={target}
            type="text"
            onEdit={this.onTargetEdit}
          />
        </InputLabel>

      </div>);
  }

}
