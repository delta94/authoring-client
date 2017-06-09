'use strict'

import * as React from 'react';

import { AppServices } from '../../common/AppServices';
import { toggleInlineStyle, toggleBlockType, insertInlineEntity, AuthoringActionsHandler } from '../../../actions/authoring';
import { EntityTypes } from '../../../data/content/html/common';

export interface UndoRedoToolbarProps {  
  onUndo: () => void;
  onRedo: () => void;
  undoEnabled: boolean;
  redoEnabled: boolean;
}

export interface UndoRedoToolbar {
  
}

export class UndoRedoToolbar extends React.PureComponent<UndoRedoToolbarProps, {}> {

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.undoEnabled !== this.props.undoEnabled ||
      nextProps.redoEnabled !== this.props.redoEnabled; 
  }

  button(icon, handler, enabled) {
    const iconClasses = 'icon icon-' + icon;
    const style = {
      color: 'white'
    }
    const buttonStyle = {
      backgroundColor: 'black'
    }
    return (
      <button disabled={!enabled} onClick={handler} type="button" className="btn" style={buttonStyle}>
        <i style={style} className={iconClasses}></i>
      </button>
    );
  }

  render() {
    return (
      <div>
        <div className="btn-group btn-group-sm asxToolbar" role="group" aria-label="Assessment Toolbar">
          
          {/*
          {this.button('file-text-o', this.props.onAddContent, true)}
          {this.button('question', this.props.onAddQuestion, true)}
          */}

          {this.button('undo', this.props.onUndo, this.props.undoEnabled)}
          {this.button('repeat', this.props.onRedo, this.props.redoEnabled)}
          
        </div>
      </div>
      );
  }

}

export default UndoRedoToolbar;

