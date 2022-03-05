import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { EntityId } from '@reduxjs/toolkit';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import React from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';

import Item from './Item';
import ToolbarTemplate from './ToolbarTemplate';

const list: Variants = {
  initial: {},
  enter: {
    transition: {
      staggerChildren: 0.05
    }
  }
};

const listItem: Variants = {
  initial: {
    opacity: 0,
    x: 32
  },
  enter: {
    opacity: 1,
    x: 0
  }
};

interface MasterProps<T> {
  items: T[];
  ItemTemplate: (item: T) => JSX.Element;
  Toolbar: (props: { items: T[] }) => JSX.Element;
}

export function Master<T extends Item>({
  items,
  ItemTemplate,
  Toolbar
}: MasterProps<T>) {
  const history = useHistory();
  const { url } = useRouteMatch();

  const [selectedItem, setSelectedItem] = React.useState<T | undefined>(
    undefined
  );

  const selectedIndex = React.useMemo(() => (
    items.findIndex(({ id }) => id === selectedItem?.id)
  ), [items, selectedItem]);

  const getDirection = React.useCallback((itemId: EntityId) => {
    if (selectedIndex === -1) {
      return 0;
    }

    const nextIndex = items.findIndex(({ id }) => id === itemId);

    return Math.sign(nextIndex - selectedIndex);
  }, [items, selectedIndex]);

  React.useEffect(() => {
    setSelectedItem(selectedItem => (
      items.find(({ id }) => id === selectedItem?.id)
    ));
  }, [items]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: '0 0 320px',
        height: '100%'
      }}
    >
      <AnimatePresence>
        <List
          disablePadding
          component={motion.ul}
          variants={list}
          initial="initial"
          animate="enter"
          sx={{
            flex: '1 1 100%',
            width: '100%',
            overflowX: 'hidden',
            overflowY: 'auto'
          }}
        >
          {items.map(item => (
            <ListItem
              key={item.id}
              button
              component={motion.div}
              selected={item.id === selectedItem?.id}
              layout
              variants={listItem}
              onClick={() => {
                setSelectedItem(selectedItem => {
                  history.push(`${url}/${item.id}`, {
                    direction: getDirection(item.id)
                  });

                  return item;
                });
              }}
              sx={{
                width: 320,
                overflow: 'hidden'
              }}
            >
              <ItemTemplate {...item} />
            </ListItem>
          ))}
        </List>
      </AnimatePresence>

      <ToolbarTemplate>
        <Toolbar items={items} />
      </ToolbarTemplate>
    </Box>
  );
}

export default Master;
