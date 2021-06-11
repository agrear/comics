import { Theme, makeStyles } from '@material-ui/core/styles';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Typography from '@material-ui/core/Typography';
import ViewListIcon from '@material-ui/icons/ViewList';
import { motion, Variants } from 'framer-motion';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  placeholder: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    userSelect: "none"
  },
  icon: {
    minWidth: "initial",
    padding: 0
  }
}));

const variants: Variants = {
  initial: {
    opacity: 0,
    scale: 1
  },
  enter: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "tween",
      ease: "circOut",
      duration: 1.8
    }
  },
  exit: {
    opacity: 0,
    scale: 1.5,
    transition: {
      type: "tween",
      ease: "circIn",
      duration: 0.15
    }
  }
};

export function Placeholder() {
  const classes = useStyles();

  return (
    <motion.div
      className={classes.placeholder}
      initial="initial"
      animate="enter"
      exit="exit"
      variants={variants}
    >
      <ListItemIcon className={classes.icon}>
        <ViewListIcon />
      </ListItemIcon>
      <Typography variant="h4">
        Select a comic
      </Typography>
    </motion.div>
  );
}

export default Placeholder;
