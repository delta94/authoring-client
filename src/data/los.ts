
import * as Immutable from 'immutable';
import * as types from './types';
import Linkable from './linkable';
import {Skill} from './skills';
import guid from '../utils/guid';

export const LOTypes = types.strEnum([
  'LO'
]);

export type LOTypes = keyof typeof LOTypes;

/**
 * Notice that the learning objective is both linkable
 * and can take annotations. This makes sense since we
 * link los to things like workbook pages as well as
 * annotate los with skills.
 */
export class LearningObjective extends Linkable {
  orgType:LOTypes=LOTypes.LO;  
  title:string="unassigned";    
  category:string="unassigned";
  expanded:boolean=false;
  parent:string="unassigned"; // a link to an LO parent so that we can go back and forth between a tree and a list
  children:Array<LearningObjective>;
      
  /**
   * Constructor
   */     
  constructor() {
    super ();
    this.children = new Array ();
  }

  /**
   * 
   */     
  addNode (aNode: LearningObjective) {
      this.children.push (aNode);
  }
    
  /**
   * 
   */     
  isLeaf ():boolean {
    if (this.children.length==0) {
          return (true);
    }
      
    return (false);
  }
   
  /**
   * 
   */  
  toJSONObject (): Object {
    var ephemeral:Object=new Object ();
      
    ephemeral ["@id"]=this.id;
    ephemeral ["@category"]=this.category;
    ephemeral ["@parent"]=this.parent;
    ephemeral ["@expanded"]=this.expanded;
    ephemeral ["#text"]=this.title;
    ephemeral ["#annotations"]=Linkable.toJSON (this.annotations);
      
    // Add all the annotations of type skill to the skill list. Currently
    // we do not define a type on annotations so for now we will assume
    // that all annotations are skills      
      
    /*  
    ephemeral ["#skills"]=new Array<string>();
      
    for (var i=0;i<this.annotations.length;i++) {
      
      ephemeral ["#skills"].push (this.annotations [i]);
    }
    */
      
    return (ephemeral);
  }  
}