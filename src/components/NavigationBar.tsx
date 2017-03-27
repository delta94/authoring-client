/**
*
*/
import * as React from 'react';

/**
*
*/
interface NavigationBarState 
{
   closed: boolean
}

/**
*
*/
export interface NavigationBarProps {
  viewActions: any;
}

/**
 * 
 */
function FoldInButton(props) 
{
  return (
    <a href="#" onClick={props.onClick}>Collapse Menu</a>
  );
}

/**
 * 
 */
function FoldOutButton(props) 
{
  return (
    <a href="#" onClick={props.onClick}>Open</a>
  );
}

// Nick, do whatever you feel you have to here
const navbarStyles=
{
    openMenu:
    {
        width: '200px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        alignContent: 'stretch',
        height: 'inherit',
        borderRight : '1px solid grey'
    },
    closedMenu:
    {
        width: '64px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        alignContent: 'stretch',
        height: 'inherit',
        borderRight : '1px solid grey'
    },
    mainMenu:
    {
        flex: "none",
        flexGrow: 1,
        order: 0,
        border: "0px solid #c4c0c0",
        padding: "0px",
        margin: "0 0 0 0"        
    },
    verticalMenu:
    {
        listStyleType : 'none'
    },
    bottomMenu:
    {
        margin: "0 0 0 14px",
        height: "24px"
    },
    sidebar: {
        paddingLeft: 0,
        paddingRight: 0,
        'position': 'fixed',
        top: '58px',
        bottom: 0,
        left: 0,
        zIndex: 1000,
        overflowX: 'hidden',
        overflowY: 'auto',
    }
};

/**
*
*/
export default class NavigationBar extends React.Component<NavigationBarProps, NavigationBarState> 
{    
     opts = [
                {
                    label: "Course Content",
                    icon: "C",
                    staticContent: false,
                    onclick: this.placeholderMenuHandler
                },
                {
                    label: "Content",          
                    staticContent: true,
                    onclick: this.placeholderMenuHandler     
                },     
                {
                    label: "Pages",
                    icon: "O",           
                    staticContent: false,
                    onclick: this.placeholderMenuHandler                        
                },
                { 
                    label: "Activities",
                    icon: "O",
                    staticContent: false,
                    onclick: this.placeholderMenuHandler                        
                },
                {
                    label: "Learning",          
                    staticContent: true,
                    onclick: this.placeholderMenuHandler                       
                },                
                {
                    label: "Learning Objectives",
                    icon: "A",           
                    staticContent: false,
                    onclick: this.placeholderMenuHandler                        
                },
                {
                    label: "Assets",          
                    staticContent: true,
                    onclick: this.placeholderMenuHandler
                },                
                {
                    label: "Media",
                    icon: "M",
                    staticContent: false,
                    onclick: this.placeholderMenuHandler
                },
                {
                    label: "Add-Ons",
                    icon: "L",
                    staticContent: false,
                    onclick: this.placeholderMenuHandler                        
                }
              ];
    
    constructor(props) 
    {     
        super(props);
        this.state={closed: false};
    }

    handleFoldIn(event: any) 
    {
        console.log ("handleFoldIn()");
        this.setState({closed: true});
    }

    handleFoldOut(event: any) 
    {
        console.log ("handleFoldOut()");
        this.setState({closed: false});
    }    
    
    /**
     * 
     */
    placeholderMenuHandler (props)
    {
        console.log ("placeHolderMenuHanlder ()");
    }    
    
    generateMenuItem (closed:boolean, item: any)
    {
        if (item.staticContent==true)
        {
            return (<h2 key={item.label}>{item.label}</h2>);
        }
                
        if (closed==true)
        {
           return (<li key={item.label} className="nav-item"><a className="nav-link" onClick={item.onclick}>{item.icon}</a></li>);
        } 

        return (<li key={item.label} className="nav-item"><a className="nav-link" onClick={item.onclick}>{item.label}</a></li>);   
    }
    
    /**
     * We included this dedicated menu generator to ensure we could insert main menu options
     * dynamically from external data and even from a marktplace (yes we can)
     */
    generateMenu (closed:boolean)
    {
        console.log ("generateMenu ("+closed+")");
        
        return (this.opts.map(item => this.generateMenuItem (closed,item)));                
    }
         
    /**
     * Main render function
     */
    render() 
    {
        let menuControl = null;        
        let mStyle = null;
        
        // Bad way of doing this, will be changed soon!
        this.opts [0].onclick=this.props.viewActions.editOrganization;        
        this.opts [1].onclick=this.props.viewActions.viewAllCourses;
        
        if (this.state.closed==true) 
        {
            menuControl = <FoldOutButton onClick={ e => this.handleFoldOut(e) } />;
            mStyle = navbarStyles.closedMenu as any;
        }
        else 
        {
            menuControl = <FoldInButton onClick={ e => this.handleFoldIn(e) } />;
            mStyle = navbarStyles.openMenu as any;
        }
        
        let menuData=this.generateMenu(this.state.closed);
        
        return (
                <nav style={navbarStyles.sidebar} className="col-sm-3 col-md-2 hidden-xs-down sidebar">
                    <h1>Title of Course</h1>                    
                    <ul className="nav nav-pills flex-column">
                        {menuData}
                    </ul>
                </nav>
            );
    }
}
