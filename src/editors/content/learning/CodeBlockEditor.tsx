import * as React from 'react';
import { CodeBlock as CodeBlockType } from 'data/content/learning/codeblock';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { ToolbarGroup, ToolbarLayout } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { Checkbox, Select, TextInput } from '../common/controls';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import guid from 'utils/guid';

import AceEditor from 'react-ace';

import 'brace/mode/java';
import 'brace/mode/python';
import 'brace/mode/html';
import 'brace/mode/xml';
import 'brace/mode/actionscript';
import 'brace/mode/sh';
import 'brace/mode/c_cpp';
import 'brace/mode/text';

import 'brace/theme/github';

import './markers.scss';


export interface CodeBlockProps
  extends AbstractContentEditorProps<CodeBlockType> {
  onShowSidebar: () => void;
}

export interface CodeBlockState {

}

/**
 * The content editor for contiguous text.
 */
export default class CodeBlock
  extends AbstractContentEditor<CodeBlockType,
  CodeBlockProps, CodeBlockState> {

  uniqueName: string;

  constructor(props) {
    super(props);

    this.onSourceEdit = this.onSourceEdit.bind(this);
    this.onSyntaxChange = this.onSyntaxChange.bind(this);
    this.onNumberEdit = this.onNumberEdit.bind(this);
    this.onStartEdit = this.onStartEdit.bind(this);
    this.onHighlightEdit = this.onHighlightEdit.bind(this);

    this.uniqueName = guid();
  }

  onSourceEdit(source, e) {
    const model = this.props.model.with({ source });
    this.props.onEdit(model, model);
  }

  onSyntaxChange(syntax) {
    const model = this.props.model.with({ syntax });
    this.props.onEdit(model, model);
  }

  onNumberEdit(number) {
    const model = this.props.model.with({ number });
    this.props.onEdit(model, model);
  }

  onHighlightEdit(highlight) {
    const model = this.props.model.with({ highlight });
    this.props.onEdit(model, model);
  }

  onStartEdit(start) {
    const model = this.props.model.with({ start });
    this.props.onEdit(model, model);
  }

  renderSidebar() {
    const syntax = this.props.model.syntax;

    return (
      <SidebarContent title="Code Block">
        <SidebarGroup label="Language / Syntax">
          <Select
            editMode={this.props.editMode}
            label=""
            value={syntax}
            onChange={this.onSyntaxChange}>
            <option value="actionscript3">ActionScript</option>
            <option value="bash">Bash</option>
            <option value="c">C</option>
            <option value="cpp">C++</option>
            <option value="html">HTML</option>
            <option value="java">Java</option>
            <option value="python">Python</option>
            <option value="text">Text</option>
            <option value="xml">XML</option>
          </Select>
          <Checkbox
            editMode={this.props.editMode}
            label="Show line numbers"
            value={this.props.model.number}
            onEdit={this.onNumberEdit} />
        </SidebarGroup>
        <SidebarGroup label="First line number">
          <TextInput
            editMode={this.props.editMode}
            width="100%"
            type="number"
            label=""
            value={this.props.model.start}
            onEdit={this.onStartEdit} />
        </SidebarGroup>
        <SidebarGroup label="Highlighting">
          <TextInput
            editMode={this.props.editMode}
            width="100%"
            type="text"
            label=""
            value={this.props.model.highlight}
            onEdit={this.onHighlightEdit} />
        </SidebarGroup>
      </SidebarContent>
    );
  }

  renderToolbar() {
    const { onShowSidebar } = this.props;

    return (
      <ToolbarGroup label="Code Block" highlightColor={CONTENT_COLORS.CodeBlock} columns={6}>
        <ToolbarButton onClick={() => onShowSidebar()} size={ToolbarButtonSize.Large}>
          <div><i className="fa fa-file-code-o"/></div>
          <div>Language</div>
        </ToolbarButton>

        <ToolbarLayout.Column>
          <ToolbarButton onClick={() => onShowSidebar()} size={ToolbarButtonSize.Wide}>
            <i className="fa fa-sort-numeric-asc"/> Line Numbers
          </ToolbarButton>
          <ToolbarButton onClick={() => onShowSidebar()} size={ToolbarButtonSize.Wide}>
            <i className="fa fa-eraser"/> Highlighting
          </ToolbarButton>
        </ToolbarLayout.Column>
      </ToolbarGroup>
    );
  }

  renderMain() : JSX.Element {

    const { source, syntax, number, start } = this.props.model;
    const { editMode } = this.props;

    const firstLineNumber = start === '' ? 1 : parseInt(start, 10);

    const syntaxToMode = (syntax) => {
      switch (syntax) {
        case 'actionscript3':
          return 'actionscript';
        case 'bash':
          return 'sh';
        case 'c':
        case 'cpp':
          return 'c_cpp';
        default: // xml, html, java, python, text
          // The mode matches the syntax
          return syntax;
      }
    };

    return (
      <div>
        <AceEditor
          name={this.uniqueName}
          width="initial"
          mode={syntaxToMode(syntax)}
          theme="github"
          readOnly={!editMode}
          minLines={2}
          maxLines={40}
          value={source}
          onChange={this.onSourceEdit}
          setOptions={{
            enableBasicAutocompletion: false,
            enableLiveAutocompletion: false,
            enableSnippets: false,
            showLineNumbers: number,
            tabSize: 2,
            firstLineNumber,
          }}
        />
      </div>
    );
  }
}