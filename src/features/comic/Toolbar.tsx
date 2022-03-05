import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MailIcon from '@mui/icons-material/Mail';
import AppBar from '@mui/material/AppBar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MuiToolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
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
          sx={{
            '& .MuiBadge-anchorOriginBottomRightRectangular': {
              right: 2,
              bottom: 2
            }
          }}
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
    <AppBar
      component={motion.div}
      initial="initial"
      animate="enter"
      exit="exit"
      variants={toolbarVariants}
      sx={{
        height: 40
      }}
    >
      <MuiToolbar
        sx={{
          position: 'relative',
          flex: '1 1 100%',
          alignItems: 'stretch',
          minHeight: 'initial',
          height: 40,
          padding: 0,
          userSelect: 'none'
        }}
      >
        <IconButton onClick={() => onBack()}>
          <ArrowBackIcon sx={{ fontSize: 24 }} />
        </IconButton>

        <Box
          component={motion.div}
          layout
          sx={{
            display: 'flex',
            flexGrow: 1,
            alignItems: 'center',
            justifyContent: 'flex-start',
            px: 1,
          }}
        >
          <Typography sx={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {comic.title}
          </Typography>
        </Box>

        <AnimatePresence>
          {(newPages ?? 0) > 0 && <MarkAsRead comicId={comic.id} />}
        </AnimatePresence>

        <Navigation
          bookmark={comic.bookmark}
          numPages={comic.pages.length}
          onPageChange={handlePageChange}
        />

        <Zoom value={comic.layout.zoom * 100} onChange={handleZoomChange} />

        <Brightness
          value={comic.brightness * 100}
          onChange={handleBrightnessChange}
        />

        <LayoutDialog comic={comic} />

        <ExplorerDialog comic={comic} />
      </MuiToolbar>
    </AppBar>
  );
}

export default Toolbar;
