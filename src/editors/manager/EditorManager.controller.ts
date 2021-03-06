import { connect } from 'react-redux';
import { Map } from 'immutable';
import { Document } from 'data/persistence';
import EditorManager from './EditorManager';
import { ContentModel } from 'data/models';
import { UserProfile } from 'types/user';
import { LearningObjective, Skill } from 'data/contentTypes';
import { save } from 'actions/document';
import { State } from 'reducers';
import { CourseModel } from 'data/models/course';

interface StateProps {
  expanded: any;
  skills: Map<string, Skill>;
  objectives: Map<string, LearningObjective>;
  document: Document;
  undoRedoGuid: string;
  undoRedoActionGuid: string;
  editingAllowed: boolean;
  hasFailed: boolean;
}

interface DispatchProps {
  onSave: (documentId: string, model: ContentModel) => any;
  onDispatch: (...args: any[]) => any;
}

interface OwnProps {
  documentId: string;
  userId: string;
  userName: string;
  profile: UserProfile;
  course: CourseModel;
  orgId: string;
}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {

  const { expanded, skills, objectives, documents } = state;

  const ed = documents.get(ownProps.documentId);

  let document = null;
  let undoRedoGuid = 'Loading';
  let undoRedoActionGuid = 'Loading';
  let editingAllowed = ownProps.course.editable;
  let hasFailed = false;

  if (ed !== undefined) {
    document = ed.document;
    undoRedoGuid = ed.undoRedoGuid;
    undoRedoActionGuid = ed.undoRedoActionGuid;
    editingAllowed = ed.editingAllowed && ownProps.course.editable;
    hasFailed = ed.hasFailed;
  }

  return {
    expanded,
    skills,
    objectives,
    document,
    undoRedoGuid,
    undoRedoActionGuid,
    editingAllowed,
    hasFailed,
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
    onSave: (documentId: string, model: ContentModel) => {
      dispatch(save(documentId, model));
    },
    onDispatch: dispatch,
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(EditorManager);
