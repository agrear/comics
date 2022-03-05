import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { AnimatePresence, motion, useIsPresent } from 'framer-motion';
import { Location } from 'history';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Switch, useHistory, useLocation } from 'react-router-dom';

import { selectAppReady } from './appSlice';
import Comic from '../features/comic/Comic';
import Home from '../features/home/Home';
import Library from '../features/library/Library';
import Navbar, { NAVBAR_WIDTH } from '../features/navigation/Navbar';
import { Transition, transitions } from '../features/navigation/transitions';
import { fullscreenToggled } from '../features/settings/preferencesSlice';
import Settings from '../features/settings/Settings';

interface PageProps {
  location: Location<{ transition?: Transition }>;
  children: React.ReactNode
}

function Page({ location, children }: PageProps) {
  const history = useHistory();
  const isPresent = useIsPresent();

  const transition = React.useMemo(() => {
    if (history.length === 1) {
      return { name: 'rise' };
    }

    return location.state?.transition;
  }, [history.length, location.state]);

  return (
    <motion.div
      variants={(!isPresent || transition !== undefined) ? transitions : undefined}
      initial={transition !== undefined ? 'initial' : false}
      animate={transition !== undefined ? 'enter' : false}
      exit={(!isPresent || transition !== undefined) ? 'exit' : undefined}
      custom={transition}
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: NAVBAR_WIDTH,
        display: 'flex',
        flex: '1 1 100%',
        height: '100%',
        overflow: 'hidden'
      }}
    >
      {children}
    </motion.div>
  );
}

function App() {
  const dispatch = useDispatch();
  const location = useLocation<{ transition?: Transition }>();
  const appReady = useSelector(selectAppReady);

  React.useEffect(() => {
    function toggleFullscreen(event: KeyboardEvent) {
      if (event.altKey && event.key === 'Enter') {
        dispatch(fullscreenToggled());
      }
    }

    window.addEventListener('keydown', toggleFullscreen);

    return () => window.removeEventListener('keydown', toggleFullscreen);
  }, [dispatch]);

  if (!appReady) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%'
        }}
      >
        <CircularProgress size={64} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        perspective: 800
      }}
      onKeyPress={event => {}}
    >
      <AnimatePresence>
        <Route exact path={['/', '/library', '/library/*', '/settings']}>
          <Navbar />
        </Route>

        <Switch
          location={location}
          key={location.pathname.startsWith('/comic') ? '/comic' : '/*'}
        >
          <Route path="/comic/:comicId">
            <Comic />
          </Route>

          <Route path="/">
            <AnimatePresence
              exitBeforeEnter
              custom={location.state?.transition ?? {}}
            >
              <Switch
                location={location}
                key={location.pathname.split('/').slice(0, 2).join('/')}
              >
                <Route exact path="/">
                  <Page location={location}><Home /></Page>
                </Route>

                <Route path="/library">
                  <Page location={location}><Library /></Page>
                </Route>

                <Route path="/settings">
                  <Page location={location}><Settings /></Page>
                </Route>
              </Switch>
            </AnimatePresence>
          </Route>
        </Switch>
      </AnimatePresence>
    </Box>
  );
}

export default App;
