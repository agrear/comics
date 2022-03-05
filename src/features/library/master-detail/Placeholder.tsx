import ViewListIcon from '@mui/icons-material/ViewList';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import { motion, Variants } from 'framer-motion';
import React from 'react';

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
  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={variants}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        userSelect: 'none'
      }}
    >
      <ListItemIcon sx={{ minWidth: 'initial', p: 0 }}>
        <ViewListIcon />
      </ListItemIcon>
      <Typography variant="h4">
        Select a comic
      </Typography>
    </motion.div>
  );
}

export default Placeholder;
