import { makeStyles, Theme } from '@material-ui/core/styles';
import { motion, Variants } from 'framer-motion';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  tabPanel: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  }
}));

const variants: Variants = {
  initial: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 64 : -64
  }),
  enter: {
    opacity: 1,
    x: 0,
    transition: {
      opacity: {
        type: 'tween',
        ease: 'linear',
        duration: 0.3
      },
      x: {
        type: 'tween',
        ease: 'easeOut',
        duration: 0.3
      }
    }
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -64 : 64,
    transition: {
      opacity: {
        type: 'tween',
        ease: 'linear',
        duration: 0.15
      },
      x: {
        type: 'tween',
        ease: 'easeIn',
        duration: 0.15
      }
    }
  })
};

interface TabPanelProps {
  children?: React.ReactNode;
  direction: number;
}

function TabPanel({ children, direction }: TabPanelProps) {
  const classes = useStyles();

  return (
    <motion.div
      variants={variants}
      custom={direction}
      initial="initial"
      animate="enter"
      exit="exit"
      className={classes.tabPanel}
    >
      {children}
    </motion.div>
  );
}

export default TabPanel;
