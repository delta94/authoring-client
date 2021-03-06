import { updateCourseResources, courseChanged } from 'actions/course';
import * as viewActions from 'actions/view';
import { Resource, ResourceState } from 'data/content/resource';
import * as models from 'data/models';
import * as persistence from 'data/persistence';
import * as Immutable from 'immutable';
import * as React from 'react';
import { adjustForSkew, compareDates, relativeToNow } from 'utils/date';
import { SortDirection, SortableTable } from '../common/SortableTable';
import SearchBar from 'components/common/SearchBar';
import { highlightMatches } from 'components/common/SearchBarLogic';
import { AssessmentType, LegacyTypes } from 'data/types';
import * as contentTypes from 'data/contentTypes';
import './ResourceView.scss';
import { caseOf } from 'utils/utils';
import guid from 'utils/guid';
import { PLACEHOLDER_ITEM_ID } from 'data/content/org/common';
import { NEW_PAGE_CONTENT } from 'data/models/workbook';
import { Maybe } from 'tsmonad';
import { modalActions } from 'actions/modal';
import { ImportOrgModal } from 'components/resourceview/ImportOrgModal';
import { ImportWbpModal } from 'components/resourceview/ImportWbpModal';
import { ImportAssessmentModal } from 'components/resourceview/ImportAssessmentModal';
import { ImportObjSkillsModal } from 'components/resourceview/ImportObjSkillsModal';
import { ActivityType } from 'data/models/embedactivity';

type TitleIcon = {
  name: string,
  icon: JSX.Element,
};

export const getNameAndIconByType = (
  r: Resource,
  embedActivityTypes: Immutable.Map<string, string>,
) => caseOf<TitleIcon>(r.type)({
  [LegacyTypes.inline]: {
    name: 'Formative Assessment',
    icon: <i className="title-icon fa fa-flask" />,
  },
  [LegacyTypes.assessment2]: {
    name: 'Summative Assessment',
    icon: <i className="title-icon fa fa-check" />,
  },
  [LegacyTypes.assessment2_pool]: {
    name: 'Question Pool',
    icon: <i className="title-icon fas fa-shopping-basket" />,
  },
  [LegacyTypes.feedback]: {
    name: 'Survey',
    icon: <i className="title-icon fas fa-poll" />,
  },
  [LegacyTypes.embed_activity]: () => {
    if (embedActivityTypes.get(r.id) === 'REPL') {
      return {
        name: 'REPL Activity',
        icon: <i className="title-icon fa fa-terminal" />,
      };
    }
    return {
      name: 'Embed Activity',
      icon: <i className="title-icon fa fa-window-restore" />,
    };
  },
  [LegacyTypes.workbook_page]: {
    name: 'Workbook Page',
    icon: <i className="title-icon far fa-file" />,
  },
  [LegacyTypes.organization]: {
    name: 'Organization',
    icon: <i className="title-icon fa fa-th-list" />,
  },
})({
  name: 'Unknown',
  icon: <i className="title-icon fa fa-question" />,
});

export interface ResourceViewProps {
  course: models.CourseModel;
  dispatch: any;
  serverTimeSkewInMs: number;
  currentOrg: string;
}

interface ResourceViewState {
  selected: Resource;
  searchText: string;
  newItemTitle: string;
  resources: Resource[];
}

export default class ResourceView extends React.Component<ResourceViewProps, ResourceViewState> {

  state = {
    ...this.state,
    selected: undefined,
    searchText: '',
    newItemTitle: '',
    resources: this.getRows(this.props),
  };

  componentWillReceiveProps(nextProps: ResourceViewProps): void {
    if (nextProps.course.resources !== this.props.course.resources) {
      this.setState({
        resources: this.state.searchText !== ''
          ? this.getRowsFilteredBySearch(this.state.searchText, nextProps)
          : this.getRows(nextProps),
      });
    }
  }

  getRows(props: ResourceViewProps): Resource[] {
    const { course } = props;

    return course.resources.toArray().filter(r =>
      r.id !== PLACEHOLDER_ITEM_ID
      && r.resourceState !== ResourceState.DELETED
      && (
        r.type === LegacyTypes.inline
        || r.type === LegacyTypes.assessment2
        || r.type === LegacyTypes.assessment2_pool
        || r.type === LegacyTypes.feedback
        || r.type === LegacyTypes.embed_activity
        || r.type === LegacyTypes.workbook_page
      ),
    );
  }

  // Filter resources shown based on title and id
  getRowsFilteredBySearch = (searchText: string, props: ResourceViewProps): Resource[] => {
    const text = searchText.trim().toLowerCase();
    const filterFn = (r: Resource): boolean => {

      if (r.id === PLACEHOLDER_ITEM_ID) {
        return false;
      }

      const { title, id } = r;
      const titleLower = title ? title.toLowerCase() : '';
      const idLower = id ? id.toLowerCase() : '';

      return text === '' ||
        titleLower.indexOf(text) > -1 ||
        idLower.indexOf(text) > -1;
    };

    return this.getRows(props).filter(filterFn);
  }

  onNewItemTitleChange = (newItemTitle: string) => {
    this.setState({
      newItemTitle,
    });
  }

  onClickResource(id) {
    const { course, currentOrg } = this.props;

    viewActions.viewDocument(id, course.idvers, Maybe.just(currentOrg));
  }

  onCreateResource = (type: LegacyTypes, activityType?: ActivityType) => {
    const { dispatch, course } = this.props;
    const { newItemTitle } = this.state;

    if (!newItemTitle) {
      return;
    }
    const title = newItemTitle;

    const resource = caseOf<models.ContentModel>(type)({
      [LegacyTypes.inline]: new models.AssessmentModel({
        type: type as AssessmentType,
        title: contentTypes.Title.fromText(title),
      }),
      [LegacyTypes.assessment2]: new models.AssessmentModel({
        type: type as AssessmentType,
        title: contentTypes.Title.fromText(title),
      }),
      [LegacyTypes.assessment2_pool]: () => {
        const q = new contentTypes.Question();
        const questions = Immutable.OrderedMap<string, contentTypes.Question>().set(q.guid, q);

        return new models.PoolModel({
          type,
          id: guid(),
          pool: new contentTypes.Pool({
            questions,
            id: guid(),
            title: contentTypes.Title.fromText(title),
          }),
        });
      },
      [LegacyTypes.feedback]: models.FeedbackModel.createNew(guid(), title, ''),
      [LegacyTypes.workbook_page]: models.WorkbookPageModel.createNew(
        guid(), title, NEW_PAGE_CONTENT),
      [LegacyTypes.embed_activity]: () => {
        const model = models.EmbedActivityModel.createNew(guid(), title, activityType);

        dispatch(courseChanged(course.with({
          embedActivityTypes: course.embedActivityTypes.set(model.id, 'REPL'),
        })));

        return model;
      },
    })(null);

    this.setState({
      newItemTitle: '',
    });

    persistence.createDocument(this.props.course.idvers, resource)
      .then((result) => {
        const r = (result as any).model.resource;

        const updated = Immutable.OrderedMap<string, Resource>([[r.guid, r]]);
        dispatch(updateCourseResources(updated));

        // update component state and keep current search
        this.onFilterBySearchText(this.state.searchText);
      });
  }

  onFilterBySearchText = (searchText: string): void => {
    // searchText state is used for highlighting matches, and resources state creates
    // one row in the table for each resource present
    this.setState({
      searchText,
      resources: this.getRowsFilteredBySearch(searchText, this.props),
    });
  }

  renderResources() {
    const { course, currentOrg } = this.props;
    const rows = this.state.resources.map(r => ({ key: r.guid, data: r }));

    const labels = [
      'Title',
      'Type',
      'Unique ID',
      'Created',
      'Last Updated',
    ];

    const comparators = [
      (direction, a, b) => safeCompare('title', 'id', direction, a, b),
      (direction, a, b) => safeCompare('type', 'title', direction, a, b),
      (direction, a, b) => safeCompare('id', 'title', direction, a, b),
      (direction, a, b) => direction === SortDirection.Ascending
        ? compareDates(a.dateCreated, b.dateCreated)
        : compareDates(b.dateCreated, a.dateCreated),
      (direction, a, b) => direction === SortDirection.Ascending
        ? compareDates(a.dateUpdated, b.dateUpdated)
        : compareDates(b.dateUpdated, a.dateUpdated),
    ];

    const highlightedColumnRenderer = (prop: string, r: Resource) => {
      return this.state.searchText.length < 3
        ? r[prop]
        : highlightMatches(prop, r, this.state.searchText);
    };

    const icon = (r: Resource) =>
      getNameAndIconByType(r, course.embedActivityTypes).icon;
    const resourceType = (r: Resource) =>
      getNameAndIconByType(r,  course.embedActivityTypes).name;

    const titleColumnRenderer = (r: Resource) => {
      const link = resource => element => (
        <a className="btn-link"
          href={`/#${course.idvers}/${resource.id}?organization=${currentOrg}`}>
          {element}
        </a>
      );
      const title = link(r)(highlightedColumnRenderer('title', r));
      return (
        <span>{title}</span>
      );
    };

    const columnRenderers = [
      (r: Resource) => titleColumnRenderer(r),
      (r: Resource) => <span>{icon(r)} {resourceType(r)}</span>,
      (r: Resource) => highlightedColumnRenderer('id', r),
      (r: Resource) => <span>{relativeToNow(
        adjustForSkew(r.dateCreated, this.props.serverTimeSkewInMs))}</span>,
      (r: Resource) => <span>{relativeToNow(
        adjustForSkew(r.dateUpdated, this.props.serverTimeSkewInMs))}</span>,
    ];

    return (
      <div>

        {this.renderCreation()}

        <div className="card mb-4 shadow-sm search">
          <div className="card-header">
            All Resources
          </div>
          <div className="card-body">
            <SearchBar
              className="inlineSearch"
              placeholder="Search by Title or Unique ID"
              onChange={this.onFilterBySearchText}
            />
            <SortableTable
              style={{ tableLayout: 'fixed', width: '100%' }}
              model={rows}
              columnComparators={comparators}
              columnRenderers={columnRenderers}
              columnLabels={labels} />
          </div>
        </div>
      </div>
    );
  }

  renderCreation() {
    const { course, dispatch } = this.props;
    const { newItemTitle } = this.state;
    const isTitleValid = newItemTitle.trim() !== '';
    const validity = isTitleValid ? '' : 'is-invalid';
    const titleClasses = `form-control mb-2 mr-sm-2 mb-sm-0 ${validity}`;

    return (
      <div className="table-toolbar">
        <div className="card mb-4 shadow-sm create">
          <div className="card-header">
            Create New
          </div>
          <div className="card-body">
            <div className="btn-group">
              <input type="text"
                style={{ width: 300 }}
                value={newItemTitle}
                disabled={!course.editable}
                className={titleClasses}
                id="inlineFormInput"
                onChange={({ target: { value } }) => this.setState({ newItemTitle: value })}
                placeholder="Enter title for new resource" />
              <div className="dropdown">
                <button
                  style={{ height: 38, border: 'none' }}
                  disabled={!course.editable || !isTitleValid}
                  className="btn btn-md btn-primary dropdown-toggle"
                  data-toggle="dropdown">{'Choose type... '}
                </button>
                <div className="dropdown-menu dropdown-menu-right">
                  <button
                    className="dropdown-item"
                    onClick={() => this.onCreateResource(LegacyTypes.workbook_page)}>
                    Create Workbook Page
                </button>
                  <button
                    className="dropdown-item"
                    onClick={() => this.onCreateResource(LegacyTypes.inline)}>
                    Create Formative Assessment
                </button>
                  <button
                    className="dropdown-item"
                    onClick={() => this.onCreateResource(LegacyTypes.assessment2)}>
                    Create Summative Assessment
                </button>
                  <button
                    className="dropdown-item"
                    onClick={() => this.onCreateResource(LegacyTypes.assessment2_pool)}>
                    Create Question Pool
                </button>
                <button
                    className="dropdown-item"
                    onClick={() => this.onCreateResource(LegacyTypes.feedback)}>
                    Create Survey
                </button>
                <button
                    className="dropdown-item"
                    onClick={() => this.onCreateResource(
                      LegacyTypes.embed_activity, ActivityType.REPL)}>
                    Create REPL Activity
                </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card mb-4 shadow-sm import">
          <div className="card-header">
            Import Existing
          </div>
          <div className="card-body" style={{ flexDirection: 'row' }}>
            <button onClick={() => {
              dispatch(modalActions.display(
                <ImportWbpModal
                  updateCourseResources={updated => dispatch(updateCourseResources(updated))}
                  dismissModal={() => dispatch(modalActions.dismiss())}
                  course={this.props.course}
                />,
              ));
            }}
              type="button" className="btn btn-md btn-primary import-button">
              Workbook Page
            </button>
            <button disabled onClick={() => {
              dispatch(modalActions.display(
                <ImportObjSkillsModal dismissModal={() => dispatch(modalActions.dismiss())} />,
              ));
            }}
              type="button" className="btn btn-md btn-primary import-button">
              Objectives and Skills
            </button>
            <button disabled onClick={() => {
              dispatch(modalActions.display(
                <ImportOrgModal dismissModal={() => dispatch(modalActions.dismiss())} />,
              ));
            }}
              type="button" className="btn btn-md btn-primary import-button">
              Organization
            </button>
            <button disabled onClick={() => {
              dispatch(modalActions.display(
                <ImportAssessmentModal dismissModal={() => dispatch(modalActions.dismiss())} />,
              ));
            }}
              type="button" className="btn btn-md btn-primary import-button">
              Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="resource-view container-fluid new">
        <div className="document">
          <div className="container-fluid editor">
            {this.renderResources()}
          </div>
        </div>
      </div>
    );
  }
}

export function safeCompare(primaryK: string, secondaryK: string, direction: SortDirection, a, b,
                            options = {}) {

  if (a[primaryK] === null && b[primaryK] === null) {
    return 0;
  }
  if (a[primaryK] === null) {
    return direction === SortDirection.Ascending ? 1 : -1;
  }
  if (b[primaryK] === null) {
    return direction === SortDirection.Ascending ? -1 : 1;
  }
  if (a[primaryK] === b[primaryK]) {
    if (a[secondaryK] === b[secondaryK]) {
      return 0;
    }
    return safeCompare(secondaryK, primaryK, direction, a, b, options);
  }
  return direction === SortDirection.Ascending
    ? a[primaryK].localeCompare(b[primaryK], 'en-US', options)
    : b[primaryK].localeCompare(a[primaryK], 'en-US', options);
}

export function safeCompareNatural(primaryK: string, secondaryK: string, direction: SortDirection,
                                   a, b) {
  return safeCompare(primaryK, secondaryK, direction, a, b, { numeric: true });
}
