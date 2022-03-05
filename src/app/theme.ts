import Grow from '@mui/material/Grow';
import Zoom from '@mui/material/Zoom';
import { lightBlue } from '@mui/material/colors';
import {
  createTheme as createMuiTheme,
  lighten,
  responsiveFontSizes
} from '@mui/material/styles';

const theme = createMuiTheme();

export const createTheme = () => responsiveFontSizes(createMuiTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 1024,
      lg: 1366,
      xl: 1920
    }
  },
  components: {
    MuiAppBar: {
      defaultProps: {
        position: 'static',
        sx: {
          backgroundColor: lighten(theme.palette.grey[900], 0.1)
        }
      },
      styleOverrides: {
        root: {
          height: 40,
          boxShadow: 'none',
          backgroundImage: 'none'
        }
      }
    },
    MuiButton: {
      defaultProps: {
        size: 'large'
      }
    },
    MuiDialog: {
      defaultProps: {
        TransitionComponent: Grow,
        transitionDuration: {
          enter: 400,
          exit: 200
        }
      }
    },
    MuiFormControl: {
      defaultProps: {
        fullWidth: true,
        margin: 'dense',
        variant: 'outlined'
      }
    },
    MuiLink: {
      defaultProps: {
        color: 'textPrimary'
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: lighten(theme.palette.grey[900], 0.1),
          backgroundImage: 'none'
        }
      }
    },
    MuiSvgIcon: {
      defaultProps: {
        fontSize: 'large'
      }
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: '4px'
        }
      }
    },
    MuiToolbar: {
      defaultProps:{
        variant: 'dense',
        disableGutters: true
      },
      styleOverrides: {
        root: {
          minHeight: 0,
          height: 40,
          flex: '1 1 100%',
          alignItems: 'stretch',
          userSelect: 'none'
        }
      }
    },
    MuiTooltip: {
      defaultProps: {
        arrow: true,
        disableHoverListener: true,
        TransitionComponent: Zoom
      },
      styleOverrides: {
        tooltip: {
          fontSize: '1.25em'
        }
      }
    },
    MuiTypography: {
      defaultProps: {
        color: 'textPrimary'
      }
    }
  },
  palette: {
    mode: 'dark',
    primary: {
      main: lightBlue['500']
    },
    background: {
      default: '#202020',
      paper: lighten(theme.palette.grey[900], 0.1)
    }
  },
  typography: {
    h1: {
      fontSize: '3.25rem'
    },
    h2: {
      fontSize: '2.5rem'
    },
    h3: {
      fontSize: '2rem'
    },
    h4: {
      fontSize: '1.6rem'
    },
    h5: {
      fontSize: '1.425rem'
    },
    body1: {
      fontSize: '1.325rem'
    },
    body2: {
      fontSize: '1.125rem'
    },
    caption: {
      fontSize: '0.875rem'
    }
  }
}));
