import { makeStyles, Theme } from '@material-ui/core/styles';
import { clamp } from '@popmotion/popcorn';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';

import Toolbar from './Toolbar';
import FlipView from './flip-view/FlipView';
import {
  bookmarkUpdated,
  comicClosed,
  comicOpened,
  comicLayoutUpdated,
  selectComic
} from './comicSlice';

const useStyles = makeStyles((theme: Theme) => ({
  comic: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    outline: 'none'
  },
  flipView: {
    width: '100%',
    flexGrow: 1
  }
}));

export function Comic() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const { comicId } = useParams<{ comicId: string }>();
  const comic = useSelector(selectComic(comicId), shallowEqual);

  const [goBack, setGoBack] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (comic?.id !== undefined) {
      dispatch(comicOpened({ id: comic.id }));

      return () => {
        dispatch(comicClosed({ id: comic.id }));
      };
    }
  }, [comic?.id, dispatch]);

  if (comic === undefined) {
    return null;  // TODO: Add spinner
  }

  const updateZoom = (zoom: number) => {
    dispatch(comicLayoutUpdated({
      comicId: comic.id,
      layout: {
        ...comic.layout,
        zoom: clamp(0.5, 2, zoom)
      }
    }));
  };

  return (
    <motion.div
      key={comic.id}
      onKeyDown={event => {
        if (event.getModifierState('Control')) {
          let zoom = comic.layout.zoom;
          switch (event.key) {
            case '+':  // Zoom in
              zoom += 0.05;
              break;
            case '-':  // Zoom out
              zoom -= 0.05;
              break;
            case '0':  // Reset zoom
              zoom = 1.0;
              break;
            default:
              break;
          }

          updateZoom(zoom);
        }
      }}
      onWheel={event => {  // Zoom with mouse wheel
        if (event.getModifierState('Control')) {
          updateZoom(comic.layout.zoom + event.deltaY * -0.0005);
        }
      }}
      tabIndex={0}
      className={classes.comic}
    >
      <Toolbar
        key="toolbar"
        comic={comic}
        onBack={() => setGoBack(true)}
      />

      <AnimatePresence>
        <FlipView
          pages={comic.pages}
          selectedIndex={comic.bookmark}
          brightness={comic.brightness}
          layout={comic.layout}
          onPageFlip={index => {
            if (comic.pages[index] !== undefined) {
              dispatch(bookmarkUpdated({ page: comic.pages[index] }));
            }
          }}
          exit={goBack}
          onExitComplete={() => history.push(`/#back`)}
        />
      </AnimatePresence>
    </motion.div>
  );
}

export default Comic;
