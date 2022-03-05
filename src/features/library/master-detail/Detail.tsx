import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@material-ui/core/Typography';
import { motion, Variants } from 'framer-motion';
import React from 'react';
import { useLocation, useParams } from 'react-router-dom';

import Item from './Item';
import ToolbarTemplate from './ToolbarTemplate';

const variants: Variants = {
  initial: (direction: number) => ({
    opacity: 0,
    scale: direction === 0 ? 0.8 : 1,
    y: direction === 0 ? 0 : (direction > 0 ? 32 : -32)
  }),
  enter: (direction: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "tween",
      ease: "circOut",
      duration: direction === 0 ? 0.5 : 0.3
    }
  }),
  exit: (direction: number) => ({
    opacity: 0.3,
    y: direction > 0 ? -32 : 32,
    transition: {
      type: "tween",
      ease: "circIn",
      duration: 0.15
    }
  })
};

interface DetailProps<T> {
  items: T[];
  ItemTemplate: (item: T) => React.ReactNode;
  Toolbar: (item: T) => JSX.Element;
}

export function Detail<T extends Item>({
  items,
  ItemTemplate,
  Toolbar
}: DetailProps<T>) {
  const location = useLocation<{ direction?: string }>();
  const { comicId } = useParams<{ comicId: string }>();

  const selectedItem = React.useMemo(() => (
    items.find(({ id }) => id === comicId)
  ), [comicId, items]);

  const direction = React.useMemo(() => {
    const direction = location.state?.direction;
    return direction === undefined ? 0 : Number(direction);
  }, [location.state]);

  if (selectedItem === undefined) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%'
        }}
      >
        <ListItemIcon sx={{ minWidth: 'initial', p: 0 }}>
          <DeleteIcon />
        </ListItemIcon>
        <Typography variant="h4">
          Comic deleted
        </Typography>
      </motion.div>
    );
  }

  return (
    <motion.div
      key={selectedItem.id}
      initial="initial"
      animate="enter"
      exit="exit"
      variants={variants}
      custom={direction}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'stretch',
        width: '100%',
        height: '100%'
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        {ItemTemplate(selectedItem)}
      </Box>
      <ToolbarTemplate>
        <Toolbar {...selectedItem} />
      </ToolbarTemplate>
    </motion.div>
  );
}

export default Detail;
