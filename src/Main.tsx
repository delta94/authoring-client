'use strict'

import * as React from 'react';
import { returnType } from './utils/types';
import { connect }  from 'react-redux';
import { bindActionCreators } from 'redux';

import { user as userActions } from './actions/user';
import { modalActions } from './actions/modal';
import { document as documentActions } from './actions/document';

import * as persistence from './data/persistence';

import NavigationBar from './components/NavigationBar';
import Courses from './components/Courses';
import EditorManager from './editors/manager/EditorManager';
import { EditorServices, DispatchBasedServices } from './editors/manager/EditorServices';

function mapStateToProps(state: any) {

  const {
    user,
    modal,
    document,
    courses
  } = state;

  return {
    user, 
    modal,
    document,
    courses
  }
}

interface Main {
  modalActions: Object;
  documentActions: Object;
  services: EditorServices;
}

interface MainOwnProps {
  username: string
}

const stateGeneric = returnType(mapStateToProps);  
type MainReduxProps = typeof stateGeneric; 
type MainProps = MainReduxProps & MainOwnProps & { dispatch };


class Main extends React.Component<MainProps, {}> {

  constructor(props) {
    super(props);

    this.services = new DispatchBasedServices(this.props.dispatch);

    this.modalActions = bindActionCreators((modalActions as any), this.props.dispatch);
    this.documentActions = bindActionCreators((documentActions as any), this.props.dispatch);
  }

  componentDidMount() {
    let user = this.props.username;
    this.props.dispatch(userActions.login(user, user));
  }

  getView(documentId: string): JSX.Element {
    if (documentId === documentActions.VIEW_ALL_COURSES) {
      return <Courses dispatch={this.props.dispatch} courseIds={this.props.courses}/>;
    }
    else if (documentId !== null) {
      return <EditorManager 
        services={this.services} 
        userId={this.props.user.userId} 
        documentId={this.props.document}/>;
    } else {
      return null;  // TODO replace with welcome / logon screen
    }
  }

  render(): JSX.Element {
    let modalDisplay = this.props.modal !== null ? <div>{this.props.modal}</div> : <div></div>;
    
    return (
      <div style={{width: "inherit", height: "inherit"}}>
        {modalDisplay}        
		<div style={{"display": "flex", flexDirection: 'column', justifyContent: 'space-between', alignItems: 'stretch',  alignContent: 'stretch', height: "inherit"}}>
		
			<div style={{flex: "none", flexGrow: 0, order: 0, background: "#f1f1f1", border: "0px solid #c4c0c0", width: "100%", height: "32px", padding: "0px", margin: "0 0 0 0"}}>
				<img src="assets/oli-icon.png" style={{float: "left", border: "0px solid #c4c0c0", width: "32px", height: "32px", padding: "0px", margin: "0px"}} />
				<div style={{float: "left", margin: "0px", marginTop: "8px", fontSize: "12pt", fontWeight: "bold"}}>Welcome to OLI</div>
			</div>				
			
			<div style={{"display": "flex", flexGrow: 1, order: 1, margin: "0 0 4px 0", flex: 1}}>				
    			<NavigationBar documentActions={this.documentActions}/>				
				<div style={{background: "#f1f1f1", border: "1px solid #c4c0c0", padding: "2px", margin: "2px 2px 2px 2px", flex: 1}}>
				{this.getView(this.props.document)}
				</div>
			</div>
			
			<div style={{"display": "flex", flexGrow: 0, order: 2, background: "#f1f1f1", border: "0px solid #c4c0c0", width: "100%", height: "24px", margin: "2px"}}>
			Statusbar goes here if we want one
			</div>						
		</div>
      </div>
    )
  }

};

export default connect<MainReduxProps, {}, MainOwnProps>(mapStateToProps)(Main);
