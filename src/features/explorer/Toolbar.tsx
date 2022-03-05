import { useTheme } from '@mui/material/styles';
import { motion, Variants } from 'framer-motion';
import React from 'react';

const toolbar: Variants = {
  initial: {},
  visible: { transition: { staggerChildren: 0.04 } },
  exit: {}
};

interface ToolbarProps {
  children: React.ReactNode;
}

export function Toolbar({ children }: ToolbarProps) {
  const theme = useTheme();

  return (
    <motion.div
      variants={toolbar}
      initial="initial"
      animate="visible"
      exit="exit"
      style={{
        display: 'grid',
        gridRowGap: theme.spacing(1),
        position: 'absolute',
        top: 0,
        left: '100%',
        marginLeft: theme.spacing(1)
      }}
    >
      {children}
    </motion.div>
  );
}

export default Toolbar;
