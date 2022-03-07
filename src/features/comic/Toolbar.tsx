import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExploreIcon from '@mui/icons-material/Explore';
import MailIcon from '@mui/icons-material/Mail';
import NavigationIcon from '@mui/icons-material/Navigation';
import SearchIcon from '@mui/icons-material/Search';
import SettingsOverscanIcon from '@mui/icons-material/SettingsOverscan';
import WbIncandescentIcon from '@mui/icons-material/WbIncandescent';
import AppBar from '@mui/material/AppBar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MuiToolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import React from 'react';

const variants: Variants = {
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
  onTap: () => void;
}

function MarkAsRead({ onTap }: MarkAsReadProps) {
  const [showTooltip, toggleTooltip] = React.useState<boolean>(false);

  return (
    <Tooltip open={showTooltip} placement="bottom" title="Mark as read">
      <Button
        component={motion.button}
        animate={{ opacity: 1 }}
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        disableElevation
        onTap={onTap}
        onPointerEnter={() => toggleTooltip(true)}
        onPointerLeave={() => toggleTooltip(false)}
      >
        <Badge
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
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
  title: string;
  bookmark: number;
  numPages: number;
  brightness: string;
  zoom: string;
  newPages: number;
  onBackClick: () => void;
  onBrightnessClick: (event: React.SyntheticEvent) => void;
  onMarkAsReadClick: () => void;
  onNavigationClick: (event: React.SyntheticEvent) => void;
  onZoomClick: (event: React.SyntheticEvent) => void;
  onLayoutClick: () => void;
  onExplorerClick: () => void;
}

export function Toolbar({
  title,
  bookmark,
  numPages,
  brightness,
  zoom,
  newPages,
  onBackClick,
  onBrightnessClick,
  onMarkAsReadClick,
  onNavigationClick,
  onZoomClick,
  onLayoutClick,
  onExplorerClick
}: ToolbarProps) {
  return (
    <AppBar
      component={motion.div}
      initial="initial"
      animate="enter"
      exit="exit"
      variants={variants}
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
        <IconButton onClick={onBackClick}>
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
            {title}
          </Typography>
        </Box>

        <AnimatePresence>
          {(newPages ?? 0) > 0 && (
            <MarkAsRead onTap={onMarkAsReadClick} />
          )}
        </AnimatePresence>

        <Button
          startIcon={<NavigationIcon />}
          disabled={numPages <= 1}
          onClick={onNavigationClick}
        >
          {bookmark + 1} / {numPages}
        </Button>

        <Button
          startIcon={<SearchIcon />}
          onClick={onZoomClick}
          sx={{ minWidth: theme => theme.spacing(11) }}
        >
          {zoom}
        </Button>

        <Button
          startIcon={<WbIncandescentIcon />}
          onClick={onBrightnessClick}
          sx={{ minWidth: theme => theme.spacing(11) }}
        >
          {brightness}
        </Button>

        <Button
          startIcon={<SettingsOverscanIcon />}
          onClick={onLayoutClick}
        >
          Layout
        </Button>

        <Button
          startIcon={<ExploreIcon />}
          onClick={onExplorerClick}
        >
          Explorer
        </Button>
      </MuiToolbar>
    </AppBar>
  );
}

export default Toolbar;
