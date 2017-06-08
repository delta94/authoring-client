import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import { Link }  from '../../../data/content/html/link';
import { Image }  from '../../../data/content/html/image';

import { AppServices } from '../../common/AppServices';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { TextInput } from '../common/TextInput';
import { InputLabel } from '../common/InputLabel';
import { Button } from '../common/Button';
import { LinkEditor } from './LinkEditor';
import { ImageEditor } from '../media/ImageEditor';

import '../common/editor.scss';


export interface ImageLinkEditor {
  
}

export interface ImageLinkEditorProps extends AbstractContentEditorProps<ImageLinkModel> {
  
}

export interface ImageLinkEditorState {
  
}

export interface ImageLinkModel {
  link: Link;
  image: Image;
}

/**
 * The content editor for Table.
 */
export class ImageLinkEditor 
  extends AbstractContentEditor<ImageLinkModel, ImageLinkEditorProps, ImageLinkEditorState> {
    
  constructor(props) {
    super(props);
    
    this.onImageEdit = this.onImageEdit.bind(this);
    this.onLinkEdit = this.onLinkEdit.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState: ImageLinkEditorState) {
    if (nextProps.model !== this.props.model) {
      return true;
    } 
    return false;
  }

  onImageEdit(image) {
    this.props.onEdit({ image, link: this.props.model.link });
  }

  onLinkEdit(link) {
    this.props.onEdit({ link, image: this.props.model.image });
  }

  render() : JSX.Element {

    const { link, image } = this.props.model;
    
    return (
      <div className="itemWrapper">
        <LinkEditor
          {...this.props}
          onEdit={this.onLinkEdit}
          model={link} />
        <ImageEditor 
          {...this.props}
          onEdit={this.onImageEdit}
          model={image}
          />
      </div>);
  }

}

