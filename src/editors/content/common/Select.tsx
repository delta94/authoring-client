import * as React from 'react';
import guid from '../../../utils/guid';

export type SelectProps = {
  label: string;
  children?: any;
  value: string;
  onChange: (value: string) => void;
}

export const Select = (props: SelectProps) => {
  const id = guid();
  return (
    
      <label className="mr-sm-2" htmlFor={id}>{props.label}&nbsp;&nbsp;
      <select value={props.value} onChange={(e) => props.onChange(e.target.value)} className="form-control-sm custom-select mb-2 mr-sm-2 mb-sm-0" id={id}>
        {props.children}
      </select>
      </label>
    
  )
}; 

