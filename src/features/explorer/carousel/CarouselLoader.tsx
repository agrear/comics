import CircularProgress from '@material-ui/core/CircularProgress';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Tooltip from '@material-ui/core/Tooltip';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { AnimatePresence } from 'framer-motion';
import React from 'react';
import { useSelector } from 'react-redux';

import { selectWebpageImages } from '../explorerSlice';
import { Page } from '../../comic/comicSlice';
import {
  RequestType,
  selectDownloader
} from '../../downloader/downloaderSlice';

const useStyles = makeStyles((theme: Theme) => ({
  tooltip: {
    maxWidth: theme.breakpoints.values.md
  },
  loader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
}));

interface CarouselLoaderProps {
  page: Page | null;
  children: React.ReactNode;
  onCancel: () => void;
}

export function CarouselLoader({
  page,
  children,
  onCancel
}: CarouselLoaderProps) {
  const classes = useStyles();

  const downloader = useSelector(selectDownloader);
  const webpageImages = useSelector(selectWebpageImages);

  const loading = React.useMemo(() => (
    downloader?.running || webpageImages === null
  ), [downloader?.running, webpageImages]);

  const tooltip = React.useMemo(() => {
    if (downloader?.running) {
      if (downloader?.request?.type === RequestType.Webpage) {
        return 'Fetching webpage\u2026';
      } else if (downloader?.request?.type === RequestType.Images) {
        const numImages = downloader?.request?.urls?.length;
        return `Fetching ${numImages} images\u2026`;
      }
    }

    return '';
  }, [downloader]);

  return (
    <AnimatePresence>
      {loading ? (
        <ClickAwayListener
          mouseEvent="onMouseDown"
          touchEvent="onTouchStart"
          onClickAway={() => onCancel()}
        >
          <Tooltip
            title={tooltip}
            disableFocusListener
            disableHoverListener
            disableTouchListener
            open={loading}
            placement="top"
            classes={{ tooltip: classes.tooltip }}
          >
            <div className={classes.loader}>
              <CircularProgress />
            </div>
          </Tooltip>
        </ClickAwayListener>
      ) : children}
    </AnimatePresence>
  );
}

export default CarouselLoader;
