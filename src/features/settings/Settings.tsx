import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
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

const Label = styled(Typography)({
  userSelect: 'none'
});

const StyledSwitch = styled(Switch)({
  justifySelf: 'center'
});

const StyledTab = styled(Tab)({
  display: 'flex',
  flexDirection: 'column',
  boxSizing: 'border-box',
  p: 2
});

interface SettingsGridProps {
  children: React.ReactNode;
}

function SettingsGrid({ children }: SettingsGridProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        flex: '1 1 100%'
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'auto minmax(auto, 240px)',
          gridTemplateRows: 'auto',
          columnGap: theme => theme.spacing(2),
          rowGap: theme => theme.spacing(1),
          alignItems: 'start',
          flex: '1 1 100%',
          maxWidth: 640,
          m: 2
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

function Settings() {
  const dispatch =  useDispatch();

  const preferences = useSelector(selectPreferences);
  const windowModeRequiresRestart = useSelector(
    selectWindowModeRequiresRestart
  );

  return (
    <Box sx={{ width: '100%' }}>
      <TabbedPage sx={{ alignItems: 'center' }}>
        <StyledTab label="Graphics">
          <SettingsGrid>
            <Label>Window mode</Label>
            <FormControl
              sx={{ m: 0 }}
              error={windowModeRequiresRestart}
            >
              <Select
                variant="standard"
                value={preferences.windowMode}
                onChange={event => dispatch(
                  windowModeUpdated(event.target.value as WindowMode)
                )}
                sx={{
                  '& .MuiSelect-icon': {
                    top: 'calc(50% - 17.5px)'
                  }
                }}
              >
                <MenuItem value={'windowed'}>Windowed</MenuItem>
                <MenuItem value={'borderless'}>Borderless</MenuItem>
                <MenuItem value={'fullscreen'}>Fullscreen</MenuItem>
              </Select>
              {windowModeRequiresRestart && (
                <FormHelperText sx={{ m: 0 }}>
                  This option requires a restart
                </FormHelperText>
              )}
            </FormControl>
          </SettingsGrid>
        </StyledTab>

        <StyledTab label="System">
          <SettingsGrid>
            <Label>Minimize to tray</Label>
            <StyledSwitch
              checked={preferences.minimizeToTray}
              onChange={(event, checked) => dispatch(
                minimizeToTrayUpdated(checked)
              )}
              color="primary"
            />

            <Label>Open at login</Label>
            <StyledSwitch
              checked={preferences.openAtLogin}
              onChange={(event, checked) => dispatch(
                openAtLoginUpdated(checked)
              )}
              color="primary"
            />
          </SettingsGrid>
        </StyledTab>
      </TabbedPage>
    </Box>
  );
}

export default Settings;
