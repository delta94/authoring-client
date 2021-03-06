import * as React from 'react';

import { Mathematica as MathematicaType } from 'data/content/learning/mathematica';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { ToolbarGroup, ToolbarLayout } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { modalActions } from 'actions/modal';
import { selectFile } from 'editors/content/learning/file';
import { PurposeTypes } from 'data/content/learning/common';
import { Select } from 'editors/content/common/controls';
import { Maybe } from 'tsmonad';
import { ContentElements } from 'data/content/common/elements';

import { MediaMetadataEditor, MediaWidthHeightEditor } from 'editors/content/learning/MediaItems';
import {
  DiscoverableId,
} from 'components/common/Discoverable.controller';

import './Media.scss';
import { CaptionTextEditor } from './contiguoustext/CaptionTextEditor';

export interface MathematicaProps extends AbstractContentEditorProps<MathematicaType> {
  onShowSidebar: () => void;
  onDiscover: (id: DiscoverableId) => void;
}

export interface MathematicaState {

}

export default class MathematicaEditor
  extends AbstractContentEditor<MathematicaType, MathematicaProps, MathematicaState> {

  constructor(props) {
    super(props);

    this.onSelect = this.onSelect.bind(this);
    this.onPurposeChange = this.onPurposeChange.bind(this);
    this.onCaptionEdit = this.onCaptionEdit.bind(this);
  }

  onCaptionEdit(content: ContentElements, src) {
    const caption = this.props.model.caption.with({ content });
    this.props.onEdit(this.props.model.with({ caption }), src);
  }

  onPurposeChange(purpose) {
    const model = this.props.model.with({
      purpose: purpose === ''
        ? Maybe.nothing()
        : Maybe.just(purpose),
    });
    this.props.onEdit(model, model);
  }

  onSelect() {
    const { context, services, onEdit, model } = this.props;

    const dispatch = (services as any).dispatch;
    const dismiss = () => dispatch(modalActions.dismiss());
    const display = c => dispatch(modalActions.display(c));

    selectFile(
      model.src,
      context.resourcePath, context.courseModel,
      display, dismiss)
      .then((src) => {
        if (src !== null) {
          const updated = model.with({ src });
          onEdit(updated, updated);
        }
      });
  }

  renderSidebar(): JSX.Element {

    const src = this.props.model.src;
    const file = src !== ''
      ? src.substr(src.lastIndexOf('/') + 1)
      : 'No file selected';

    return (
      <SidebarContent title="Mathematica">

        <SidebarGroup label="Source File">
          <div>{file}</div>
          <ToolbarButton onClick={this.onSelect} size={ToolbarButtonSize.Large}>
            <div><i className="far fa-file" /></div>
            <div>Select File</div>
          </ToolbarButton>
        </SidebarGroup>

        <MediaWidthHeightEditor
          width={this.props.model.width}
          height={this.props.model.height}
          editMode={this.props.editMode}
          onEditWidth={(width) => {
            const model = this.props.model.with({ width });
            this.props.onEdit(model, model);
          }}
          onEditHeight={(height) => {
            const model = this.props.model.with({ height });
            this.props.onEdit(model, model);
          }} />

        <MediaMetadataEditor
          {...this.props}
          model={this.props.model}
          onEdit={this.props.onEdit} />
      </SidebarContent>
    );
  }
  renderToolbar(): JSX.Element {
    const { onShowSidebar } = this.props;

    return (
      <ToolbarGroup
        label="Mathematica"
        columns={6}
        highlightColor={CONTENT_COLORS.Mathematica}>

        <ToolbarLayout.Column>
          <ToolbarButton onClick={onShowSidebar} size={ToolbarButtonSize.Large}>
            <div><i className="fas fa-sliders-h" /></div>
            <div>Details</div>
          </ToolbarButton>
        </ToolbarLayout.Column>

        <ToolbarLayout.Column>
          <div style={{ marginLeft: 8 }}>Purpose</div>
          <Select
            editMode={this.props.editMode}
            label=""
            value={this.props.model.purpose.caseOf({
              nothing: () => '',
              just: p => p,
            })}
            onChange={this.onPurposeChange}>
            <option value={''}>
              {''}
            </option>
            {PurposeTypes.map(p =>
              <option
                key={p.value}
                value={p.value}>
                {p.label}
              </option>)}
          </Select>
        </ToolbarLayout.Column>

      </ToolbarGroup>
    );
  }

  renderMain(): JSX.Element {
    const {
      editMode, activeContentGuid, context, parent, services, onFocus, hover,
      onUpdateHover, model,
    } = this.props;
    const src = this.props.model.src;
    const file = src.substr(src.lastIndexOf('/') + 1);

    return (
      <div className="mediaEditor">
        <div className="mediaHeader">Mathematica</div>
        <span className="mediaLabel">Source File:</span> {file}

        <CaptionTextEditor
          editMode={editMode}
          activeContentGuid={activeContentGuid}
          context={context}
          parent={parent}
          services={services}
          onFocus={onFocus}
          hover={hover}
          onUpdateHover={onUpdateHover}
          onEdit={this.onCaptionEdit}
          model={model.caption.content} />

      </div>
    );
  }
}
