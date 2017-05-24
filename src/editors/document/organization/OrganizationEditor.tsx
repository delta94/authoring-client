import * as React from 'react';
import { PropTypes } from 'react';
import * as Immutable from 'immutable';

import * as persistence from '../../../data/persistence';
import * as models from '../../../data/models';
import * as contentTypes from '../../../data/contentTypes';
import * as types from '../../../data/types';
import {Resource} from "../../../data/resource";
import Linkable from '../../../data/linkable';
import { initWorkbook, resourceQuery, titlesForCoursesResources } from '../../../data/domain';
import * as viewActions from '../../../actions/view';

import { AbstractEditor, AbstractEditorProps, AbstractEditorState } from '../common/AbstractEditor';

import SortableTree from 'react-sortable-tree';
import { toggleExpandedForAll } from 'react-sortable-tree';
import NodeRendererDefault from 'react-sortable-tree';

import {OrgContentTypes,IDRef,OrgItem,OrgSection,OrgSequence,OrgModule,OrgOrganization} from '../../../data/org'
import OrganizationNodeRenderer from './OrganizationNodeRenderer';
import LearningObjectiveLinker from '../../../components/LinkerDialog';

import { AppContext } from '../../common/AppContext';

const tempnavstyle=
{
    h2:
    {
        marginRight: '10px'
    }
};

interface OrganizationEditor 
{

}

export interface OrganizationEditorState extends AbstractEditorState 
{    
  treeData : any;  
  orgData: OrgOrganization;
  loModalIsOpen : boolean;
  pagesModalIsOpen : boolean;
  model: any;
  context: AppContext;
  los: models.LearningObjectiveModel;
  pages: any;
  orgTarget : any;
  document: any;
  documentId: string;
  titleIndex:number;    
}

export interface OrganizationEditorProps extends AbstractEditorProps<models.OrganizationModel>
{
  dispatch: any;
  documentId: string;
  document: any;
  userId: string;    
  context: AppContext;
}

/**
*
*/
class OrganizationEditor extends AbstractEditor<models.OrganizationModel,OrganizationEditorProps, OrganizationEditorState>
{    
    /**
     * 
     */
    constructor(props) {
      super(props, {
        treeData: [],
        orgData: [],
        context: props.context,
        los: null,
        pages: null,
        orgTarget: null,
        documentId: props.context.documentId,
        model: props.model,
        document: {},                
        loModalIsOpen: false,
        pagesModalIsOpen: false, 
        titleIndex: 0
      });  
    }
        
    /**
     *
     */    
    componentDidMount() {                    
      console.log ("componentDidMount ()");

      let docu = new persistence.Document({
        _courseId: this.props.context.courseId,
        _id: this.props.model.guid,
        model: this.props.model
      });
                
      this.setState({orgData: this.props.model.toplevel, treeData: this.props.model.organization, document: docu});
        
      this.loadLearningObjectives ();
      
      this.loadPages ();  
        
      this.loadActivities ();
    }
    
    /**
     * 
     */
    loadLearningObjectives () : void {
      console.log ("loadLearningObjectives ()");
            
      let resourceList:Immutable.OrderedMap<string, Resource>=this.props.courseDoc ["model"]["resources"] as Immutable.OrderedMap<string, Resource>;
  
      //console.log ("Resources: " + JSON.stringify (resourceList));  
        
      resourceList.map((value, id) => {        
        if (value.type=="x-oli-learning_objectives") {
          persistence.retrieveDocument (this.props.context.courseId,id).then(loDocument => 
          {
            let loModel:models.LearningObjectiveModel=loDocument.model as models.LearningObjectiveModel;   
            this.setState ({los: loModel.with (this.state.los)});
          });
        }          
      })  
    }    

    /**
     * 
     */
    loadPages () : void {
      console.log ("loadLearningObjectives ()");
            
      let resourceList:Immutable.OrderedMap<string, Resource>=this.props.courseDoc ["model"]["resources"] as Immutable.OrderedMap<string, Resource>;

      let pageList:Array<Linkable>=new Array <Linkable>();  
        
      resourceList.map((value, id) => {        
        if (value.type=="x-oli-workbook_page") {
          let pageLink:Linkable=new Linkable ();
          pageLink.id=value.guid;
          pageLink.title=value.title;
          pageList.push (pageLink);             
        }          
      })  
        
      this.setState ({pages: pageList});  
    }    
    
    /**
     * 
     */
    loadActivities () : void {
      console.log ("loadActivities ()");
            
      let resourceList:Immutable.OrderedMap<string, Resource>=this.props.courseDoc ["model"]["resources"] as Immutable.OrderedMap<string, Resource>;
  
      resourceList.map((value, id) => {        
        if (value.type=="x-oli-inline-assessment") {
          persistence.retrieveDocument (this.props.context.courseId,id).then(loDocument => 
          {

          });
        }          
      })  
    }     
    
    /**
     *
     */            
    loadDocument (anID:string):any {
        console.log ("loadDocument ("+anID+")");
      let docu = new persistence.Document({
        _courseId: this.props.context.courseId,
        _id: this.props.model.guid,
        model: this.props.model
      });
      this.setState({loModalIsOpen: false, treeData: this.props.model.organization, document: docu});
      //   persistence.retrieveDocument(anID).then(doc => {
      //
      //       console.log ("Loaded doc: " + JSON.stringify (doc));
      //
      //       this.setState ({loModalIsOpen: false, treeData: doc.model ["organization"],document: doc});
      //       return (doc);
      //   });
      //
      //  return (null);
    }
    
    /**
     * 
     */
    /*
    saveToDB (newData?:any): void {
      console.log ("saveToDB ()");
        
      if (newData) {  
        let newModel=models.OrganizationModel.updateModel (this.state.orgData,newData);
                     
        let updatedDocument=this.state.document.set ('model',newModel);
          
        this.setState ({loModalIsOpen: false, 'document' : updatedDocument },function () {           
          persistence.persistDocument(this.state.document)
            .then(result => {                
              this.loadDocument (this.state.documentId);
          });
        });         
      } else {         
        let newModel=models.OrganizationModel.updateModel (this.state.orgData,this.state.treeData);
                     
        let updatedDocument=this.state.document.set ('model',newModel);

        this.setState ({loModalIsOpen: false, 'document' : updatedDocument },function () {         
          persistence.persistDocument(this.state.document)
            .then(result => {                
              this.loadDocument (this.state.documentId);
          });
        });
      }      
    } 
    */  
    
    onEdit(newData?:any) {
        
      let newModel  

      if (newData) {
        newModel=models.OrganizationModel.updateModel (this.props.model, this.state.orgData,newData);
      } else {
        newModel=models.OrganizationModel.updateModel (this.props.model, this.state.orgData,this.state.treeData);
      }  
              
      this.props.onEdit(newModel);
        
      //this.setState ({treeData: newData}); 
    }    

    /**
     * This method is called by the tree component and even though we could access
     * the state directly we're going to assume that the tree component made some
     * changes that haven't been reflected in the global component state yet.
     */
    processDataChange (newData: any) {
      console.log ("processDataChange ()");
                    
      this.onEdit (newData ["treeData"]);      
    }    
    
    /**
     * 
     */
    componentWillReceiveProps (newProps:OrganizationEditorProps) {
      this.setState({treeData: this.props.model.organization});  
    }

    /**
     * 
     */
    expand(expanded) {
        this.setState({
            treeData: toggleExpandedForAll({
                treeData: this.state.treeData,
                expanded,
            }),
        });
    }

    /**
     * 
     */
    expandAll() {
        this.expand(true);
    }

    /**
     * 
     */
    collapseAll() {
        this.expand(false);
    }
    
    /**
     * Note that this manual method of adding a new node does not generate an
     * onChange event. That's why we call extractData manually as the very
     * last function call.
     */
    addNode (anEvent) {
        console.log ("addNode ()");
        
        var immutableHelper = this.state.treeData.slice()
        
        if (immutableHelper==null)
        {
            console.log ("Bump");
            return;
        }
        
        var newNode:OrgSequence=new OrgSequence ();
        newNode.title=("Title " + this.state.titleIndex);
        immutableHelper.push (newNode);
        
        this.setState ({titleIndex: this.state.titleIndex+1});

        this.onEdit (immutableHelper);    
    }    

    /**
     * 
     */
    findTreeParent (aTree:any,aNode:any) : Array<Object> {
      console.log ("findTreeParent ("+aNode.id+")");
        
      for (var i=0;i<aTree.length;i++) {
        let testNode:OrgItem=aTree [i];
            
        if (testNode.id==aNode.id) {
         return (aTree);
        }
            
        // We can test length here because we always make sure this object exists
        if (testNode.children.length>0) {
          let result:Array<Object>=this.findTreeParent (testNode.children,aNode);
                
          if (result!=null) {
            return (result);
          }
        }
      }
        
      return (null);
    }    
    
    /**
     * 
     */    
    deleteNode (aNode:any): void {
        console.log ("LearningObjectiveEditor:deleteNode ()");
          
        let immutableHelper = this.state.treeData.slice();
                
        let parentArray:Array<Object>=this.findTreeParent (immutableHelper,aNode);
        
        if (immutableHelper==null) {
            console.log ("Bump");
            return;
        }
        
        if (parentArray!=null) {
            console.log ("We have an object, performing edit ...");
        }
        else {
           console.log ("Internal error: node not found in tree");
        }        
                        
        for (var i=0;i<parentArray.length;i++) {
            let testNode:OrgItem=parentArray [i] as OrgItem;
            
            if (testNode.id==aNode.id) {
                parentArray.splice (i,1);
                break;
            }
        }

        this.onEdit (immutableHelper);    
    }
    
    /**
     * 
     */    
    addPage (aNode:any): void {
        console.log ("LearningObjectiveEditor:addPage ()");
        
        this.linkPage (aNode);                         
    }    
        
    /**
     * 
     */    
    editTitle (aNode:any, aTitle:any):void {
        console.log ("OrganizationEditorr:editTitle ()");
                
        let newTitle=aTitle.text;
        let immutableHelper = this.state.treeData.slice();
        
        console.log ("Tree: " + JSON.stringify (immutableHelper));
        
        let parentArray:Array<Object>=this.findTreeParent (immutableHelper,aNode);
        
        if (immutableHelper==null) {
            console.log ("Bump");
            return;
        }
        
        if (parentArray!=null) {
            console.log ("We have an object, performing edit ...");
        }
        else {
           console.log ("Internal error: node not found in tree");
        }
                    
        for (var i=0;i<parentArray.length;i++) {
            let testNode:OrgItem=parentArray [i] as OrgItem;
            
            if (testNode.id==aNode.id) {
                testNode.title=newTitle;
                break;
            }
        }
            
        this.onEdit (immutableHelper);   
    }
    
    /**
     * 
     */
    linkPage(aNode:any) {        
        console.log ("OrganizationEditor:linkPage ()");
        //console.log ("aNode: " + JSON.stringify (aNode));
                
        this.setState ({pagesModalIsOpen: true, orgTarget: aNode});
    }     
    
    /**
     * 
     */
    linkLO(aNode:any) {        
        console.log ("OrganizationEditor:linkLO ()");
        //console.log ("aNode: " + JSON.stringify (aNode));
                
        this.setState ({loModalIsOpen: true, orgTarget: aNode});
    }    

    /**
    * We need to move this to a utility class because there are different instances
    * of it 
    */
    toFlat (aTree:Array<Linkable>, aToList:Array<Linkable>) : Array<Linkable>{
      console.log ("toFlat ()");
        
      if (!aTree) {
        return [];
      }  
        
      for (let i=0;i<aTree.length;i++) {
        let newObj:Linkable=new Linkable ();
        newObj.id=aTree [i].id;
        newObj.title=aTree [i].title;
        aToList.push (newObj);
          
        if (aTree [i]["children"]) {
          console.log ("Lo has children, processing ...");  
          let tList=aTree [i]["children"];
          this.toFlat (tList,aToList);
        }
      }
        
      return (aToList);  
    }
    
    /**
     * 
     */    
    genProps () {
        //console.log ("OrganizationEditor:genProps ()");
        
        var optionalProps:Object=new Object ();
        
        optionalProps ["editNodeTitle"]=this.editTitle.bind (this);
        optionalProps ["linkAnnotation"]=this.linkLO.bind (this);        
        optionalProps ["deleteNode"]=this.deleteNode.bind (this);
        optionalProps ["treeData"]=this.state.treeData;
        optionalProps ["addPage"]=this.addPage.bind (this);
        
        return (optionalProps);
    }
    
    /**
     * 
     */
    closeLOModal () {
      console.log ("LearningObjectiveEditor: closeLOModal ()");
        
      this.onEdit ();
    }
    
    /**
     * 
     */
    closePagesModal () {
      console.log ("LearningObjectiveEditor: closePagesModal ()");
        
      let immutableHelper = this.state.treeData.slice();
                
      let parentArray:Array<Object>=this.findTreeParent (immutableHelper,this.state.orgTarget);
        
      if (immutableHelper==null) {
        console.log ("Bump");
        return;
      }
        
      if (parentArray!=null) {
        console.log ("We have an object, performing edit ...");
      } else {
        console.log ("Internal error: node not found in tree");
      }
                    
      for (var i=0;i<parentArray.length;i++) {
        let testNode:OrgItem=parentArray [i] as OrgItem;
            
        if (testNode.id==this.state.orgTarget.id) {
          var newNode:OrgItem=new OrgItem ();
          newNode.title=("Title " + this.state.titleIndex);
          testNode.children.push (newNode);
          break;
        }
      }
            
      this.onEdit (immutableHelper);        
        
      //this.onEdit ();
    }    
    
    /**
     * 
     */
    createLinkerDialog () {           
      if (this.state.los!=null) {            
        return (<LearningObjectiveLinker title="Available Learning Objectives" closeModal={this.closePagesModal.bind (this)} sourceData={this.toFlat (this.state.los.los,new Array<Linkable>())} modalIsOpen={this.state.pagesModalIsOpen} target={this.state.orgTarget} />);
      } else {
        console.log ("Internal error: learning objectives object can be empty but not null");
      }
                   
      return (<div></div>);           
    }
    
    /**
     * 
     */
    createPageLinkerDialog () {           
      if (this.state.pages!=null) {            
        return (<LearningObjectiveLinker title="Available Workbook Pages" closeModal={this.closeLOModal.bind (this)} sourceData={this.state.pages} modalIsOpen={this.state.loModalIsOpen} target={this.state.orgTarget} />);
      } else {
        console.log ("Internal error: pages array object can be empty but not null");
      }
                   
      return (<div></div>);           
    }    
            
    /**
     * 
     */
    render() 
    {      
      const lolinker=this.createLinkerDialog ();  
      const pagelinker=this.createPageLinkerDialog ();
      
      return (
              <div>
                  <div>
                      <h2 className="h2 organize" style={tempnavstyle.h2}>Course Content</h2>
                      <button type="button" className="btn btn-secondary" onClick={e => this.addNode (e)}>Add Item</button>
                      <a className="btn btn-secondary" href="#" onClick={e => this.expandAll ()}>+ Expand All</a>
                      <a className="btn btn-secondary" href="#" onClick={e => this.collapseAll ()}>- Collapse All</a>
                  </div>
                  {lolinker}
                  {pagelinker}
                  <SortableTree
                      maxDepth={5}
                      treeData={this.state.treeData}
                      onChange={ treeData => this.processDataChange({treeData}) }
                      nodeContentRenderer={OrganizationNodeRenderer}
                      generateNodeProps={this.genProps.bind(this)} 
                  />
              </div>
      );
    }
}

export default OrganizationEditor;
