'use strict'

import * as React from 'react';

import {AbstractEditor, AbstractEditorProps, AbstractEditorState} from '../common/AbstractEditor';
import { HtmlContentEditor } from '../../content/html/HtmlContentEditor';
import { TitleContentEditor } from '../../content/title/TitleContentEditor';
import InlineToolbar from '../../content/html/InlineToolbar';
import BlockToolbar from '../../content/html//BlockToolbar';

import { AuthoringActionsHandler, AuthoringActions } from '../../../actions/authoring';

import * as models from '../../../data/models';


interface WorkbookPageEditor {
  
}

export interface WorkbookPageEditorProps extends AbstractEditorProps<models.WorkbookPageModel> {
  
}

interface WorkbookPageEditorState extends AbstractEditorState {
  
  editHistory: AuthoringActions[];
}

class WorkbookPageEditor extends AbstractEditor<models.WorkbookPageModel,
  WorkbookPageEditorProps, 
  WorkbookPageEditorState> 
  implements AuthoringActionsHandler {
    
  constructor(props) {
    super(props);

    this.state = {
      editHistory: []
    };
  }

  
  handleAction(action: AuthoringActions) {
    this.setState({
      editHistory: [action, ...this.state.editHistory]
    });
  }


  onEdit(property : string, content : any) {

    let model; 

    if (property === 'title') {
      const head = model.head.with({ title: content});
      model = this.props.model.with({ head });
        
    } else {
      model = this.props.model.with({ body: content });
    }
      
    this.props.onEdit(model);
  }

  render() {

    const locked = this.props.editingAllowed === null || this.props.editingAllowed === false;
    
    const inlineToolbar = <InlineToolbar 
                courseId={this.props.model.courseId} 
                services={this.props.services} 
                actionHandler={this} />;
    const blockToolbar = <BlockToolbar 
                documentId={this.props.documentId}
                courseId={this.props.model.courseId} 
                services={this.props.services} 
                actionHandler={this} />;

    return (
      <div>
          <TitleContentEditor 
            services={this.props.services}
            userId={this.props.userId}
            documentId={this.props.documentId}
            courseId={this.props.model.courseId}
            onEditModeChange={this.props.onEditModeChange}
            editMode={this.props.editMode}
            model={this.props.model.head.title}
            onEdit={(c) => this.onEdit('title', c)} 
            editingAllowed={this.props.editingAllowed}/>
          
          <HtmlContentEditor 
              documentId={this.props.documentId}
              courseId={this.props.model.courseId}
              inlineToolbar={inlineToolbar}
              blockToolbar={blockToolbar}
              activeSubEditorKey={this.props.activeSubEditorKey}
              onEditModeChange={this.props.onEditModeChange}
              editMode={this.props.editMode}
              services={this.props.services}
              userId={this.props.userId}
              editHistory={this.state.editHistory}
              model={this.props.model.body}
              onEdit={(c) => this.onEdit('body', c)} 
              editingAllowed={this.props.editingAllowed}>

              
          </HtmlContentEditor>
          
      </div>
    )
  }

}

export default WorkbookPageEditor;
