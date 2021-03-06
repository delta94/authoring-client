import * as React from 'react';
import { Map, List } from 'immutable';
import * as models from 'data/models';
import * as contentTypes from 'data/contentTypes';
import { Actions } from 'editors/document/org/Actions.controller';
import { Details } from 'editors/document/org/Details';
import { LabelsEditor } from 'editors/content/org/LabelsEditor';
import * as Messages from 'types/messages';
import * as org from 'data/models/utils/org';
import { Maybe } from 'tsmonad';
import { OrgComponentEditor } from './OrgComponentEditor';
import guid from 'utils/guid';
import './OrgDetailsEditor.scss';
import { TabContainer, Tab } from 'components/common/TabContainer';
import { UserState } from 'reducers/user';
import { updateActiveOrgPref } from 'actions/utils/activeOrganization';
import { duplicate } from 'actions/duplication';
import UndoRedoToolbar from 'editors/document/common/UndoRedoToolbar';
import { Document } from 'data/persistence';



export interface OrgDetailsEditorProps {
  skills: Map<string, contentTypes.Skill>;
  objectives: Map<string, contentTypes.LearningObjective>;
  placements: org.Placements;
  model: Maybe<models.OrganizationModel>;
  onEdit: (request: org.OrgChangeRequest) => void;
  editMode: boolean;
  dispatch: any;
  showMessage: (message: Messages.Message) => void;
  dismissMessage: (message: Messages.Message) => void;
  dismissModal: () => void;
  displayModal: (c) => void;
  course: models.CourseModel;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  user: UserState;
}

const enum TABS {
  Content = 0,
  Details = 1,
  Labels = 2,
  Actions = 3,
}

export interface OrgDetailsEditorState {
  currentTab: TABS;
}

/**
 * OrgDetailsEditor React Component
 */
export class OrgDetailsEditor
  extends React.PureComponent<OrgDetailsEditorProps, OrgDetailsEditorState> {
  unitsMessageDisplayed: boolean = false;

  constructor(props) {
    super(props);

    this.onNodeEdit = this.onNodeEdit.bind(this);
    this.onAddSequence = this.onAddSequence.bind(this);

    this.state = {
      currentTab: TABS.Details,
    };
  }


  onNodeEdit(request: org.OrgChangeRequest) {
    this.props.onEdit(request);
  }

  renderDetails(model: models.OrganizationModel) {
    return (
      <div className="org-tab">
        <Details
          editMode={this.props.editMode}
          model={model}
          onEdit={this.props.onEdit}
        />
      </div>
    );
  }

  renderLabels(model: models.OrganizationModel) {
    return (
      <div className="org-tab">
        <LabelsEditor
          onEdit={this.props.onEdit}
          editMode={this.props.editMode}
          model={model} />
      </div>
    );
  }

  onAddSequence() {

    const id = guid();

    const mapper = (model) => {
      const s: contentTypes.Sequence = new contentTypes.Sequence()
        .with({ id, title: 'New ' + model.labels.sequence });
      const sequences = model.sequences
        .with({ children: model.sequences.children.set(s.guid, s) });

      return model.with({ sequences });
    };

    const undo = (model: models.OrganizationModel) => {
      const children = model.sequences.children.filter(
        c => (c as any).id === id).toOrderedMap();
      const sequences = model.sequences.with({ children });
      return model.with({ sequences });
    };

    this.props.onEdit(org.makeUpdateRootModel(mapper, undo));
  }

  onTabClick(index: number) {
    this.setState({ currentTab: index });
  }

  renderTabs(model: models.OrganizationModel) {
    return (
      <TabContainer labels={['Content', 'Details', 'Labels', 'Actions']}>
        <Tab>
          {this.renderContent(model)}
        </Tab>
        <Tab>
          {this.renderDetails(model)}
        </Tab>
        <Tab>
          {this.renderLabels(model)}
        </Tab>
        <Tab>
          {this.renderActions(model)}
        </Tab>
      </TabContainer>
    );
  }

  renderActions(model: models.OrganizationModel) {
    const { dispatch, course, user } = this.props;

    function dupe() {
      dispatch(duplicate(model)).then((doc: Document) => {
        updateActiveOrgPref(
          course.idvers, user.profile.username,
          (doc.model as models.OrganizationModel).resource.id);
      });
    }

    return (
      <Actions
        onDuplicate={dupe}
        org={model}
        course={this.props.course}
      />);
  }

  renderContent(model: models.OrganizationModel) {
    return (
      <OrgComponentEditor
        {...this.props}
        onDispatch={this.props.dispatch}
        org={Maybe.just(model)}
        componentId={''}
      />
    );
  }

  render() {

    return this.props.model.caseOf({
      just: m => (
        <div className="org-details-editor">
          <div className="doc-head">
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <div className="org-details-title">
                <div className="info">Course Outline</div>
                <h3>{m.title}</h3>
              </div>
              <div className="flex-spacer"></div>
              <UndoRedoToolbar
                undoEnabled={this.props.canUndo}
                redoEnabled={this.props.canRedo}
                onUndo={this.props.onUndo.bind(this)}
                onRedo={this.props.onRedo.bind(this)} />
            </div>
            {this.renderTabs(m)}
          </div>
        </div>),
      nothing: () => null,
    });
  }

}
