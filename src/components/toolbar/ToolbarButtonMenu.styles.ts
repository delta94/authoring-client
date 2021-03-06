import { JSSStyles } from 'styles/jss';
import colors from 'styles/colors';
import * as chroma from 'chroma-js';

export const styles: JSSStyles = {
  wideMenu: {
    textAlign: 'left',
    display: 'inline-block',
    width: 98,
  },
  narrowMenu: {
    textAlign: 'left',
    display: 'inline-block',
    width: 32,
  },
  toolbarButtonMenu: {
    background: 'transparent',
    fontSize: 12,
    color: colors.grayDarkest,
    textAlign: 'left',
    verticalAlign: 'top',
    border: '1px solid transparent',
    cursor: 'pointer',
    width: 98,
    height: 32,

    '&:hover': {
      color: colors.hover,
      border: `1px solid ${colors.grayLighter}`,
    },
    '&:active': {
      color: colors.selection,
    },
    '&:focus': {
      outline: 0,
    },

    '&[disabled]': {
      color: colors.grayLight,

      '&:hover': {
        cursor: 'default',
        color: colors.grayLight,
        border: '1px solid transparent',
      },
    },

    '&.selected': {
      backgroundColor: chroma.mix(colors.selection, 'white', 0.75).hex(),
      border: `1px solid ${chroma.mix(colors.selection, 'white', 0.75).hex()}`,
    },

    '& i': {
      width: 20,
      fontSize: 16,

      'not(.fa)': {
        font: {
          style: 'normal',
          family: 'serif',
          weight: 700,
        },
      },
    },
  },
  toolbarNarrowButtonMenu: {
    background: 'transparent',
    fontSize: 12,
    color: colors.grayDarkest,
    textAlign: 'left',
    verticalAlign: 'top',
    border: '1px solid transparent',
    cursor: 'pointer',
    width: 32,
    height: 32,

    '&:hover': {
      color: colors.hover,
      border: `1px solid ${colors.grayLighter}`,
    },
    '&:active': {
      color: colors.selection,
    },
    '&:focus': {
      outline: 0,
    },

    '&[disabled]': {
      color: colors.grayLight,

      '&:hover': {
        cursor: 'default',
        color: colors.grayLight,
        border: '1px solid transparent',
      },
    },

    '&.selected': {
      backgroundColor: chroma.mix(colors.selection, 'white', 0.75).hex(),
      border: `1px solid ${chroma.mix(colors.selection, 'white', 0.75).hex()}`,
    },

    '& i': {
      width: 20,
      fontSize: 16,

      'not(.fa)': {
        font: {
          style: 'normal',
          family: 'serif',
          weight: 700,
        },
      },
    },
  },
  quadMatrix: {
    display: 'flex',
    flexDirection: 'row',
  },
  matrixCol1: {
    display: 'flex',
    flexDirection: 'column',
  },
  matrixCol2: {
    display: 'flex',
    flexDirection: 'column',
  },
  quadDropdown: {
    maxWidth: 12,
    width: 12,
    minHeight: 72,
    height: 72,
    borderLeft: '1px solid transparent',

    '& .dropdown-toggle': {
      cursor: 'pointer',

      '&[disabled]': {
        cursor: 'default',
      },
    },

    '& .dropdown-divider, & .dropdown-menu': {
      cursor: 'default',
    },

    '& .dropdown-item': {
      cursor: 'pointer',
    },

    '& .toolbarButtonMenuForm': {
      marginBottom: 0,
    },

    '&:hover': {
      '& $quadButton': {
        color: colors.hover,
      },
    },
  },
  quadDropdownDisabled: {
    cursor: 'default',

    '&:hover': {
      '& $quadButton': {
        color: colors.grayLight,
      },
    },
  },
  quadButton: {
    border: 'none',
    paddingTop: 26,
    paddingBottom: 26,
    paddingLeft: 0,
    background: 'transparent',
    outline: 0,
    boxShadow: 'none',
    '&:focus': {
      outline: 0,
    },

    '&[disabled]': {
      color: colors.grayLight,
    },
  },
  quadMenu: {
    background: 'transparent',
    fontSize: 12,
    color: colors.grayDarkest,
    border: '1px solid transparent',
    cursor: 'pointer',
    width: 88,
    height: 63,
    margin: [0, 5],

    '& .dropdown': {
      width: 15,
    },

    '&:hover': {
      border: `1px solid ${colors.grayLighter}`,

      '& $quadDropdown': {
        borderLeft: `1px solid ${colors.grayLighter}`,
      },
    },
    '&:active': {
      color: colors.selection,
    },
    '&:focus': {
      outline: 0,
    },

    '&.selected': {
      backgroundColor: chroma.mix(colors.selection, 'white', 0.75).hex(),
      border: `1px solid ${chroma.mix(colors.selection, 'white', 0.75).hex()}`,
    },

    '& i': {
      fontSize: 16,

      'not(.fa)': {
        font: {
          style: 'normal',
          family: 'serif',
          weight: 700,
        },
      },
    },
  },
  quadMenuDisabled: {
    '&:hover': {
      cursor: 'default',
      border: '1px solid transparent',

      '& $quadDropdown': {
        borderLeft: '1px solid transparent',
      },
    },
  },
};
