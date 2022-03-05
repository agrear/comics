import MenuIcon from '@mui/icons-material/Menu';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { alpha, lighten, styled, useTheme } from '@mui/material/styles';
import { motion, useCycle, Variants } from 'framer-motion';
import React from 'react';

import NavItem from './NavItem';
import navItems from './navItems';

export const NAVBAR_WIDTH = 40;
export const ICON_SIZE = 28;

const StyledListItemButton = styled(ListItemButton)({
  width: '100%',
  height: NAVBAR_WIDTH,
  cursor: 'default'
});

const StyledListItemIcon = styled(ListItemIcon)({
  display: 'flex',
  justifyContent: 'center',
  minWidth: 0,
  width: NAVBAR_WIDTH,
  ml: 1,
  mr: -1.5,
  p: 0
});

const variants: Variants = {
  initial: {
    x: '-100%'
  },
  enter: {
    x: 0,
    transition: {
      type: 'tween',
      ease: 'easeOut',
      duration: 0.8
    }
  },
  exit: {
    x: '-100%',
    transition: {
      type: 'tween',
      ease: 'easeIn',
      duration: 0.5
    }
  },
  closed: {
    width: '100%',
    transition: {
      type: 'tween',
      ease: 'circIn',
      duration: 0.15
    }
  },
  open: {
    width: '200px',
    transition: {
      type: 'tween',
      ease: 'circOut',
      duration: 0.3
    }
  }
};

function Navbar() {
  const theme = useTheme();
  const [isOpen, toggleOpen] = useCycle(false, true);

  const closeDrawer = () => {
    if (isOpen) {
      toggleOpen();
    }
  };

  return (
    <ClickAwayListener onClickAway={() => closeDrawer()}>
      <motion.div
        variants={variants}
        initial="initial"
        animate="enter"
        exit="exit"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: NAVBAR_WIDTH,
          zIndex: theme.zIndex.drawer,
          background: lighten(theme.palette.grey[900], 0.1)
        }}
      >
        <motion.div
          variants={variants}
          initial="closed"
          animate={isOpen ? 'open' : 'closed'}
          style={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            backdropFilter: 'blur(4px)'
          }}
        >
          <List disablePadding sx={{ flexGrow: 1 }}>
            <StyledListItemButton
              key="Menu"
              disableGutters
              onClick={() => toggleOpen()}
            >
              <StyledListItemIcon>
                <MenuIcon sx={{ fontSize: ICON_SIZE }} />
              </StyledListItemIcon>
              <ListItemText
                primary="Comics"
                primaryTypographyProps={{
                  variant: 'button',
                  sx: { fontSize: 20 }
                }}
              />
            </StyledListItemButton>
          </List>

          <List component="nav" disablePadding>
            {navItems.map(({ id, path, Icon }) => (
              <NavItem
                key={id}
                path={path}
                closeDrawer={closeDrawer}
                sx={{
                  width: '100%',
                  height: NAVBAR_WIDTH,
                  cursor: 'default'
                }}
              >
                <StyledListItemIcon>
                  <Icon sx={{ fontSize: ICON_SIZE }} />
                </StyledListItemIcon>
                <ListItemText primary={id} />
              </NavItem>
            ))}
          </List>

          <List disablePadding>
            <StyledListItemButton
              key="Exit"
              disableGutters
              onClick={() => window.comicsApi.quit()}
              sx={{
                '&:hover': {
                  backgroundColor: theme => alpha(
                    lighten(theme.palette.error.main, 0.2),
                    0.5
                  )
                }
              }}
            >
              <StyledListItemIcon>
                <PowerSettingsNewIcon sx={{ fontSize: ICON_SIZE }} />
              </StyledListItemIcon>
              <ListItemText primary="Exit" />
            </StyledListItemButton>
          </List>
        </motion.div>
      </motion.div>
    </ClickAwayListener>
  );
}

export default Navbar;
