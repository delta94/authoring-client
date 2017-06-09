import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import * as persistence from '../../../data/persistence';
import { ActivityLink }  from '../../../data/content/html/activity_link';
import { AppServices } from '../../common/AppServices';
import { PurposeTypes } from '../../../data/content/html/common';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { Select } from '../common/Select';
import { InputLabel } from '../common/InputLabel';
import { Button } from '../common/Button';

import '../common/editor.scss';


export interface ActivityLinkEditor {
  
}

export interface ActivityLinkEditorProps extends AbstractContentEditorProps<ActivityLink> {
  
}

export interface ActivityLinkEditorState {
  activities: persistence.CourseResource[];
  selectedGuid: string;
}

/**
 * The content editor for Table.
 */
export class ActivityLinkEditor 
  extends AbstractContentEditor<ActivityLink, ActivityLinkEditorProps, ActivityLinkEditorState> {
    
  constructor(props) {
    super(props);
    
    this.onTargetEdit = this.onTargetEdit.bind(this);
    this.onIdrefEdit = this.onIdrefEdit.bind(this);
    this.onPurposeEdit = this.onPurposeEdit.bind(this);

    const selected = this.props.context.courseModel
      .resources.toArray().find(r => r.id === this.props.model.idref);

    this.state = {
      activities: [],
      selectedGuid: selected !== undefined ? selected.guid : null,
    };
  }

  componentDidMount() {
    persistence.fetchCourseResources(this.props.context.courseId)
    .then((resources) => {
      console.log(resources);
      return resources;
    })
    .then(resources => resources.filter(r => r.type === 'x-oli-inline-assessment'))
    .then(activities => this.setState({ activities }));
  }

  shouldComponentUpdate(nextProps, nextState: ActivityLinkEditorState) {
    if (nextProps.model !== this.props.model) {
      return true;
    } else if (nextState.activities !== this.state.activities) {
      return true;
    }
    return false;
  }

  onTargetEdit(target) {
    this.props.onEdit(this.props.model.with({ target }));
  }

  onIdrefEdit(id) {
    const resources = this.props.context.courseModel.resources.toArray();
    const found = resources.find(r => r.guid === id);

    if (found !== undefined && found !== null) {
      const idref = found.id;
      this.props.onEdit(this.props.model.with({ idref }));
    }
  }

  onPurposeEdit(purpose) {
    this.props.onEdit(this.props.model.with({ purpose }));
  }

  render() : JSX.Element {

    const { idref, purpose, target } = this.props.model;
    
    return (
      <div className="itemWrapper">

        <InputLabel label="Activity">
          <Select
            editMode={this.props.editMode}
            label=""
            value={this.state.selectedGuid}
            onChange={this.onIdrefEdit}>
            {this.state.activities.map(a => <option key={a._id} value={a._id}>{a.title}</option>)}
          </Select>
        </InputLabel>

        <InputLabel label="Target">
          <Select
            editMode={this.props.editMode}
            label=""
            value={target}
            onChange={this.onTargetEdit}>
            <option key="new" value="new">Open in new tab/window</option>
            <option key="self" value="self">Open in this window</option>
          </Select>
        </InputLabel>

        <InputLabel label="Purpose">
          <Select
            editMode={this.props.editMode}
            label=""
            value={purpose}
            onChange={this.onPurposeEdit}>
            {PurposeTypes.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </Select>
        </InputLabel>
        
      </div>);
  }

}
