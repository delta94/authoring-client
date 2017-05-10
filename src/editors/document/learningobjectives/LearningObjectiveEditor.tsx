import * as React from 'react';
import * as Immutable from 'immutable';

import * as persistence from '../../../data/persistence';
import * as models from '../../../data/models';
import * as contentTypes from '../../../data/contentTypes';
import { LOTypes, LearningObjective } from '../../../data/los';
import * as types from '../../../data/types';
import { initWorkbook, resourceQuery, titlesForCoursesResources } from '../../../data/domain';
import * as viewActions from '../../../actions/view';

import { AbstractEditor, AbstractEditorProps, AbstractEditorState } from '../common/AbstractEditor';

import SortableTree from 'react-sortable-tree';
import { toggleExpandedForAll } from 'react-sortable-tree';
import NodeRendererDefault from 'react-sortable-tree';

import { OrgItem } from '../organization/OrganizationTypes';
import LONodeRenderer from './LONodeRenderer';
import LearningObjectiveLinker from './LearningObjectiveLinker';
import { AppContext } from '../../common/AppContext';

const tempnavstyle= {
    h2: {
        marginRight: '10px'
    }
};

interface LearningObjectiveEditor {

}

export interface LearningObjectiveEditorState extends AbstractEditorState {
  treeData : any;  
  modalIsOpen : boolean;
  model: any;
  context: AppContext;
  skills: any;
  loTarget : any;
  document: any;
  documentId: string;
}

export interface LearningObjectiveEditorProps extends AbstractEditorProps<models.CourseModel> {
  dispatch: any;
  documentId: string;
  document: any;
  userId: string;    
  context: AppContext;
}

/**
*
*/
class LearningObjectiveEditor extends AbstractEditor<models.CourseModel,LearningObjectiveEditorProps, LearningObjectiveEditorState> {

    /**
     * 
     */
    constructor(props) {
        console.log ("LearningObjectiveEditor ()");
        
        super(props, {
                        treeData: [],    
                        context: props.context,
                        skills: null,
                        loTarget: null,
                        documentId: props.context.documentId,
                        model: props.model,
                        document: {},
                        modalIsOpen: false                      
                     });                        
    }
  
    /**
     *
     */    
    componentDidMount() {                    
      console.log ("componentDidMount ()");
        persistence.retrieveDocument(this.state.context.courseId).then(course => {            
            let loObject=course ["model"]["learningobjectives"];                                    
            let loDocId=loObject.get (0);
           
            persistence.retrieveDocument(loDocId).then(doc => {
              //this.setState ({treeData: this.processData (skillsDoc ["model"]["los"])});
              this.setState ({treeData: doc ["model"]["los"],document: doc});
            }); 
            
            let skillObject=course ["model"]["skills"];                                    
            let skillDocId=skillObject.get (0);
           
            persistence.retrieveDocument(skillDocId).then(skillDoc => {
              this.setState ({skills: skillDoc ["model"]["skills"]});
            });              
        });        
    }              

    /**
     *
     */            
    loadDocument (anID:string):any {
        console.log ("loadDocument ("+anID+")");

        persistence.retrieveDocument(anID).then(doc => {
            this.setState ({modalIsOpen: false, treeData: doc.model ["los"],document: doc});
            return (doc);
        });

       return (null);         
    }             

    /**
     * 
     */
    processDataChange (newData: any) {
      console.log ("processDataChange ()");
                    
      this.saveToDB (newData);      
    }

    /**
     * 
     */
    expand(expanded) {
      this.setState({
         modalIsOpen : false,
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
     * 
     */
    static getTextFromNode (aNode: any) : string {
        
      console.log ("getTextFromNode: " + JSON.stringify (aNode));
          
      // Check for old style text nodes  
      if (aNode ['#text']) { 
        return (aNode ['#text']);
      } 

      return ("");
    }
 
    assignParent (aLOObject:LearningObjective,anId:string):void {
      console.log ("assignParent ()");

      aLOObject.parent=anId;

      for (let i=0;i<aLOObject.children.length;i++) {
        let loHelper=aLOObject.children [i];

        this.assignParent(loHelper,aLOObject.id);
      }
    }

    assignParents (newData:any):void {
    
      let immutableHelper = this.state.treeData.slice();

      if (newData) {
        console.log ("We have alternative facts, let's use those instead ...");
        //console.log ("New Tree: " + JSON.stringify (newData));
        immutableHelper=newData ["treeData"];
      }
        
      if (immutableHelper==null)
      {
        console.log ("Bump");
        return;
      }

      console.log ("assignParents ("+immutableHelper.length+")");

      for (let i=0;i<immutableHelper.length;i++) {
        this.assignParent(immutableHelper [i],"");
      }

      return (immutableHelper);      
    }

    saveToDB (newData?:any): void {
        //console.log ("saveToDB ()");
        this.setState({
          modalIsOpen : false, 
          treeData: this.assignParents (newData)
        },function (){          
            console.log ("Parented: " + JSON.stringify (this.state.treeData));
            var newModel=models.LearningObjectiveModel.updateModel (this.state.treeData);
                     
            var updatedDocument=this.state.document.set ('model',newModel);
                           
            this.setState ({'document' : updatedDocument },function () {         
              persistence.persistDocument(this.state.document)
                .then(result => {
                    console.log ("Document saved, loading to get new revision ... ");                
                    this.loadDocument (this.state.documentId);
                });
            });
        });    
    }    
        
    /**
     * Note that this manual method of adding a new node does not generate an
     * onChange event. That's why we call extractData manually as the very
     * last function call.
     */
    addNode (anEvent) {
        
        console.log ("addNode ()");
                
        var immutableHelper = this.state.treeData.slice();
        
        if (immutableHelper==null)
        {
            console.log ("Bump");
            return;
        }
        
        var newNode:LearningObjective=new LearningObjective ();
        newNode.title="New Learning Objective";
        immutableHelper.push (newNode);

        //this.extractData (immutableHelper);
        
        this.setState({
          modalIsOpen : false, 
          treeData: immutableHelper
        },function (){
          this.saveToDB ();
        });   
    }
    
    /**
     * 
     */    
    deleteNode (aNode:any): void {
        console.log ("LearningObjectiveEditor:deleteNode ()");
            
        var immutableHelper = this.state.treeData.slice();
        
        if (immutableHelper==null) {
            console.log ("Bump");
            return;
        }
                
        for (var i=0;i<immutableHelper.length;i++) {
            let testNode:LearningObjective=immutableHelper [i];
            
            if (testNode.id==aNode.id) {
                immutableHelper.splice (i,1);
                break;
            }
        }
        
        this.setState({modalIsOpen: false,treeData: immutableHelper});
    }
    
    /**
     * 
     */    
    editTitle (aNode:any, aTitle:any):void {
        console.log ("LearningObjectiveEditor:editTitle ()");
        
        //let newTitle=aTitle.title.get ("#text");
        let newTitle=aTitle.text;
            
        var immutableHelper = this.state.treeData.slice();
        
        if (immutableHelper==null) {
            console.log ("Bump");
            return;
        }
                
        for (var i=0;i<immutableHelper.length;i++) {
            let testNode:LearningObjective=immutableHelper [i];
            
            if (testNode.id==aNode.id) {
                testNode.title=newTitle;
                break;
            }
        }
        
        this.setState({modalIsOpen: false,treeData: immutableHelper});    
    }
    
    /**
     * 
     */
    linkSkill(aNode:any) {        
        console.log ("LearningObjectiveEditor:linkSkill ()");
        console.log ("aNode: " + JSON.stringify (aNode));
                
        this.setState ({modalIsOpen: true, loTarget: aNode});
    }
    
    /**
     * 
     */    
    genProps () {
        //console.log ("LearningObjectiveEditor:genProps ()");
        
        var optionalProps:Object=new Object ();
        
        optionalProps ["editNodeTitle"]=this.editTitle.bind (this);
        optionalProps ["deleteNode"]=this.deleteNode.bind (this);
        optionalProps ["linkSkill"]=this.linkSkill.bind (this);
        optionalProps ["treeData"]=this.state.treeData;

        return (optionalProps);
    }
    
    /**
     * 
     */
    closeModal () {
      console.log ("LearningObjectiveEditor: closeModal ()");
        
      this.saveToDB ();  
    }
    
    /**
     * 
     */
    createLinkerDialog () {           
      if (this.state.skills!=null) {            
        return (<LearningObjectiveLinker closeModal={this.closeModal.bind (this)} sourceData={this.state.skills} modalIsOpen={this.state.modalIsOpen} loTarget={this.state.loTarget} />);
      } else {
        console.log ("Internal error: no skills object can be empty but not null");
      }
                   
      return (<div></div>);           
    }

    /**
     * 
     */
    render() {        
        const skilllinker=this.createLinkerDialog ();          
        
        return (
                <div className="col-sm-9 offset-sm-3 col-md-10 offset-md-2">
                    <nav className="navbar navbar-toggleable-md navbar-light bg-faded">
                        <p className="h2" style={tempnavstyle.h2}>Learning Objectives</p>
                        <button type="button" className="btn btn-secondary" onClick={e => this.addNode (e)}>Add Item</button>
                        <a className="nav-link" href="#" onClick={e => this.expandAll ()}>+ Expand All</a>
                        <a className="nav-link" href="#" onClick={e => this.collapseAll ()}>- Collapse All</a>
                    </nav>
                   {skilllinker}
                    <SortableTree
                        maxDepth={3}
                        treeData={this.state.treeData}
                        onChange={ treeData => this.processDataChange({treeData}) }                        
                        nodeContentRenderer={LONodeRenderer}
                        generateNodeProps={this.genProps.bind(this)}
                    />
                </div>
        );
    }
}

export default LearningObjectiveEditor;
