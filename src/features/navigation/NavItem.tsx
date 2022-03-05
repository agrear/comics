import ListItemButton from '@mui/material/ListItemButton';
import { SxProps } from '@mui/material/styles';
import React from 'react';
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom';

import navItems from './navItems';

interface NavItemProps {
  path: string;
  closeDrawer: () => void;
  children: React.ReactNode;
  sx: SxProps;
}

export function NavItem({ path, closeDrawer, children, sx }: NavItemProps) {
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
    <ListItemButton
      disableGutters
      selected={match !== null}
      onClick={() => {
        if (match === null) {
          history.push(path, {
            transition: { name: 'glide', direction, offset: 32 }
          });

          closeDrawer();
        }
      }}
      sx={sx}
    >
      {children}
    </ListItemButton>
  );
}

export default NavItem;
