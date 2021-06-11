import { green, lightBlue } from '@material-ui/core/colors';
import Grow from '@material-ui/core/Grow';
import { createMuiTheme, responsiveFontSizes } from '@material-ui/core/styles';
import Zoom from '@material-ui/core/Zoom';

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
  palette: {
    type: "dark",
    primary: {
      main: lightBlue["500"]
    }
  },
  props: {
    MuiButton: {
      size: "large"
    },
    MuiDialog: {
      TransitionComponent: Grow,
      transitionDuration: {
        enter: 400,
        exit: 200
      }
    },
    MuiFormControl: {
      fullWidth: true,
      margin: "dense",
      variant: "outlined"
    },
    MuiLink: {
      color: "textPrimary",
      underline: "always"
    },
    MuiSvgIcon: {
      fontSize: "large"
    },
    MuiTooltip: {
      arrow: true,
      disableHoverListener: true,
      TransitionComponent: Zoom
    },
    MuiTypography: {
      color: "textPrimary"
    }
  },
  typography: {
    h1: {
      fontSize: "3.25rem"
    },
    h2: {
      fontSize: "2.5rem"
    },
    h3: {
      fontSize: "2rem"
    },
    h4: {
      fontSize: "1.6rem"
    },
    h5: {
      fontSize: "1.425rem"
    },
    body1: {
      fontSize: "1.325rem"
    },
    body2: {
      fontSize: "1.125rem"
    },
    caption: {
      fontSize: "0.875rem"
    }
  },
  overrides: {
    MuiAppBar: {
      colorPrimary: {
        backgroundColor: green['900']
      }
    },
    MuiTabs: {
      indicator: {
        height: '4px'
      }
    },
    MuiTooltip: {
      tooltip: {
        fontSize: '1.25em'
      }
    }
  }
}));
