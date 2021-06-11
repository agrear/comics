import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import React from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
      flexWrap: "wrap",
      listStyle: "none",
      padding: 0,
      margin: 0
    },
    chip: {
      fontSize: 16,
      marginRight: theme.spacing(1)
    }
  })
);

export function Tags({ children }: { children: string[] }) {
  const classes = useStyles();

  return (
    <ul className={classes.root}>
      {React.Children.map(children, (tag, i) => (
        <li key={i}>
          <Chip label={tag} variant="outlined" className={classes.chip} />
        </li>
      ))}
    </ul>
  );
}

export default Tags;
