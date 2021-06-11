import { createStyles, darken, makeStyles, Theme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import React from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appBar: {
      position: "static",
      height: 52,
      background: darken(theme.palette.background.paper, 0.3),
      boxShadow: "none"
    },
    toolbar: {
      position: "relative",
      flex: "1 1 100%",
      alignItems: "stretch",
      justifyContent: 'flex-end',
      minHeight: "initial",
      padding: 0,
      userSelect: "none"
    }
  })
);

interface ToolbarTemplateProps {
  children: React.ReactNode;
}

export function ToolbarTemplate({ children }: ToolbarTemplateProps) {
  const classes = useStyles();

  return (
    <AppBar className={classes.appBar}>
      <Toolbar className={classes.toolbar}>
        {children}
      </Toolbar>
    </AppBar>
  );
}

export default ToolbarTemplate;
