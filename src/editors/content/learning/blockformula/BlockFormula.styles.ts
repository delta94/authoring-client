import { JSSStyles } from 'styles/jss';

export const styles: JSSStyles = {
  formulaWrapper: {
    borderLeft: '5px solid pink',
  },
  formulaEditor: {
    '& .contiguousTextEditor': {
      fontFamily: 'Inconsolata, Consolas, monospace',
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
      border: '1px solid pink',
    },
  },
};
