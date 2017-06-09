import * as React from 'react';
import { Decorator, byType } from './common';
import { EntityTypes } from '../../../../../data/content/html/common';
import { ActivityLinkEditor } from '../../../links/ActivityLinkEditor';
import ModalMediaEditor from '../../../media/ModalMediaEditor';

class ActivityLink extends React.PureComponent<any, any> {

  a: any;

  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  componentDidMount() {
    (window as any).$(this.a).tooltip();
  }

  componentWillUnmount() {
    (window as any).$(this.a).tooltip('hide');
  }

  onClick() {
    const key = this.props.entityKey;
    const data = this.props.contentState.getEntity(key).getData();
    
    this.props.services.displayModal(
      <ModalMediaEditor
        editMode={true}
        context={this.props.context}
        services={this.props.services}

        model={data.activity_link}
        onCancel={() => this.props.services.dismissModal()} 
        onInsert={(activity_link) => {
          this.props.services.dismissModal();
          const data = {
            activity_link,
          };
          const contentState = this.props.contentState.replaceEntityData(key, data);

          this.props.onEdit(contentState);
        }
      }>
        <ActivityLinkEditor 
          model={data.activity_link}
          context={this.props.context}
          services={this.props.services}
          editMode={true}
          onEdit={c => true}/>
      </ModalMediaEditor>,
    );
  }

  render() : JSX.Element {
    const data = this.props.contentState.getEntity(this.props.entityKey).getData();
    const purpose = data['@purpose'];
    return (
      <a
        className="editor-link" 
        data-offset-key={this.props.offsetKey} 
        ref={a => this.a = a} data-toggle="tooltip" 
        data-placement="top" title={purpose} onClick={this.onClick}>
        {this.props.children}
      </a>
    );
  }
}

export default function (props: Object) : Decorator {
  return {
    strategy: byType.bind(undefined, EntityTypes.activity_link),
    component: ActivityLink,
    props,
  };
}