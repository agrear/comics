import { makeStyles, Theme } from '@material-ui/core/styles';
import { AnimatePresence } from 'framer-motion';
import React from 'react';
import { Route, Switch, useLocation, useRouteMatch } from 'react-router-dom';

import Detail from './Detail';
import Item from './Item';
import Master from './Master';
import Placeholder from './Placeholder';

const useStyles = makeStyles((theme: Theme) => ({
  masterDetail: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    height: "100%"
  }
}));

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
  const classes = useStyles();
  const location = useLocation<{ direction?: string }>();
  const { path } = useRouteMatch();

  const direction = React.useMemo(() => {
    const direction = location.state?.direction;
    return direction === undefined ? 0 : Number(direction);
  }, [location.state]);

  return (
    <div className={classes.masterDetail}>
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
    </div>
  );
}

export default MasterDetailView;
