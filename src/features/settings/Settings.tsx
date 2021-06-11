import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';
import { makeStyles, Theme } from '@material-ui/core/styles';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  minimizeToTrayUpdated,
  openAtLoginUpdated,
  selectPreferences,
  selectWindowModeRequiresRestart,
  WindowMode,
  windowModeUpdated
} from './preferencesSlice';
import Tab from '../tabs/Tab';
import TabbedPage from '../tabs/TabbedPage';

const useStyles = makeStyles((theme: Theme) => ({
  settings: {
    width: '100%'
  },
  tabs: {
    alignItems: 'center'
  },
  tab: {
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    padding: theme.spacing(2)
  },
  gridContainer: {
    display: 'flex',
    justifyContent: 'center',
    flex: '1 1 100%'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'auto minmax(auto, 240px)',
    gridTemplateRows: 'auto',
    columnGap: theme.spacing(2),
    rowGap: theme.spacing(1),
    alignItems: 'start',
    flex: '1 1 100%',
    maxWidth: 640,
    margin: theme.spacing(2)
  },
  description: {
    //marginTop: theme.spacing(1),
    //marginBottom: theme.spacing(0.5),
    userSelect: 'none'
  },
  formControl: {
    margin: 0
  },
  formHelperText: {
    margin: 0
  },
  icon: {
    top: 'calc(50% - 17.5px)'
  },
  switch: {
    justifySelf: 'center'
  }
}));

interface SettingsGridProps {
  children: React.ReactNode;
}

function SettingsGrid({ children }: SettingsGridProps) {
  const classes = useStyles();

  return (
    <div className={classes.gridContainer}>
      <div className={classes.grid}>
        {children}
      </div>
    </div>
  );
}

function Settings() {
  const classes = useStyles();
  const dispatch =  useDispatch();

  const preferences = useSelector(selectPreferences);
  const windowModeRequiresRestart = useSelector(
    selectWindowModeRequiresRestart
  );

  return (
    <div className={classes.settings}>
      <TabbedPage className={classes.tabs}>
        <Tab label="Graphics" className={classes.tab}>
          <SettingsGrid>
            <Typography className={classes.description}>
              Window mode
            </Typography>
            <FormControl
              className={classes.formControl}
              error={windowModeRequiresRestart}
            >
              <Select
                variant="standard"
                value={preferences.windowMode}
                onChange={event => dispatch(
                  windowModeUpdated(event.target.value as WindowMode)
                )}
                classes={{ icon: classes.icon }}
              >
                <MenuItem value={'windowed'}>Windowed</MenuItem>
                <MenuItem value={'borderless'}>Borderless</MenuItem>
                <MenuItem value={'fullscreen'}>Fullscreen</MenuItem>
              </Select>
              {windowModeRequiresRestart && (
                <FormHelperText className={classes.formHelperText}>
                  This option requires a restart
                </FormHelperText>
              )}
            </FormControl>
          </SettingsGrid>
        </Tab>

        <Tab label="System" className={classes.tab}>
          <SettingsGrid>
            <Typography className={classes.description}>
              Minimize to tray
            </Typography>
            <Switch
              checked={preferences.minimizeToTray}
              onChange={(event, checked) => dispatch(
                minimizeToTrayUpdated(checked)
              )}
              color="primary"
              className={classes.switch}
            />

            <Typography className={classes.description}>
              Open at login
            </Typography>
            <Switch
              checked={preferences.openAtLogin}
              onChange={(event, checked) => dispatch(
                openAtLoginUpdated(checked)
              )}
              color="primary"
              className={classes.switch}
            />
          </SettingsGrid>
        </Tab>
      </TabbedPage>
    </div>
  );
}

export default Settings;
