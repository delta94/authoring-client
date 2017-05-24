import * as React from 'react';
import { Video as VideoType } from '../../../../../data/content/html/video';
import { InteractiveRenderer, InteractiveRendererProps, 
  InteractiveRendererState} from './InteractiveRenderer';
import { BlockProps } from './properties';
import { Button } from '../../Button';
import ModalMediaEditor from '../../../media/ModalMediaEditor';
import { VideoEditor } from '../../../media/VideoEditor';

import './markers.scss';

type Data = {
  video: VideoType;
};

export interface VideoProps extends InteractiveRendererProps {
  data: Data;
}

export interface VideoState extends InteractiveRendererState {
  
}

export interface VideoProps {
  
}


class Video extends InteractiveRenderer<VideoProps, VideoState> {

  constructor(props) {
    super(props, {});

    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    const b = this.props.blockProps;
    this.props.blockProps.services.displayModal(
      <ModalMediaEditor
        editMode={true}
        context={b.context}
        services={b.services}

        model={this.props.data.video}
        onCancel={() => this.props.blockProps.services.dismissModal()} 
        onInsert={(video) => {
          this.props.blockProps.services.dismissModal();
          this.props.blockProps.onEdit({ video });
        }
      }>
        <VideoEditor 
          model={this.props.data.video}
          context={b.context}
          services={b.services}
          editMode={true}
          onEdit={c => true}/>
      </ModalMediaEditor>,
    );
  }

  render() : JSX.Element {

    const { sources, controls } = this.props.data.video;

    let src = '';
    if (sources.size > 0) {
      src = this.props.blockProps.context.baseUrl 
        + '/' + this.props.blockProps.context.courseId
        + '/webcontents/' + sources.first().src;
    }
    
    return (
      <div ref={c => this.focusComponent = c} onFocus={this.onFocus} onBlur={this.onBlur}>
        <div>
          <video src={src} controls={controls}/>
        </div>
        <Button onClick={this.onClick}>Edit</Button>
      </div>);
  }
}

export default Video;
