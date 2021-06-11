import { ThemeProvider } from '@material-ui/core/styles';
import type { } from '@material-ui/lab/themeAugmentation';
import { SnackbarProvider } from 'notistack';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider as StoreProvider } from 'react-redux';
import { MemoryRouter as Router } from 'react-router-dom';
import 'typeface-roboto';

import "./index.css";
import App from "./app/App";
import { createStore } from './app/store';
import { createTheme } from './app/theme';

const store = createStore();
const theme = createTheme();

function Root() {
  return (
    <React.StrictMode>
      <StoreProvider store={store}>
        <ThemeProvider theme={theme}>
          <SnackbarProvider maxSnack={1}>
            <Router>
              <App />
            </Router>
          </SnackbarProvider>
        </ThemeProvider>
      </StoreProvider>
    </React.StrictMode>
  );
}

ReactDOM.render(<Root />, document.getElementById('root'));
