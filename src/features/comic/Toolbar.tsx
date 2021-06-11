import Badge from '@material-ui/core/Badge';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import { darken, makeStyles, Theme } from '@material-ui/core/styles';
import MuiToolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import MailIcon from '@material-ui/icons/Mail';
import { clamp } from '@popmotion/popcorn';
import { EntityId } from '@reduxjs/toolkit';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Brightness from './Brightness';
import Navigation from './Navigation';
import Zoom from './Zoom';
import LayoutDialog from './layout/LayoutDialog';
import {
  bookmarkUpdated,
  Comic,
  comicBrightnessUpdated,
  comicMarkedAsRead,
  comicLayoutUpdated,
  selectNewPages
} from '../comic/comicSlice';
import ExplorerDialog from '../explorer/ExplorerDialog';

const useStyles = makeStyles((theme: Theme) => ({
  appBar: {
    display: 'flex',
    height: 40,
    width: '100%',
    background: darken(theme.palette.background.paper, 0.3),
    boxShadow: 'none',
    zIndex: theme.zIndex.appBar
  },
  toolbar: {
    position: 'relative',
    flex: '1 1 100%',
    alignItems: 'stretch',
    minHeight: 'initial',
    padding: 0,
    userSelect: 'none'
  },
  titleBar: {
    display: 'flex',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: theme.spacing(0, 1),
  },
  title: {
    maxLines: 1,
    textOverflow: 'ellipsis'
  },
  badge: {
    right: 2,
    bottom: 2
  },
  navigation: {
    width: 120,
    height: 160,
    padding: theme.spacing(1),
    background: darken(theme.palette.background.paper, 0.15)
  }
}));

const toolbarVariants: Variants = {
  initial: {
    y: '-100%'
  },
  enter: {
    y: 0,
    transition: {
      type: 'tween',
      ease: 'easeOut',
      duration: 0.8
    }
  },
  exit: {
    y: '-100%',
    transition: {
      type: 'tween',
      ease: 'easeIn',
      duration: 0.5
    }
  }
};

interface MarkAsReadProps {
  comicId: EntityId;
}

function MarkAsRead({ comicId }: MarkAsReadProps) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [showTooltip, toggleTooltip] = React.useState<boolean>(false);

  return (
    <Tooltip open={showTooltip} placement="bottom" title="Mark as read">
      <Button
        component={motion.button}
        animate={{ opacity: 1 }}
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        disableElevation
        onTap={() => dispatch(comicMarkedAsRead({ comicId }))}
        onPointerEnter={() => toggleTooltip(true)}
        onPointerLeave={() => toggleTooltip(false)}
      >
        <Badge
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          color="primary"
          variant="dot"
          classes={{ anchorOriginBottomRightRectangle: classes.badge }}
        >
          <MailIcon fontSize="small" />
        </Badge>
      </Button>
    </Tooltip>
  );
}

interface ToolbarProps {
  comic: Comic;
  onBack: () => void;
}

export function Toolbar({ comic, onBack }: ToolbarProps) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const newPages = useSelector(selectNewPages(comic.id));

  const handleBrightnessChange = (value: number) => {
    dispatch(comicBrightnessUpdated({
      comicId: comic.id,
      brightness: clamp(0.25, 1.25, value / 100)
    }));
  };

  const handlePageChange = (index: number) => {
    dispatch(bookmarkUpdated({ page: comic.pages[index] }));
  };

  const handleZoomChange = (value: number) => {
    dispatch(comicLayoutUpdated({
      comicId: comic.id,
      layout: {
        ...comic.layout,
        zoom: clamp(0.5, 2.0, value / 100)
      }
    }));
  };

  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={toolbarVariants}
      className={classes.appBar}
    >
      <MuiToolbar className={classes.toolbar}>
        <IconButton size="small" onClick={() => onBack()}>
          <ArrowBackIcon />
        </IconButton>

        <motion.div layout className={classes.titleBar}>
          <Typography className={classes.title}>
            {comic.title}
          </Typography>
        </motion.div>

        <AnimatePresence>
          {(newPages ?? 0) > 0 && <MarkAsRead comicId={comic.id} />}
        </AnimatePresence>

        <Navigation
          bookmark={comic.bookmark}
          numPages={comic.pages.length}
          onPageChange={handlePageChange}
        />

        <Brightness
          value={comic.brightness * 100}
          onChange={handleBrightnessChange}
        />

        <Zoom value={comic.layout.zoom * 100} onChange={handleZoomChange} />

        <LayoutDialog comic={comic} />

        <ExplorerDialog comic={comic} />
      </MuiToolbar>
    </motion.div>
  );
}

export default Toolbar;
