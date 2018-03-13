import * as React from 'react';
import { AppServices } from 'editors/common/AppServices';
import { AppContext } from 'editors/common/AppContext';
import { ParentContainer, TextSelection } from 'types/active';
import { Maybe } from 'tsmonad';

export interface AbstractContentEditor<ModelType, P extends AbstractContentEditorProps<ModelType>,
  S extends AbstractContentEditorState> {}

export enum RenderContext {
  MainEditor,
  Toolbar,
  Sidebar,
}

export interface AbstractContentEditorProps<ModelType> {
  model: ModelType;
  parent?: ParentContainer;
  activeContentGuid?: string;
  onEdit: (updated: ModelType, source?: Object) => void;
  onFocus: (
    model: any, parent: ParentContainer,
    textSelection: Maybe<TextSelection>) => void;
  context: AppContext;
  services: AppServices;
  editMode: boolean;
  renderContext?: RenderContext;
  styles?: any;
}

export interface AbstractContentEditorState {}

/**
 * The abstract content editor.
 */
export abstract class
  AbstractContentEditor
    <ModelType, P extends AbstractContentEditorProps<ModelType>,
    S extends AbstractContentEditorState> extends React.Component<P, S> {

  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.activeContentGuid !== this.props.activeContentGuid) {
      return true;
    }
    if (nextProps.model !== this.props.model) {
      return true;
    }
    if (nextProps.context !== this.props.context) {
      return true;
    }
    return false;
  }

  abstract renderMain() : JSX.Element;

  abstract renderToolbar() : JSX.Element;

  abstract renderSidebar() : JSX.Element;

  handleOnFocus(e) {

    e.stopPropagation();

    const { model, parent, onFocus } = this.props;
    onFocus(model, parent, Maybe.nothing());
  }

  render() : JSX.Element {

    const renderContext = this.props.renderContext === undefined
      ? RenderContext.MainEditor
      : this.props.renderContext;

    if (renderContext === RenderContext.Toolbar) {
      return this.renderToolbar();
    }
    if (renderContext === RenderContext.Sidebar) {
      return this.renderSidebar();
    }
    return (
      <div onFocus={e => this.handleOnFocus(e)}>
        {this.renderMain()}
      </div>
    );

  }

}
