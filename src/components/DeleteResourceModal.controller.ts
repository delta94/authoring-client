import * as Immutable from 'immutable';
import { connect, Dispatch } from 'react-redux';
import { State } from 'reducers';
import DeleteResourceModal from './DeleteResourceModal';
import { Resource } from 'data/contentTypes';
import { CourseModel } from 'data/models';
import { ResourceState } from 'data/content/resource';
import { updateCourseResources } from 'actions/course';
import * as viewActions from 'actions/view';
import { modalActions } from 'actions/modal';
import { LegacyTypes } from 'data/types';
import { CourseState } from 'reducers/course';
import { Maybe } from 'tsmonad';

interface StateProps {

}

interface DispatchProps {
  onDeleteResource: (resource: Resource, course: CourseModel, orgId: string) => void;
}

interface OwnProps {
  resource: Resource;
  course: CourseState;
  onDismissModal: () => void;
}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  const { orgs } = state;
  const orgId = orgs.activeOrg.caseOf({
    just: orgDoc => orgDoc._id,
    nothing: () => null,
  });
  return {
    orgId,
  };
};

const mapDispatchToProps = (dispatch, ownProps: OwnProps): DispatchProps => {
  return {
    onDeleteResource: (resource: Resource, course: CourseModel, orgId: string) => {
      const updatedResource = resource.with({ resourceState: ResourceState.DELETED });
      const resources = Immutable.OrderedMap<string, Resource>([[
        updatedResource.guid, updatedResource,
      ]]);
      dispatch(updateCourseResources(resources));

      let orgToView = orgId;
      if (orgToView === updatedResource.id) {
        orgToView = ownProps.course.resources.toArray().filter(
          r => r.type === LegacyTypes.organization
            && r.id !== orgId && r.resourceState !== 'DELETED',
        )[0].id;
      }

      viewActions.viewCourse(course.idvers, Maybe.just(orgToView));
      dispatch(modalActions.dismiss());

    },
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(DeleteResourceModal);

export { controller as DeleteResourceModal };
