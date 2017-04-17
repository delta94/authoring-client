'use strict'

import * as React from 'react';

import * as contentTypes from '../../../data/contentTypes';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';

import '../common/editor.scss';

export interface UnsupportedEditor {

}

export interface UnsupportedEditorProps extends AbstractContentEditorProps<contentTypes.Unsupported> {

}

export abstract class UnsupportedEditor extends AbstractContentEditor<contentTypes.Unsupported, UnsupportedEditorProps, {}> {

  render() : JSX.Element {
    return <div className='editorWrapper'>{JSON.stringify(this.props.model.data)}</div>;
  }

}

