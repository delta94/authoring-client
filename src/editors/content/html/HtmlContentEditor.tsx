'use strict'

import * as React from 'react';
import { ContentState, EditorState, ContentBlock, convertToRaw } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import * as contentTypes from '../../../data/contentTypes';
import { AuthoringActionsHandler, AuthoringActions } from '../../../actions/authoring';
import { AppServices } from '../../common/AppServices';
import DraftWrapper from '../../content/common/draft/DraftWrapper';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import EmbeddedEditorManager from '../../manager/EmbeddedEditorManager';
import ToolbarManager from '../common/ToolbarManager';
import { htmlContentToDraft } from '../common/draft/translate';

export interface HtmlContentEditor {
  _onChange: (e: any) => void;
}

var toHtml = function(block: ContentBlock, onEditModeChange) {

  const content = {
    blocks: [block],
    entityMap: {}
  };

  const converted : string = stateToHTML(htmlContentToDraft(content as any));

  const replaced = '<div>' + converted.substring(3, converted.length - 4) +  '</div>';

  const html = {
    __html: replaced
  };

  return <div 
    key={block.key} 
    dangerouslySetInnerHTML={html} 
    onClick={() => onEditModeChange(block.key, false)}/>;
};

var toEditor = function(services, userId: string, editMode: boolean, id: string, blockKey: string, onEditModeChange) {

  return <EmbeddedEditorManager 
          onEditModeChange={onEditModeChange}
          key={id}
          editMode={editMode}
          blockKey={blockKey}
          services={services} 
          userId={userId} 
          documentId={id}/>
};

var convert = function(services, userId, activeEditId: string, content, onEditModeChange) {
  
  return content.blocks.map(block => {
    if (block.type === 'atomic') {
      return toEditor(services, userId, activeEditId === block.key,
        content.entityMap[block.entityRanges[0].key].data.id, block.key, onEditModeChange);
    } else {
      return toHtml(block, onEditModeChange);
    }
  })
  
};

export interface HtmlContentEditorProps extends AbstractContentEditorProps {

  // Initial content to display
  content: contentTypes.HtmlContent;

  onEdit: (newContent: contentTypes.HtmlContent) => void;

  editHistory: AuthoringActions[];

  userId: string;

  services: AppServices;

  blockKey?: string;

  activeSubEditorKey?: string; 
  
}

export interface HtmlContentEditorState {

  activeContent: contentTypes.HtmlContent;
}

/**
 * The content editor for HtmlContent.
 */
export abstract class HtmlContentEditor 
  extends AbstractContentEditor<HtmlContentEditorProps, HtmlContentEditorState> {
    
  constructor(props) {
    super(props);

    this.state = {
      activeContent: this.props.content
    }

    this._onChange = this.onChange.bind(this);
  }


  onChange(content: contentTypes.HtmlContent) {
    this.props.onEdit(content);
  } 


  componentWillReceiveProps(nextProps) {
    if (this.props.content !== nextProps.content) {
      this.setState({
        activeContent: nextProps.content
      })
    }
  }

  render() : JSX.Element {

    if (this.props.editMode) {
      return ( 
        <ToolbarManager toolbar={this.props.children}>
          <DraftWrapper 
              onEditModeChange={this.props.onEditModeChange}
              services={this.props.services}
              userId={this.props.userId}
              editHistory={this.props.editHistory} 
              content={this.state.activeContent} 
              locked={!this.props.editingAllowed}
              onEdit={this._onChange} />
        </ToolbarManager>);
    } else {
      
      // Do not display an actual Draft editor, but instead convert draft 
      // content into pure HTML.  Continue to style the HTML and enclosing
      // divs exactly the same way that a draft editor would style them 
      // to guarantee that the rendered HTML looks the same as Draft editor 
      // rendered content
      const pureHtml = convert(this.props.services, this.props.userId, 
        this.props.activeSubEditorKey, this.state.activeContent, this.props.onEditModeChange);
      
      const outerStyle = {
        minHeight: '300px',
        padding: '10px'
      }
      const draftStyle = {
        outline: 'none',
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word'
      };
      return <div style={outerStyle}>
              <div className="DraftEditor-root">
                <div className="DraftEditor-editorContainer">
                  <div className="public-DraftEditor-content" style={draftStyle}>
                    <div>
                      {pureHtml}
                    </div>
                  </div>
                </div>
              </div>
            </div>
      
    }
    
  }

}

