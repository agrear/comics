import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { fade, lighten, makeStyles, Theme } from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';
import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew';
import clsx from 'clsx';
import { motion, useCycle, Variants } from 'framer-motion';
import React from 'react';

import NavItem from './NavItem';
import navItems from './navItems';

const navbarWidth = 52;

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: navbarWidth,
    zIndex: theme.zIndex.drawer
  },
  drawer: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    backdropFilter: 'blur(4px)'
  },
  menu: {
    flexGrow: 1
  },
  button: {
    ...theme.typography.button,
    fontSize: 20
  },
  item: {
    width: '100%',
    height: '52px',
    cursor: 'default'
  },
  icon: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(-1.5),
    padding: 0
  },
  exit: {
    "&:hover": {
      backgroundColor: fade(lighten(theme.palette.error.main, 0.2), 0.5)
    }
  }
}));

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
  const classes = useStyles();
  const [isOpen, toggleOpen] = useCycle(false, true);

  const closeDrawer = () => {
    if (isOpen) {
      toggleOpen();
    }
  };

  return (
    <ClickAwayListener onClickAway={() => closeDrawer()}>
      <motion.div
        className={classes.root}
        variants={variants}
        initial="initial"
        animate="enter"
        exit="exit"
      >
        <motion.div
          className={classes.drawer}
          variants={variants}
          initial="closed"
          animate={isOpen ? 'open' : 'closed'}
        >
          <List disablePadding className={classes.menu}>
            <ListItem
              key="Menu"
              button
              disableGutters
              className={classes.item}
              onClick={() => toggleOpen()}
            >
              <ListItemIcon className={classes.icon}>
                <MenuIcon fontSize="large" />
              </ListItemIcon>
              <ListItemText
                primary="Comics"
                primaryTypographyProps={{ className: classes.button }}
              />
            </ListItem>
          </List>

          <List component="nav" disablePadding>
            {navItems.map(({ id, path, Icon }) => (
              <NavItem
                key={id}
                path={path}
                className={classes.item}
                closeDrawer={closeDrawer}
              >
                <ListItemIcon className={classes.icon}>
                  <Icon fontSize="large" />
                </ListItemIcon>
                <ListItemText primary={id} />
              </NavItem>
            ))}
          </List>

          <List disablePadding>
            <ListItem
              key="Exit"
              button
              disableGutters
              className={clsx(classes.item, classes.exit)}
              onClick={() => window.comicsApi.quit()}
            >
              <ListItemIcon className={classes.icon}>
                <PowerSettingsNewIcon fontSize="large" />
              </ListItemIcon>
              <ListItemText primary="Exit" />
            </ListItem>
          </List>
        </motion.div>
      </motion.div>
    </ClickAwayListener>
  );
}

export default Navbar;
