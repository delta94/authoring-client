import * as React from 'react';
import * as Immutable from 'immutable';
import * as persistence from 'data/persistence';
import * as viewActions from 'actions/view';
import { showMessage } from 'actions/messages';
import * as Messages from 'types/messages';

import './ImportCourseView.scss';
import { Severity, Toast } from 'components/common/Toast';
import { CourseCreation } from 'components/CourseCreation';
import { buildGeneralErrorMessage } from 'utils/error';

export interface ImportCourseViewProps {
  dispatch: any;
}

export interface ImportCourseViewState {

}

function buildImportMessage(): Messages.Message {

  const content = new Messages.TitledContent().with({
    title: 'Importing course',
    message: 'Your course is importing. To check on the progress, reload the page.',
  });

  return new Messages.Message().with({
    content,
    actions: Immutable.List([Messages.RELOAD_ACTION]),
    canUserDismiss: true,
    severity: Messages.Severity.Information,
    scope: Messages.Scope.Resource,
  });
}

export class ImportCourseView
  extends React.PureComponent<ImportCourseViewProps, ImportCourseViewState> {

  constructor(props) {
    super(props);

    this.onImport = this.onImport.bind(this);
  }

  onImport(inputText: string) {
    const { dispatch } = this.props;

    persistence.importPackage(inputText)
      .then((_) => {
        viewActions.viewAllCourses();
        dispatch(showMessage(buildImportMessage()));
      })
      .catch(err => dispatch(showMessage(
        buildGeneralErrorMessage(`There was an error importing the course: ${err.message}`))));
  }

  render() {
    const toastIcon = <i className="fa fa-exclamation-circle" />;
    const toastHeading = 'Note';
    const toastContent =
      <React.Fragment>
        <p>Importing an existing OLI course can take several minutes,
          especially if the course is large and contains many assets.
        </p>
      </React.Fragment>;
    const toast =
      <Toast
        style={{ width: 600 }}
        icon={toastIcon}
        heading={toastHeading}
        content={toastContent}
        severity={Severity.Warning} />;

    return (
      <CourseCreation
        title="Import a course from SVN"
        buttonLabel="Import Course"
        placeholder="e.g. https://svn.oli.cmu.edu/svn/content/biology/intro_biology/trunk/"
        toast={toast}
        onSubmit={this.onImport}
      />
    );
  }
}
