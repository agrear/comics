import { clamp } from '@popmotion/popcorn';
import { motion } from 'framer-motion';
import React from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';

import Brightness from './Brightness';
import Navigation from './Navigation';
import Toolbar from './Toolbar';
import Zoom from './Zoom';
import {
  bookmarkUpdated,
  comicBrightnessUpdated,
  comicClosed,
  comicMarkedAsRead,
  comicOpened,
  comicLayoutUpdated,
  selectComic,
  selectNewPages
} from './comicSlice';
import FlipView from './flip-view/FlipView';
import LayoutDialog from './layout/LayoutDialog';
import ExplorerDialog from '../explorer/ExplorerDialog';
import { explorerClosed, explorerOpened } from '../explorer/explorerSlice';
import { formatPercentage, Layout } from 'utils';

enum Menu {
  Brightness,
  Navigation,
  Zoom
}

enum UIState {
  ExplorerDialogOpen,
  LayoutDialogOpen,
  Idle,
  MenuOpen
}

export function Comic() {
  const dispatch = useDispatch();
  const history = useHistory();
  const { comicId } = useParams<{ comicId: string }>();
  const comic = useSelector(selectComic(comicId), shallowEqual);
  const newPages = useSelector(selectNewPages(comic?.id));

  const [goBack, setGoBack] = React.useState<boolean>(false);
  const [state, setState] = React.useState<UIState>(UIState.Idle);
  const [menuButtons, setMenuButtons] = React.useState({
    [Menu.Brightness]: null as (HTMLElement | null),
    [Menu.Navigation]: null as (HTMLElement | null),
    [Menu.Zoom]: null as (HTMLElement | null)
  });
  const [menuOpen, setMenuOpen] = React.useState<Menu | null>(null);

  const onMenuButtonClick = (event: React.SyntheticEvent, menu: Menu) => {
    const button = event.currentTarget as HTMLButtonElement;

    setMenuButtons({ ...menuButtons, [menu]: button });
    setMenuOpen(menuOpen !== menu ? menu : null);
    setState(menuOpen !== menu ? UIState.MenuOpen : UIState.Idle);

    // Prevent menu from being toggled with Enter key
    button.blur();
  };

  const onMenuClose = (menu: Menu) => {
    if (menu === menuOpen) {
      setMenuOpen(null);
      setState(UIState.Idle);
    }
  };

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

  const closeExplorer = () => {
    dispatch(explorerClosed({ comicId: comic.id }));
    setState(UIState.Idle);
  };

  const markAsRead = () => {
    dispatch(comicMarkedAsRead({ comicId: comic.id }))
  };

  const openExplorer = () => {
    dispatch(explorerOpened({
      comicId: comic.id,
      index: Math.max(0, comic.bookmark)
    }));

    setState(UIState.ExplorerDialogOpen);
  };

  const updateBookmark = (index: number) => {
    if (comic.pages[index] !== undefined) {
      dispatch(bookmarkUpdated({ page: comic.pages[index] }));
    }
  };

  const updateBrightness = (value: number) => {
    dispatch(comicBrightnessUpdated({
      comicId: comic.id,
      brightness: clamp(0.25, 1.25, value / 100)
    }));
  };

  const updateLayout = (layout: Partial<Layout>) => {
    dispatch(comicLayoutUpdated({
      comicId: comic.id,
      layout: {
        ...comic.layout,
        ...layout
      }
    }));
  };

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
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        outline: 'none'
      }}
    >
      <Toolbar
        title={comic.title}
        bookmark={comic.bookmark}
        numPages={comic.pages.length}
        brightness={formatPercentage(comic.brightness)}
        zoom={formatPercentage(comic.layout.zoom)}
        newPages={newPages ?? 0}
        onBackClick={() => setGoBack(true)}
        onBrightnessClick={event => onMenuButtonClick(event, Menu.Brightness)}
        onMarkAsReadClick={markAsRead}
        onNavigationClick={event => onMenuButtonClick(event, Menu.Navigation)}
        onZoomClick={event => onMenuButtonClick(event, Menu.Zoom)}
        onLayoutClick={() => setState(UIState.LayoutDialogOpen)}
        onExplorerClick={openExplorer}
      />

      <Navigation
        open={menuOpen === Menu.Navigation}
        anchorEl={menuButtons[Menu.Navigation]}
        numPages={comic.pages.length}
        onClose={() => onMenuClose(Menu.Navigation)}
        onPageChange={index => {
          updateBookmark(index);
          onMenuClose(Menu.Navigation);
        }}
      />

      <Zoom
        open={menuOpen === Menu.Zoom}
        anchorEl={menuButtons[Menu.Zoom]}
        value={comic.layout.zoom * 100}
        displayValue={formatPercentage}
        onChange={value => updateZoom(value / 100)}
        onClose={() => onMenuClose(Menu.Zoom)}
      />

      <Brightness
        open={menuOpen === Menu.Brightness}
        anchorEl={menuButtons[Menu.Brightness]}
        value={comic.brightness * 100}
        displayValue={formatPercentage}
        onChange={value => updateBrightness(value / 100)}
        onClose={() => onMenuClose(Menu.Brightness)}
      />

      <LayoutDialog
        open={state === UIState.LayoutDialogOpen}
        layout={comic.layout}
        onClose={() => setState(UIState.Idle)}
        onLayoutChange={updateLayout}
      />

      <ExplorerDialog
        open={state === UIState.ExplorerDialogOpen}
        comic={comic}
        onClose={closeExplorer}
      />

      <FlipView
        pages={comic.pages}
        selectedIndex={comic.bookmark}
        disabled={state !== UIState.Idle}
        brightness={comic.brightness}
        layout={comic.layout}
        exit={goBack}
        onExitComplete={() => history.push(`/#back`)}
        onSelectedIndexChange={updateBookmark}
        onZoomChange={updateZoom}
      />
    </motion.div>
  );
}

export default Comic;
