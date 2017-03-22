import * as React from 'react';
import { BlockProps } from './properties';

import { removeHTML, getCaretPosition, setCaretPosition } from '../utils';

require('./CodeBlock.scss');
 
interface CodeBlock {
  _onToggleLock: any;
  _onChange: any;
  _onBlur: any;
  _onKeyPress: any;
  caretPosition: any;
}

export interface CodeBlockProps {
  blockProps: BlockProps;
  src: string; 
}

export interface CodeBlockState {
  editMode: boolean;
  src: string;
}

class CodeBlock extends React.PureComponent<CodeBlockProps, CodeBlockState> {

  constructor(props) {
    super(props);
    this.state = {
      editMode: false,
      src: this.props.src
    };

    this._onToggleLock = this.onToggleLock.bind(this);
    this._onChange = this.onChange.bind(this);
    this._onBlur = this.onBlur.bind(this);
    this._onKeyPress = this.onKeyPress.bind(this);
    
    this.caretPosition = null;
  }

  onChange(e) {

    const target = e.target;
    const currentText = target.innerHTML;

    // Strip out any HTML introduced by how contentEditable 
    // handles processing the 'Enter' key
    const cleanedText = removeHTML(currentText);

    // If the cleaned text doesn't equal the original text then we
    // know that we did clean out some HTML. We need to restore the
    // caret position back as the browser will lose it and reset it
    // to the beginning of the div  
    if (cleanedText !== currentText) {

      if (this.caretPosition === null) {
        // Work around the browser quirk that an onKeyPress won't be 
        // called on the initial key press - which if the initial key
        // press is an 'Enter' we have no caret position information to go on

        // Instead find the first <div> in the currentText and use that as the
        // current caret position 
        const divPosition = currentText.indexOf('<div>');
        this.setState({src: cleanedText }, 
          () => setCaretPosition(target, divPosition + 1));

      } else {
        this.setState({src: cleanedText }, 
          () => setCaretPosition(target, this.caretPosition + 1));
      }
      
    } else {
      this.setState({src: cleanedText });
    }

    // Persist this change
    this.props.blockProps.onEdit({src: cleanedText});
  }

  onKeyPress(e) {
    // Keep track of the position of caret 
    this.caretPosition = getCaretPosition(e.target);
  }

  onBlur() {
    if (this.state.editMode) {
      this.onToggleLock();
    }
  }

  onToggleLock() {
    const editMode = !this.state.editMode;
    this.setState({editMode});
    this.props.blockProps.onLockChange(editMode);
  }

  renderViewMode() : JSX.Element {
    
    return (
      <pre onClick={this._onToggleLock} 
        className="CodeBlock-code">
        {this.state.src}
      </pre>
    );
  }

  renderEditMode() : JSX.Element {
    
    // We cannot use JSX here to render this div because
    // the TypeScript type definitions do not seem to
    // recognize 'suppressContentEditableWarning' as a valid
    // property. 
    const element = React.createElement('pre', {
      contentEditable: true,
      suppressContentEditableWarning: true,
      children: this.state.src,
      className: "CodeBlock-code",
      onInput: this._onChange,
      onKeyPress: this._onKeyPress,
      onBlur: this._onBlur
    });
    
    return element;
  }

  render() : JSX.Element {
    if (this.state.editMode) {
      return this.renderEditMode();
    } else {
      return this.renderViewMode();
    }
  }
};

export default CodeBlock;