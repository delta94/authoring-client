import * as persistence from 'data/persistence';
import * as Immutable from 'immutable';
import { Resource } from 'data/contentTypes';
import * as Messages from 'types/messages';
import * as viewActions from 'actions/view';
import { buildFeedbackFromCurrent } from 'utils/feedback';
import { showMessage } from 'actions/messages';
import { OrganizationModel } from 'data/models';
import { EditedDocument } from 'types/document';
import { DeferredPersistenceStrategy }
  from 'editors/manager/persistence/DeferredPersistenceStrategy';
import { buildPersistenceFailureMessage } from 'utils/error';
import { ServerName } from 'data/persistence/document';

// Invoke a preview for the entire course by setting up the course package in OLI
function invokePreview(orgId: string, isRefreshAttempt: boolean, server?: ServerName) {
  return function (dispatch, getState): Promise<persistence.PreviewResult> {

    const { course } = getState();

    return persistence.initiatePreview(course.guid, orgId, isRefreshAttempt, server);
  };
}

export function preview(
  courseId: string, organizationId: string, isRefreshAttempt: boolean, redeploy: boolean = true,
  server?: ServerName) {

  return function (dispatch): Promise<any> {

    return dispatch(invokePreview(organizationId, isRefreshAttempt, server))
      .then((result: persistence.PreviewResult) => {
        if (result.type === 'MissingFromOrganization') {
          const message = buildMissingFromOrgMessage(courseId);
          dispatch(showMessage(message));
        } else if (result.type === 'PreviewNotSetUp') {
          const message = buildNotSetUpMessage();
          dispatch(showMessage(message));
        } else if (result.type === 'PreviewSuccess') {
          const refresh = result.message === 'pending';
          window.open(
            '/#preview' + organizationId + '-' + courseId
            + '?url=' + encodeURIComponent(result.activityUrl || result.sectionUrl)
            + (refresh ? '&refresh=true' : '')
            + (redeploy ? '&redeploy=true' : ''),
            courseId);
        } else if (result.type === 'PreviewPending') {
          window.open('/#preview' + organizationId + '-' + courseId, courseId);
        }
      }).catch((err) => {
        const message = buildUnknownErrorMessage(err);
        dispatch(showMessage(message));
      });
  };
}

// Invoke a preview for the current resource (ie Workbook Page) from the editor.
// The full course is not built in OLI. Instead, we just receive an HTML page with
// the workbook page contents.
export function quickPreview(courseId: string, resource: Resource) {

  return function (dispatch, getState): Promise<any> {
    const { course, documents, user } = getState();
    const document: EditedDocument = documents.get(resource.guid);

    // Flush pending changes before initiating the preview so that the user doesn't see
    // a stale preview page
    if (document.persistence instanceof DeferredPersistenceStrategy) {
      return (document.persistence as DeferredPersistenceStrategy).flushPendingChanges()
        .then(_ => persistence.initiateQuickPreview(course.guid, resource.guid))
        .catch(err => dispatch(showMessage(buildPersistenceFailureMessage(err, user.profile))));
    }

    persistence.initiateQuickPreview(course.guid, resource.guid);
    return Promise.resolve();
  };
}

function buildEditOrgAction(
  courseId: string, label: string): Messages.MessageAction {
  return {
    label,
    execute: (message: Messages.Message, dispatch) => {
      dispatch(viewActions.viewOrganizations(courseId));
    },
  };
}

function buildMissingFromOrgMessage(courseId) {

  const actions = [buildEditOrgAction(courseId, 'Edit Org')];

  const content = new Messages.TitledContent().with({
    title: 'Cannot preview.',
    message: 'Page not included in any organization.'
      + ' Click \'Edit Org\' to add to an organization',
  });
  return new Messages.Message().with({
    content,
    guid: 'PreviewProblem',
    scope: Messages.Scope.Resource,
    severity: Messages.Severity.Warning,
    canUserDismiss: true,
    actions: Immutable.List(actions),
  });

}

function buildNotSetUpMessage() {

  const actions = [];

  const content = new Messages.TitledContent().with({
    title: 'Preview not enabled.',
    message: 'Contact support to enable preview for this course package',
  });
  return new Messages.Message().with({
    content,
    guid: 'PreviewProblem',
    scope: Messages.Scope.Resource,
    severity: Messages.Severity.Warning,
    canUserDismiss: true,
    actions: Immutable.List(actions),
  });

}


function buildReportProblemAction(): Messages.MessageAction {

  const url = buildFeedbackFromCurrent(
    '',
    '',
  );

  return {
    label: 'Report Problem',
    execute: (message, dispatch) => {
      window.open(url, 'ReportProblemTab');
    },
  };
}


function buildUnknownErrorMessage(error: string) {

  const actions = [buildReportProblemAction()];

  const content = new Messages.TitledContent().with({
    title: 'Cannot preview',
    message: 'An error was encountered trying to preview this page.'
      + ' Try again and if the problem persists contact support.',
  });
  return new Messages.Message().with({
    content,
    guid: 'PreviewProblem',
    scope: Messages.Scope.Resource,
    severity: Messages.Severity.Error,
    canUserDismiss: true,
    actions: Immutable.List(actions),
  });

}
