import * as React from 'react';
import * as Immutable from 'immutable';

import { AbstractEditor, AbstractEditorProps, AbstractEditorState } from '../common/AbstractEditor';
import { HtmlContentEditor } from '../../content/html/HtmlContentEditor';
import { TitleContentEditor } from '../../content/title/TitleContentEditor';
import { QuestionEditor } from '../../content/question/QuestionEditor';
import { ContentEditor } from '../../content/content/ContentEditor';
import { SelectionEditor } from '../../content/selection/SelectionEditor';
import { UnsupportedEditor } from '../../content/unsupported/UnsupportedEditor';
import { PageSelection } from './PageSelection';
import { Toolbar } from './Toolbar';
import * as models from '../../../data/models';
import { Resource } from '../../../data/resource';
import * as contentTypes from '../../../data/contentTypes';
import guid from '../../../utils/guid';
import * as persistence from '../../../data/persistence';
import LearningObjectiveLinker from '../../../components/LinkerDialog';

interface AssessmentEditor {
  
}

export interface AssessmentEditorProps extends AbstractEditorProps<models.AssessmentModel> {
  
}

interface AssessmentEditorState extends AbstractEditorState {
  modalIsOpen : boolean;
  skillModel: models.SkillModel;
  current: string;
}

class AssessmentEditor extends AbstractEditor<models.AssessmentModel,
  AssessmentEditorProps, 
  AssessmentEditorState>  {

  constructor(props) {
    super(props, ({
      modalIsOpen: false, 
      skillModel: new models.SkillModel,
      current: props.model.pages.first().guid,
    } as AssessmentEditorState));

    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onAddContent = this.onAddContent.bind(this);
    this.onAddQuestion = this.onAddQuestion.bind(this);
    this.onAddPool = this.onAddPool.bind(this);
    this.onAddPoolRef = this.onAddPoolRef.bind(this);
    this.onPageEdit = this.onPageEdit.bind(this);

    this.onAddPage = this.onAddPage.bind(this);
    this.onRemovePage = this.onRemovePage.bind(this);
    
  }

  componentDidMount() {                    
    this.loadSkills();
  }     
    
  loadSkills () : void {
            
    const resourceList:Immutable.OrderedMap<string, Resource>
     = this.props.courseDoc ['model']['resources'] as Immutable.OrderedMap<string, Resource>;
  
    resourceList.map((value, id) => {        
      if (value.type === 'x-oli-skills') {
        console.log ('Found skills document, loading ...');  
        persistence.retrieveDocument (this.props.context.courseId,id)
        .then((skillDocument) => {
          console.log ('Loaded skill document, assinging ...');  
          const aSkillModel:models.SkillModel = skillDocument.model as models.SkillModel;   
          this.setState ({ skillModel: aSkillModel.with (this.state.skillModel) });
        });
      }          
    });
  }     
    
  onPageEdit(page: contentTypes.Page) {
    const pages = this.props.model.pages.set(page.guid, page);
    this.handleEdit(this.props.model.with({ pages }));
  }

  onEdit(guid : string, content : models.Node) {
    const nodes = this.props.model.nodes.set(guid, content);
    this.handleEdit(this.props.model.with({ nodes }));
  }

  onTitleEdit(content: contentTypes.Title) {
    this.handleEdit(this.props.model.with({ title: content }));
  }

  onNodeRemove(guid: string) {
    this.handleEdit(this.props.model.with(
      { nodes: this.props.model.nodes.delete(guid) },
    ));
  }

  renderNode(n : models.Node) {
    if (n.contentType === 'Question') {
      return <QuestionEditor
              key={n.guid}
              editMode={this.props.editMode}
              services={this.props.services}
              context={this.props.context}
              model={n}
              onEdit={c => this.onEdit(n.guid, c)} 
              onRemove={this.onNodeRemove.bind(this)}
              />;
              
    } else if (n.contentType === 'Content') {
      return <ContentEditor
              key={n.guid}
              editMode={this.props.editMode}
              services={this.props.services}
              context={this.props.context}
              model={n}
              onEdit={c => this.onEdit(n.guid, c)} 
              onRemove={this.onNodeRemove.bind(this)}
              />;
    } else if (n.contentType === 'Selection') {
      return <SelectionEditor
              key={n.guid}
              editMode={this.props.editMode}
              services={this.props.services}
              context={this.props.context}
              model={n}
              onEdit={c => this.onEdit(n.guid, c)} 
              onRemove={this.onNodeRemove.bind(this)}
              />;
    } else {
      /*
      return <UnsupportedEditor
              key={n.guid}
              editMode={this.props.editMode}
              services={this.props.services}
              context={this.props.context}
              model={n}
              onEdit={c => this.onEdit(n.guid, c)} 
              />; */
    }
  }

  renderTitle() {
    return <TitleContentEditor 
            services={this.props.services}
            context={this.props.context}
            editMode={this.props.editMode}
            model={this.props.model.title}
            onEdit={this.onTitleEdit} 
            />;
  }

  onAddContent() {
    let content = new contentTypes.Content();
    content = content.with({ guid: guid() });
    this.addNode(content);
  }

  onAddQuestion() {
    let content = new contentTypes.Question();
    content = content.with({ guid: guid() });
    this.addNode(content);
  }

  onAddPool() {
    const pool = new contentTypes.Selection({ source: new contentTypes.Pool() });
    this.addNode(pool);
  }

  addNode(node) {
    let page = this.props.model.pages.get(this.state.current);
    page = page.with({ nodes: page.nodes.set(node.guid, node) });

    const pages = this.props.model.pages.set(page.guid, page);

    this.handleEdit(this.props.model.with({ pages }));
  }

  onAddPage() {
    const text = 'Page ' + (this.props.model.pages.size + 1);
    const page = new contentTypes.Page()
      .with({ title: new contentTypes.Title().with({ text }) });
    
    this.handleEdit(this.props.model.with(
      { pages: this.props.model.pages.set(page.guid, page) }));
  }

  onRemovePage() {
    if (this.props.model.pages.size > 1) {

      const guid = this.state.current;

      let newCurrent = this.props.model.pages.first().guid;
      if (guid === newCurrent) {
        newCurrent = this.props.model.pages.last().guid;
      }

      this.setState(
        { current: newCurrent },
        () => {
          this.handleEdit(this.props.model.with(
            { pages: this.props.model.pages.delete(guid) }));
        });
    }
  }

  onAddPoolRef() {
    const pool = new contentTypes.Selection({ source: new contentTypes.PoolRef() });
    this.addNode(pool);
  }

  /**
   * 
   */
  closeModal () {
    console.log ('closeModal ()');  
    // this.saveToDB ();
  }     

  /**
   * 
   */
  onAddSkills() {        
    console.log ('onAddSkills ()');
                 
    this.setState({ modalIsOpen: true });
  }

  /**
   * 
   */
  createLinkerDialog () {           
    if (this.state.skillModel !== null) {            
      return (<LearningObjectiveLinker 
        title="Available Skills" 
        closeModal={this.closeModal.bind (this)} 
        sourceData={this.state.skillModel.skills} 
        modalIsOpen={this.state.modalIsOpen} 
        target={new Object()} />);
    } else {
      console.log ('Internal error: skill model object can be empty but not null');
    }
                   
    return (<div></div>);           
  }  

  render() {

    const titleEditor = this.renderTitle();
    const page = this.props.model.pages.get(this.state.current);
    const nodeEditors = page.nodes.toArray().map(n => this.renderNode(n));
    const skilllinker = this.createLinkerDialog ();    
    
    return (
      <div>
        <div className="docHead">
          <Toolbar 
            undoEnabled={this.state.undoStackSize > 0}
            redoEnabled={this.state.redoStackSize > 0}
            onUndo={this.undo.bind(this)} onRedo={this.redo.bind(this)}
            onAddContent={this.onAddContent} onAddQuestion={this.onAddQuestion}/>
          
          <div className="container">
            <div className="row">
              <div className="col-4">
                {titleEditor}
              </div>
              <div className="col-8">
                <form className="form-inline">
                <PageSelection 
                  pages={this.props.model.pages} 
                  current={this.props.model.pages.get(this.state.current)}
                  onChangeCurrent={current => this.setState({ current })}
                  onEdit={this.onPageEdit}/>
                <button type="button" className="btn btn-secondary" 
                  onClick={this.onAddPage}>Add</button>
                <button type="button" className="btn btn-secondary" 
                  onClick={this.onRemovePage}>Remove</button>
                </form>
              </div>
            </div>
          </div>

          <div>
            <button type="button" className="btn btn-secondary" 
              onClick={this.onAddContent}>Add Content</button>
            <button type="button" className="btn btn-secondary" 
              onClick={this.onAddQuestion}>Add Question</button>
            <button type="button" className="btn btn-secondary" 
              onClick={this.onAddPool}>Add Pool</button>
            <button type="button" className="btn btn-secondary" 
              onClick={this.onAddPoolRef}>Add Pool Reference</button>
            <button type="button" className="btn btn-secondary" 
              onClick={this.onAddSkills}>Add Skills</button>
          </div>
          
          
          {skilllinker} 
          {nodeEditors}

        </div>
      </div>);
    
  }

}

export default AssessmentEditor;
