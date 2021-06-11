import ListItem from '@material-ui/core/ListItem';
import React from 'react';
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom';

import navItems from './navItems';

interface NavItemProps {
  path: string;
  className: string;
  closeDrawer: () => void;
  children: React.ReactNode;
}

export function NavItem({ path, className, closeDrawer, children }: NavItemProps) {
  const history = useHistory();
  const location = useLocation();
  const match = useRouteMatch({ path, exact: path === '/' });

  const index = React.useMemo(() => (
    navItems.findIndex(item => item.path === path)
  ), [path]);

  const currIndex = React.useMemo(() => (
    navItems.findIndex(item => item.path === location.pathname)
  ), [location.pathname]);

  const direction = React.useMemo(() => (
    Math.sign(index - currIndex) > 0 ? 'top' : 'bottom'
  ), [currIndex, index]);

  return (
    <ListItem
      button
      disableGutters
      className={className}
      selected={match !== null}
      onClick={() => {
        if (match === null) {
          history.push(path, {
            transition: { name: 'glide', direction, offset: 32 }
          });

          closeDrawer();
        }
      }}
    >
      {children}
    </ListItem>
  );
}

export default NavItem;
