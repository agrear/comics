import Box from '@mui/material/Box';
import { AnimatePresence } from 'framer-motion';
import React from 'react';
import { Route, Switch, useLocation, useRouteMatch } from 'react-router-dom';

import Detail from './Detail';
import Item from './Item';
import Master from './Master';
import Placeholder from './Placeholder';

interface MasterDetailViewProps<T> {
  items: T[];
  MasterItemTemplate: (item: T) => JSX.Element;
  DetailItemTemplate: (item: T) => React.ReactNode;
  MasterToolbar: (props: { items: T[] }) => JSX.Element;
  DetailToolbar: (item: T) => JSX.Element;
}

function MasterDetailView<T extends Item>({
  items,
  MasterItemTemplate,
  DetailItemTemplate,
  MasterToolbar,
  DetailToolbar
}: MasterDetailViewProps<T>) {
  const location = useLocation<{ direction?: string }>();
  const { path } = useRouteMatch();

  const direction = React.useMemo(() => {
    const direction = location.state?.direction;
    return direction === undefined ? 0 : Number(direction);
  }, [location.state]);

  return (
    <Box sx={{ display: 'flex', width: '100%', height: '100%' }}>
      <Master
        items={items}
        ItemTemplate={MasterItemTemplate}
        Toolbar={MasterToolbar}
      />

      <AnimatePresence exitBeforeEnter custom={direction}>
        <Switch location={location} key={location.pathname}>
          <Route exact path={path}>
            <Placeholder />
          </Route>

          <Route path={`${path}/:comicId`}>
            <Detail
              items={items}
              ItemTemplate={DetailItemTemplate}
              Toolbar={DetailToolbar}
            />
          </Route>
        </Switch>
      </AnimatePresence>
    </Box>
  );
}

export default MasterDetailView;
