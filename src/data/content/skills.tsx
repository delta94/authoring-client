
import * as Immutable from 'immutable';
import * as types from '../types';
import { Linkable } from './linkable';
import guid from '../../utils/guid';

export const SkillTypes = types.strEnum([
  'Skill'
]);

export type SkillTypes = keyof typeof SkillTypes;

export abstract class SkillModel {
    sType:string="Base";
    
  /**
   * 
   */  
  abstract toJSONObject (): Object;
    
  /**
   *
   */
  abstract increment (aValue:number): void;
     
  /**
   *
   */
  abstract decrement (aValue:number): void;
}

export class SkillModelBKT extends SkillModel {
    
  constructor () 
  {
    super ();
    this.sType="BKT";      
  }  
    
  // BKT probabilities
  pGuess:number=0.25;
  pKnown:number=0.25;
  pSlip:number=0.25;
  pMastery:number=0.95;
    
  /**
   * 
   */  
  toJSONObject (): Object {
    var ephemeral:Object=new Object ();

    ephemeral ["type"]=this.sType;  
    ephemeral ["@pGuess"]=this.pGuess;
    ephemeral ["@pKnown"]=this.pKnown;
    ephemeral ["@pSlip"]=this.pSlip;
    ephemeral ["@pMastery"]=this.pMastery;
            
    return (ephemeral);
  }
    
  /**
   *
   */
  increment (aValue:number) {
  }
    
  /**
   *
   */
  decrement (aValue:number) {
  }    
}

export class SkillModelOLI extends SkillModel {

  constructor () {
    super ();
    this.sType="OLI";      
  }    
  // OLI skill probabilities
  prob:number=0.70;
  gamma0:number=0.70;
  gamma1:number=0.70;
  lambda0:number=1.00;
    
  /**
   * 
   */  
  toJSONObject (): Object {
    var ephemeral:Object=new Object ();

    ephemeral ["type"]=this.sType;      
    ephemeral ["@p"]=this.prob;
    ephemeral ["@gamma0"]=this.gamma0;
    ephemeral ["@gamma1"]=this.gamma1;
    ephemeral ["@lambda0"]=this.lambda0;
            
    return (ephemeral);
  }
    
  /**
   *
   */
  increment (aValue:number) {
  }
    
  /**
   *
   */
  decrement (aValue:number) {
  }    
}    

/**
 * Notice that the skill class is both linkable and can take
 * annotations much like the LOs. This is done so that we can
 * link Skills to other resources that can take annotations
 * but also so that we can add annotations or other meta
 * data dynamically to skills. We might e
 */
export class Skill extends Linkable {
  orgType:SkillTypes=SkillTypes.Skill;
      
  title:string="unassigned";    
  skillModel:SkillModel=new SkillModelBKT ();
  folded:boolean=true; 
              
  constructor() {
    super ();
    
  }
   
  fromJSONObject (aData:any):void {  
     //console.log ("fromJSONObject ()");
      
     this.id=aData ["@id"];
     this.title=aData ["@title"]; 
     
     let sModel=aData ["#skillModel"];
                
     if (sModel.type=="BKT") {
       //console.log ("Assigning type: SkillModelBKT");  
       let tModel:SkillModelBKT=new SkillModelBKT ();  
       this.skillModel=tModel;
       tModel.pGuess=sModel ["@pGuess"];      
       tModel.pGuess=sModel ["@pKnown"];
       tModel.pGuess=sModel ["@pSlip"];
       tModel.pGuess=sModel ["@pMastery"];   
     }
      
     if (sModel.type=="OLI") {
       //console.log ("Assigning type: SkillModelOLI");
       let tModel:SkillModelOLI =new SkillModelOLI ();
       this.skillModel=tModel;  
       tModel.gamma0=sModel ["@gamma0"];      
       tModel.gamma1=sModel ["@gamma1"];
       tModel.lambda0=sModel ["@lambda0"];   
     }      
  }

  /**
   * 
   */  
  toJSONObject (aSkill?:Skill): Object {
    var ephemeral:Object=new Object ();
      
    if (aSkill) {
     ephemeral ["@id"]=aSkill.id;
     ephemeral ["@title"]=aSkill.title;
     ephemeral ["#skillModel"]=aSkill.skillModel.toJSONObject ();        
    } else {             
     ephemeral ["@id"]=this.id;
     ephemeral ["@title"]=this.title;
     ephemeral ["#skillModel"]=this.skillModel.toJSONObject ();
    }    
            
    return (ephemeral);
  } 
    
  /**
   *
   */
  increment (aValue:number) {
      this.skillModel.increment (aValue);
  }
    
  /**
   *
   */    
  decrement (aValue:number) {
      this.skillModel.decrement (aValue);
  }    
}