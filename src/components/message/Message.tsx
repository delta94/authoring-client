import * as React from 'react';
import * as Messages from 'types/messages';

import './Message.scss';

export interface MessageProps {
  message: Messages.Message;
  dismissMessage: (message: Messages.Message) => void;
  executeAction: (message: Messages.Message, action: Messages.MessageAction) => void;
}

export interface MessageState {

}

const classesForSeverity = {
  [Messages.Severity.Error]: 'navbar-dark message message--error',
  [Messages.Severity.Warning]: 'navbar-light message message--warning',
  [Messages.Severity.Information]: 'navbar-light message message--information',
  [Messages.Severity.Task]: 'navbar-light message message--task',
};

export class Message
  extends React.PureComponent<MessageProps, MessageState> {

  nav: any;

  constructor(props) {
    super(props);
  }

  onDismiss(e) {
    e.preventDefault();

    this.props.dismissMessage(this.props.message);
  }

  componentDidMount() {
    this.nav.scrollIntoView(true);
  }

  renderMessageAction(message: Messages.Message, action: Messages.MessageAction) {
    return (
      <button
        key={action.label}
        className="btn btn-action"
        disabled={!action.enabled}
        onClick={() => this.props.executeAction(message, action)}
        type="button">{action.label}
      </button>
    );
  }

  renderActions(message: Messages.Message) {
    if (message.canUserDismiss || message.actions.size > 0) {
      return (
        <form className="form-inline my-2 my-lg-0">
          {message.actions.toArray().map(a => this.renderMessageAction(message, a))}
          {message.canUserDismiss && this.renderCloseButton()}
        </form>
      );
    }
  }

  renderCloseButton() {
    return (
      <button
        onClick={this.onDismiss.bind(this)}
        className="btn btn-sm">
        <i className="fas fa-times"></i>
      </button>
    );
  }

  renderMessage(content: Messages.TitledContent) {
    return (
      <span className="message__text">
        <span role="alert" className="message__title">{content.title}</span> {content.message}
      </span>
    );
  }

  render(): JSX.Element {

    const { message } = this.props;
    const classes = 'navbar justify-content-between '
      + classesForSeverity[message.severity];

    return (
      <nav className={classes} ref={nav => this.nav = nav}>
        {this.renderMessage(message.content)}
        {this.renderActions(message)}
      </nav>
    );
  }
}
