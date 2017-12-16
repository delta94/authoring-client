import * as React from 'react';
import * as Immutable from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setServerTimeSkew } from './actions/server';
import { user as userActions } from './actions/user';
import { modalActions } from './actions/modal';
import { ServerInformation } from './reducers/server';
import { UserInfo } from './reducers/user';
import * as viewActions from './actions/view';
import * as contentTypes from './data/contentTypes';
import * as models from './data/models';
import guid from './utils/guid';
import { LegacyTypes } from './data/types';

import Header from './components/Header';
import Footer from './components/Footer';
import CoursesView from './components/CoursesView';
import DocumentView from './components/DocumentView';
import ResourceView from './components/ResourceView';
import CreateCourseView from './components/CreateCourseView';
import ObjectiveSkillView from './components/objectives/ObjectiveSkillView.controller';
import { ImportCourseView } from './components/ImportCourseView';
import { PLACEHOLDER_ITEM_ID } from './data/content/org/common';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';
import Messages from './components/message/Messages.controller';

import 'react-bootstrap-typeahead/css/Typeahead.css';
import './Main.scss';

type ResourceList = {
  title: string,
  resourceType: string,
  filterFn: any,
  createResourceFn: any,
};

function res(title, resourceType, filterFn, createResourceFn) : ResourceList {
  return {
    title,
    resourceType,
    filterFn,
    createResourceFn,
  };
}

function getPathName(pathname: string): string {
  if (pathname.startsWith('/state')) {
    return '/';
  }
  return pathname;
}

const createOrg = (courseId, title, type) => {
  const g = guid();
  const id = courseId + '_' +
    title.toLowerCase().split(' ')[0] + '_'
    + g.substring(g.lastIndexOf('-') + 1);

  return new models.OrganizationModel().with({
    type,
    id,
    title,
    resource: new contentTypes.Resource().with({ title, id, guid: id }),
    version: '1.0',
  });
};

const resources = {
  organizations: res(
        'Organizations',
        LegacyTypes.organization,
        resource => resource.type === LegacyTypes.organization,
        createOrg),
  formativeassessments: res(
        'Formative Assessments',
        LegacyTypes.inline,
        resource => resource.type === LegacyTypes.inline,
        (courseId, title, type) => new models.AssessmentModel({
          type,
          title: new contentTypes.Title({ text: title }),
        })),
  summativeassessments: res(
    'Summative Assessments',
    LegacyTypes.assessment2,
    resource => resource.type === LegacyTypes.assessment2,
    (courseId, title, type) => new models.AssessmentModel({
      type,
      title: new contentTypes.Title({ text: title }),
    })),
  pages: res(
        'Workbook Pages',
        LegacyTypes.workbook_page,
        resource => resource.type === LegacyTypes.workbook_page
          && resource.id !== PLACEHOLDER_ITEM_ID,
        (courseId, title, type) => models.WorkbookPageModel.createNew(
          guid(), title, 'This is a new page with empty content'),
        ),
  pools: res(
        'Question Pools',
        LegacyTypes.assessment2_pool,
        resource => resource.type === LegacyTypes.assessment2_pool,
        (courseId, title, type) => {
          const q = new contentTypes.Question();
          const questions = Immutable.OrderedMap<string, contentTypes.Question>().set(q.guid, q);
          return new models.PoolModel({
            type,
            pool: new contentTypes.Pool({ questions, id: guid(),
              title: new contentTypes.Title({ text: title }) }),
          });
        }),
};

interface MainProps {
  location: any;
  user: any;
  modal: any;
  course: models.CourseModel;
  expanded: any;
  server: any;
  onDispatch: (...args: any[]) => any;
}

interface MainState {

}

/**
 * Main React Component
 */
@DragDropContext(HTML5Backend)
export default class Main extends React.Component<MainProps, MainState> {
  modalActions: Object;
  viewActions: Object;

  constructor(props) {
    super(props);
    const { location, onDispatch } = this.props;

    this.modalActions = bindActionCreators((modalActions as any), onDispatch);
    this.viewActions = bindActionCreators((viewActions as any), onDispatch);

    this.state = {
      current: location,
    };
  }

  componentDidMount() {
    const { onDispatch } = this.props;

    // Fire off the async request to determine server time skew
    onDispatch(setServerTimeSkew());
  }

  renderResource(resource: ResourceList) {
    const { onDispatch, server, course } = this.props;

    return (
      <ResourceView
        serverTimeSkewInMs={server.timeSkewInMs}
        course={course}
        title={resource.title}
        resourceType={resource.resourceType}
        filterFn={resource.filterFn}
        createResourceFn={resource.createResourceFn}
        dispatch={onDispatch}/>
    );
  }

  getView(url: string): JSX.Element {
    const { onDispatch, expanded, user, course } = this.props;

    if (url === '/') {
      return <CoursesView dispatch={onDispatch} userId={user.userId}/>;
    }
    if (url === '/create') {
      return <CreateCourseView dispatch={onDispatch}/>;
    }
    if (url === '/import') {
      return <ImportCourseView dispatch={onDispatch}/>;
    }
    if (url.startsWith('/objectives-') && course) {
      return <ObjectiveSkillView
          course={course}
          dispatch={onDispatch}
          expanded={expanded}
          userName={user.user}/>;
    }
    if (course) {
      const documentId = url.substr(1, url.indexOf('-') - 1);

      if (resources[documentId] !== undefined) {
        return this.renderResource(resources[documentId]);
      }
      return (
          <DocumentView
            profile={user.profile}
            dispatch={onDispatch}
            course={course}
            userId={user.userId}
            userName={user.user}
            documentId={documentId} />
      );

    }
    return undefined;

  }


  render(): JSX.Element {
    const { modal, user, onDispatch } = this.props;

    if (user === null) {
      return null;
    }

    let modalDisplay = null;
    if (modal.peek() !== undefined) {
      modalDisplay = modal
        .toArray()
        .reverse()
        .map((component, i) => <div key={i}>{component}</div>);
    }

    const currentView = this.getView(getPathName(this.props.location.pathname));

    const logoutUrl = user !== null ? user.logoutUrl : '';

    return (
        <div className="main">
          <Messages/>
          <Header dispatch={onDispatch}
            name={user.profile.firstName + ' ' + user.profile.lastName}
            email={user.profile.email}
            logoutUrl={logoutUrl}/>
          {currentView}
          {modalDisplay}
        </div>
    );
  }
}
