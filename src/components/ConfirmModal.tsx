import * as React from 'react';
import { StyledComponentProps } from 'types/component';
import { classNames, withStyles, JSSStyles } from 'styles/jss';
import { disableSelect } from 'styles/mixins';
import { Button } from './common/Button';

export const styles: JSSStyles = {
  ConfirmModal: {
    extend: [disableSelect],
  },
  cancelBtn: {

  },
  confirmBtn: {

  },
};

export interface ConfirmModalProps {
  confirmLabel?: string;
  confirmClass?: string;
  cancelLabel?: string;
  cancelClass?: string;
  title?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
}

export interface ConfirmModalState {

}

class ConfirmModal extends React.PureComponent<
  StyledComponentProps<ConfirmModalProps, typeof styles>, ConfirmModalState> {

  modal: any;

  componentDidMount() {
    (window as any).$(this.modal).modal('show');
  }

  componentWillUnmount() {
    (window as any).$(this.modal).modal('hide');
  }

  render() {
    const {
      className, classes, cancelLabel, confirmLabel, onCancel, onConfirm,
      confirmClass, cancelClass, title,
    } = this.props;

    return (
      <div
        className={classNames([
          'ConfirmModal', classes.ConfirmModal, className, 'modal-minimal modal fade'])}
        ref={(modal) => { this.modal = modal; }}
        data-backdrop="true">
        <div className="modal-dialog modal-lg" role="document">
          <div className="modal-content">
            <div className="modal-header">
              {title}
              <button onClick={this.props.onCancel} type="button" className="close"
                data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              {this.props.children}
            </div>
            <div className="modal-footer">
              {onCancel &&
                <Button
                  type="button"
                  editMode={true}
                  className={classNames(['btn', cancelClass || 'btn-link', classes.cancelBtn])}
                  onClick={onCancel}>
                  {cancelLabel || 'Cancel'}
                </Button>
              }
              {onConfirm &&
                <Button
                  type="button"
                  editMode={true}
                  className={classNames(['btn', confirmClass || 'btn-primary', classes.confirmBtn])}
                  onClick={onConfirm}>
                  {confirmLabel || 'Confirm'}
                </Button>
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const StyledConfirmModal = withStyles<ConfirmModalProps>(styles)(ConfirmModal);
export { StyledConfirmModal as ConfirmModal };
