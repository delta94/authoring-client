import * as React from 'react';

import { bindActionCreators } from 'redux';

import * as persistence from '../../data/persistence';
import * as models from '../../data/models';
import * as courseActions from '../../actions/course';
import guid from '../../utils/guid';
import { configuration } from '../../actions/utils/config';
import { AbstractEditorProps } from '../document/common/AbstractEditor';
import { AppServices } from '../common/AppServices';
import { onFailureCallback, onSaveCompletedCallback, 
    PersistenceStrategy} from './persistence/PersistenceStrategy';
import { ListeningApproach } from './ListeningApproach';
import { lookUpByName } from './registry';
import { Resource } from '../../data/resource';

interface EditorManager {

  componentDidUnmount: boolean;

  persistenceStrategy: PersistenceStrategy;

  onSaveCompleted: onSaveCompletedCallback;

  onSaveFailure: onFailureCallback;

  stopListening: boolean;

  _onEdit: (model: models.ContentModel) => void;


}

export interface EditorManagerProps {

  dispatch: any;

  documentId: string;

  userId: string;

  userName: string;

  services: AppServices;

  course: any;

}

export interface EditorManagerState {
  editingAllowed: boolean;
  document: persistence.Document;
  editMode: boolean;
  activeSubEditorKey: string;
  undoRedoGuid: string;
}

class EditorManager extends React.Component<EditorManagerProps, EditorManagerState> {

  constructor(props) {
    super(props);

    this.state = {
      document: null,
      editingAllowed: null,
      editMode: true,
      activeSubEditorKey: null,
      undoRedoGuid: guid(),
    };

    this.componentDidUnmount = false;
    this.persistenceStrategy = null;
    this._onEdit = this.onEdit.bind(this);
    this.onUndoRedoEdit = this.onUndoRedoEdit.bind(this);

    this.onSaveCompleted = (doc: persistence.Document) => {

      if (!this.componentDidUnmount) {
        this.setState({ document: doc });
      }

    };

    this.onSaveFailure = (reason: any) => {

    };
  }

  onEdit(model: models.ContentModel) {
    const doc = this.state.document.with({ model });
    this.setState({ document: doc }, () => this.persistenceStrategy.save(doc));
  }

  onUndoRedoEdit(model: models.ContentModel) {
    const doc = this.state.document.with({ model });
    const undoRedoGuid = guid();
    this.setState({ document: doc, undoRedoGuid }, () => this.persistenceStrategy.save(doc));
  }


  initPersistence(document: persistence.Document) {

    this.persistenceStrategy = lookUpByName(document.model.modelType).persistenceStrategy;

    this.persistenceStrategy.initialize(
      document, this.props.userName,
      this.onSaveCompleted, this.onSaveFailure)
      .then((editingAllowed) => {

        if (!this.componentDidUnmount) {
          this.setState({ editingAllowed });

          const listeningApproach: ListeningApproach 
            = lookUpByName(document.model.modelType).listeningApproach;

          if ((!editingAllowed && listeningApproach === ListeningApproach.WhenReadOnly) ||
            listeningApproach === ListeningApproach.Always) {

            this.stopListening = false;
            this.listenForChanges();
          }
        }


      });
  }


  fetchDocument(courseId: string, documentId: string) {
    
    persistence.retrieveDocument(courseId, documentId)
      .then((document) => {

        // Notify that the course has changed when a user views a course
        if (document.model.modelType === models.ModelTypes.CourseModel) {
          this.props.dispatch(courseActions.courseChanged(document.model));
        }

        // Tear down previous persistence strategy
        if (this.persistenceStrategy !== null) {
          this.persistenceStrategy.destroy()
            .then((nothing) => {
              this.initPersistence(document);
            });
        } else {
          this.initPersistence(document);
        }

        this.setState({ document });

      })
      .catch(err => console.log(err));
  }

  componentWillReceiveProps(nextProps) {
    
    if (this.props.documentId !== nextProps.documentId) {
      this.stopListening = true;
      // Special processing if next document is a CourseModel - don't call fetchDocument
      if (nextProps.course && nextProps.course.model.guid === nextProps.documentId) {
        const document = new persistence.Document({
          _courseId: nextProps.course.model.guid,
          _id: nextProps.course.model.guid,
          _rev: nextProps.course.model.rev,
          model: nextProps.course.model,
        });
        // Tear down previous persistence strategy
        if (this.persistenceStrategy !== null) {
          this.persistenceStrategy.destroy()
            .then((nothing) => {
              this.initPersistence(document);
            });
        } else {
          this.initPersistence(document);
        }
        this.setState({ document });
      } else {
        this.setState({ document: null, editingAllowed: null });
        if (nextProps.course) {
          this.fetchDocument(nextProps.course.model.guid, nextProps.documentId);
        }
      }
    }
  }

  componentDidMount() {
    // Special handling for CourseModel  - don't call fetchDocument
    if (this.props.course && this.props.course.model.guid === this.props.documentId) {
      const document = new persistence.Document({
        _courseId: this.props.course.model.guid,
        _id: this.props.course.model.guid,
        _rev: this.props.course.model.rev,
        model: this.props.course.model,
      });
      // Tear down previous persistence strategy
      if (this.persistenceStrategy !== null) {
        this.persistenceStrategy.destroy()
          .then((nothing) => {
            this.initPersistence(document);
          });
      } else {
        this.initPersistence(document);
      }
      this.setState({ document });
    } else {
      if (this.props.course) {
        this.fetchDocument(this.props.course.model.guid, this.props.documentId);
      }
    }
  }


  componentWillUnmount() {
    this.stopListening = true;
    this.componentDidUnmount = true;
    if (this.persistenceStrategy !== null) {
      this.persistenceStrategy.destroy();
    }
  }

  determineBaseUrl(resource: Resource) {

    if (resource === undefined) return '';

    const pathTo = resource.fileNode.pathTo;
    const stem = pathTo
      .substr(pathTo.indexOf('content\/') + 8);
    return stem
      .substr(0, stem.lastIndexOf('\/'));
  }

  listenForChanges() {
    // persistence.listenToDocument(this.state.document)
    //     .then(document => {
    //         if (!this.stopListening) {
    //
    //             this.setState({document});
    //
    //             this.listenForChanges();
    //         }
    //
    //     })
    //     .catch(err => {
    //         if (!this.stopListening) {
    //             this.listenForChanges();
    //         }
    //     })
  }

  render(): JSX.Element {
    if (this.state.document === null || this.state.editingAllowed === null) {
      return null;
    } else {

      const courseId = (this.props.course.model as models.CourseModel).guid;
      const courseLabel = (this.props.course.model as models.CourseModel).id;
      const version = (this.props.course.model as models.CourseModel).version;

      const childProps: AbstractEditorProps<any> = {
        model: this.state.document.model,
        context: {
          documentId: this.props.documentId,
          userId: this.props.userId,
          courseId,
          resourcePath: this.determineBaseUrl((this.state.document.model as any).resource),
          baseUrl: configuration.protocol + configuration.hostname + '/webcontents',
          courseModel: this.props.course.model,
          undoRedoGuid: this.state.undoRedoGuid,
        },
        onEdit: this._onEdit,
        onUndoRedoEdit: this.onUndoRedoEdit,
        services: this.props.services,
        editMode: this.state.editMode,
      };

      const registeredEditor = lookUpByName(this.state.document.model.modelType);
      const editor = React.createElement((registeredEditor.component as any), childProps);

      return <div>{editor}</div>;
    }
  }

}

export default EditorManager;
