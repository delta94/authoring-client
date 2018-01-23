import * as React from 'react';

import './Remove.scss';

// tslint:disable-next-line
export const Remove = (props) => {
  return (
    <span className={`remove-btn ${props.className || ''}`}>
      <button
        disabled={!props.editMode}
        onClick={props.onRemove}
        type="button"
        className="btn btn-sm">
        <i className="fa fa-close"></i>
      </button>
    </span>
  );
};