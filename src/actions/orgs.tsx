
import * as Immutable from 'immutable';
import * as persistence from 'data/persistence';
import * as models from 'data/models';
import * as org from 'data/models/utils/org';
import createGuid from 'utils/guid';
import { NavigationItem } from 'types/navigation';
import * as viewActions from 'actions/view';
import { showMessage, dismissSpecificMessage } from 'actions/messages';
import * as Messages from 'types/messages';
import { ModalMessage } from 'utils/ModalMessage';
import { modalActions } from 'actions/modal';
import { containsUnitsOnly } from 'editors/document/org/utils';
import * as contentTypes from 'data/contentTypes';
import { buildConflictMessage } from 'utils/error';
import { CourseIdVers } from 'data/types';
import { Maybe } from 'tsmonad';
import { State } from 'reducers';

enum ChangeType {
  Normal,
  Undo,
  Redo,
}


export type REQUEST_INITIATED = 'orgs/REQUEST_INITIATED';
export const REQUEST_INITIATED: REQUEST_INITIATED = 'orgs/REQUEST_INITIATED';

export type RequestInitiatedAction = {
  type: REQUEST_INITIATED,
};

export const requestInitiated = (): RequestInitiatedAction => ({
  type: REQUEST_INITIATED,
});


export type CHANGE_PROCESSED = 'orgs/CHANGE_PROCESSED';
export const CHANGE_PROCESSED: CHANGE_PROCESSED = 'orgs/CHANGE_PROCESSED';

export type ChangeProcessedAction = {
  type: CHANGE_PROCESSED,
  cr: org.OrgChangeRequest,
};

export const changeProcessed = (cr: org.OrgChangeRequest): ChangeProcessedAction => ({
  type: CHANGE_PROCESSED,
  cr,
});


export type CHANGE_UNDONE = 'orgs/CHANGE_UNDONE';
export const CHANGE_UNDONE: CHANGE_UNDONE = 'orgs/CHANGE_UNDONE';

export type ChangeUndoneAction = {
  type: CHANGE_UNDONE,
  cr: org.OrgChangeRequest,
};

export const changeUndone = (cr: org.OrgChangeRequest): ChangeUndoneAction => ({
  type: CHANGE_UNDONE,
  cr,
});


export type CHANGE_REDONE = 'orgs/CHANGE_REDONE';
export const CHANGE_REDONE: CHANGE_REDONE = 'orgs/CHANGE_REDONE';

export type ChangeRedoneAction = {
  type: CHANGE_REDONE,
  cr: org.OrgChangeRequest,
};

export const changeRedone = (cr: org.OrgChangeRequest): ChangeRedoneAction => ({
  type: CHANGE_REDONE,
  cr,
});

export type CHANGE_SELECTED_ITEM = 'orgs/CHANGE_SELECTED_ITEM';
export const CHANGE_SELECTED_ITEM: CHANGE_SELECTED_ITEM = 'orgs/CHANGE_SELECTED_ITEM';

export type ChangeSelectedItemAction = {
  type: CHANGE_SELECTED_ITEM,
  selectedItem: NavigationItem,
};

export const changeSelectedItem = (selectedItem: NavigationItem): ChangeSelectedItemAction => ({
  type: CHANGE_SELECTED_ITEM,
  selectedItem,
});



export type RELEASE_ORG = 'orgs/RELEASE_ORG';
export const RELEASE_ORG: RELEASE_ORG = 'orgs/RELEASE_ORG';

export type ReleaseOrgAction = {
  type: RELEASE_ORG,
};

export const releaseOrg = (): ReleaseOrgAction => ({
  type: RELEASE_ORG,
});



export type ORG_REQUESTED = 'orgs/ORG_REQUESTED';
export const ORG_REQUESTED: ORG_REQUESTED = 'orgs/ORG_REQUESTED';

export type OrgRequestedAction = {
  type: ORG_REQUESTED,
  orgId: string,
};

export const orgRequested = (orgId: string): OrgRequestedAction => ({
  type: ORG_REQUESTED,
  orgId,
});


export type ORG_LOADED = 'orgs/ORG_LOADED';
export const ORG_LOADED: ORG_LOADED = 'orgs/ORG_LOADED';

export type OrgLoadedAction = {
  type: ORG_LOADED,
  document: persistence.Document,
};

export const orgLoaded = (
  document: persistence.Document)
  : OrgLoadedAction => ({
    type: ORG_LOADED,
    document,
  });


export type ORG_CHANGE_FAILED = 'orgs/ORG_CHANGE_FAILED';
export const ORG_CHANGE_FAILED: ORG_CHANGE_FAILED = 'orgs/ORG_CHANGE_FAILED';

export type OrgChangeFailedAction = {
  type: ORG_CHANGE_FAILED,
  orgId: string,
  error: string,
};

export const orgChangeFailed = (orgId: string, error: string)
  : OrgChangeFailedAction => ({
    type: ORG_CHANGE_FAILED,
    orgId,
    error,
  });


export type ORG_CHANGE_SUCCEEDED = 'orgs/ORG_CHANGE_SUCCEEDED';
export const ORG_CHANGE_SUCCEEDED: ORG_CHANGE_SUCCEEDED = 'orgs/ORG_CHANGE_SUCCEEDED';

export type OrgChangeSucceededAction = {
  type: ORG_CHANGE_SUCCEEDED,
  orgId: string,
};

export const orgChangeSucceeded = (orgId: string)
  : OrgChangeSucceededAction => ({
    type: ORG_CHANGE_SUCCEEDED,
    orgId,
  });


export type MODEL_UPDATED = 'orgs/MODEL_UPDATED';
export const MODEL_UPDATED: MODEL_UPDATED = 'orgs/MODEL_UPDATED';

export type ModelUpdatedAction = {
  type: MODEL_UPDATED,
  model: models.OrganizationModel,
};

export const modelUpdated = (
  model: models.OrganizationModel)
  : ModelUpdatedAction => ({
    type: MODEL_UPDATED,
    model,
  });

// For units-only warning:

function buildMoreInfoAction(dispatch) {
  const moreInfoText = 'Organizations that do not contain any modules will not display relevant'
    + ' information in the OLI Learning Dashboard.  Therefore it is recommended that a one-level'
    + ' organization use modules instead of units to organize course material.';

  const dismissModal = () => {
    return dispatch(modalActions.dismiss());
  };
  const displayModal = (c) => {
    return dispatch(modalActions.display(c));
  };

  const moreInfoAction = {
    label: 'More Info',
    enabled: true,
    execute: (message: Messages.Message, dispatch) => {
      displayModal(
        <ModalMessage onCancel={dismissModal}>{moreInfoText}</ModalMessage>);
    },
  };
  return moreInfoAction;
}

function buildUnitsMessage(labels: contentTypes.Labels, dispatch) {

  const lowerCased = labels.module.toLowerCase();

  const content = new Messages.TitledContent().with({
    title: `No ${lowerCased} found.`,
    message:
      `Organizations without at least one ${lowerCased} have learning dashboard limitations in OLI`,
  });
 
  return new Messages.Message().with({
    content,
    guid: 'UnitsOnly',
    scope: Messages.Scope.CoursePackage,
    severity: Messages.Severity.Warning,
    canUserDismiss: false,
    actions: Immutable.List([buildMoreInfoAction(dispatch)]),
  });

}

function updateUnitsMessage(model: models.OrganizationModel, dispatch) {
  
  if (containsUnitsOnly(model)) { 
    return showMessage(buildUnitsMessage(model.labels, dispatch));    
  } 
  
  // else:
  return dismissSpecificMessage(buildUnitsMessage(model.labels, dispatch));
}


export function load(courseId: CourseIdVers, organizationId: string) {
  return function (dispatch): Promise<persistence.Document> {

    const holder = { changeMade: false };
    const notifyChangeMade = () => holder.changeMade = true;

    dispatch(orgRequested(organizationId));

    return persistence.retrieveDocument(courseId, organizationId, notifyChangeMade)
      .then((document) => {
        dispatch(orgLoaded(document));
        dispatch(updateUnitsMessage(document.model as models.OrganizationModel, dispatch));
        dispatch(dismissSpecificMessage(buildConflictMessage()));
        return document;
      });

  };
}

function applyChange(
  dispatch,
  doc: persistence.Document,
  courseId: CourseIdVers,
  change: org.OrgChangeRequest,
  retriesRemaining: number,
  changeType: ChangeType) {

  // Attempt to apply the change
  const m = doc.model as models.OrganizationModel;
  org.applyChange(m, change).caseOf({
    just: (ac) => {

      const model = ac.updatedModel;

      // Assume this is going to be accepted by the server, so
      // setup our next model revision points appropriately
      const nextRevision = createGuid();
      const resource = m.resource.with({
        previousRevisionGuid: m.resource.lastRevisionGuid,
        lastRevisionGuid: nextRevision,
      });
      dispatch(modelUpdated(model.with({ resource })));

      if (changeType === ChangeType.Undo) {
        dispatch(changeUndone(ac.undo));
      } else if (changeType === ChangeType.Redo) {
        // ac.undo here is correct and not a copy-paste error
        dispatch(changeRedone(ac.undo));
      } else {
        dispatch(changeProcessed(ac.undo));
      }

      persistence.persistRevisionBasedDocument(doc.with({ model }), nextRevision)
        .then(() => {
          dispatch(orgChangeSucceeded(m.guid));
          dispatch(updateUnitsMessage(model, dispatch));
          dispatch(dismissSpecificMessage(buildConflictMessage()));
        })
        .catch((err) => {

          // When the server rejects our change due to a conflict, we always
          // request the latest view of the document:
          if (err.statusText === 'Conflict') {
            persistence.retrieveDocument(courseId, m.guid, () => { })
              .then((latestDoc) => {

                // If we have retry attempts remaining, then try applying the change
                // again.
                if (retriesRemaining > 0) {
                  applyChange(
                    dispatch, latestDoc, courseId, change, retriesRemaining - 1, changeType);
                } else {
                  // If no retry attempts remaining, we simply update the model to reflect
                  // the latest from the server's perspective.
                  // Track that this change failed
                  dispatch(orgChangeFailed(m.guid, err));
                  dispatch(modelUpdated(latestDoc.model as models.OrganizationModel));
                  dispatch(showMessage(buildConflictMessage()));
                }
              });
          } else {
            dispatch(orgChangeFailed(m.guid, err));
          }
        });
    },
    nothing: () => {
      // We could not apply the change to our current view of the model. We get here
      // only after reaching a conflict and refetching the model - so it does no good
      // to continue to retry.  Just give the user notification and access to the new model.
      dispatch(modelUpdated(m));
      dispatch(orgChangeFailed(m.guid, 'Conflict'));
      dispatch(showMessage(buildConflictMessage()));

      // Transition the view back to the course overview page.  This avoids the most
      // common conflict situation where someone attempted to edit an org component
      // that no longer exists.  We need to transition away from viewing that missing
      // org component. TODO: improve this and only transition the view away if
      // the component no longer exists.
      viewActions.viewCourse(courseId, Maybe.just(m.guid));
    },

  });

}

export function change(change: org.OrgChangeRequest, changeType = ChangeType.Normal) {
  return function (dispatch, getState: () => State) {
    getState().orgs.activeOrg.lift((doc) => {
      const courseId = getState().course.guid;
      dispatch(requestInitiated());
      applyChange(dispatch, doc, courseId, change, 1, changeType);
    });
  };

}


export function undo() {
  return function (dispatch, getState) {

    const undoStack: Immutable.Stack<org.OrgChangeRequest> = getState().orgs.undoStack;
    const cr = undoStack.peek();

    if (cr) {
      dispatch(change(cr, ChangeType.Undo));
    }

  };
}

export function redo() {
  return function (dispatch, getState) {

    const redoStack: Immutable.Stack<org.OrgChangeRequest> = getState().orgs.redoStack;
    const cr = redoStack.peek();

    if (cr) {
      dispatch(change(cr, ChangeType.Redo));
    }
  };
}
