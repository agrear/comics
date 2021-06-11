import Button from '@material-ui/core/Button';
import { createStyles, darken, makeStyles, Theme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import BackspaceIcon from '@material-ui/icons/Backspace';
import NavigationIcon from '@material-ui/icons/Navigation';
import TelegramIcon from '@material-ui/icons/Telegram';
import clsx from 'clsx';
import React from 'react';

import Flyout from '../flyout/Flyout';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    navigation: {
      display: 'flex',
      flexDirection: 'column',
      padding: theme.spacing(1),
      background: darken(theme.palette.background.paper, 0.15)
    },
    page: {
      gridArea: 'page',
      margin: 0
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 40px)',
      gridTemplateRows: 'auto repeat(4, 40px)',
      gridTemplateAreas: `
      'page page page'
      'digit-7 digit-8 digit-9'
      'digit-4 digit-5 digit-6'
      'digit-1 digit-2 digit-3'
      'erase digit-0 go'`,
      gridGap: theme.spacing(1),
      alignItems: 'stretch',
      justifyItems: 'stretch'
    },
    button: {
      minWidth: 'initial',
      minHeight: 'initial',
      padding: 0
    },
    erase: {
      gridArea: 'erase'
    },
    go: {
      gridArea: 'go'
    },
    icon: {
      fontSize: 24
    }
  })
);

interface DigitProps {
  disabled: boolean;
  children: number;
  onClick: () => void;
}

function Digit({ disabled, children, onClick }: DigitProps) {
  const classes = useStyles();

  return (
    <Button
      variant="outlined"
      disabled={disabled}
      style={{ gridArea: `digit-${children}` }}
      className={classes.button}
      onClick={onClick}
    >
      <Typography>
        {children}
      </Typography>
    </Button>
  );
}

interface NavigationProps {
  bookmark: number;
  numPages: number;
  onPageChange: (index: number) => void;
}

export function Navigation({ bookmark, numPages, onPageChange }: NavigationProps) {
  const classes = useStyles();
  const [page, setPage] = React.useState('');

  const isValid = (digit: number) => Number(page + digit) <= numPages;

  return (
    <Flyout
      buttonProps={{
        children: `${bookmark + 1} / ${numPages}`,
        startIcon: <NavigationIcon />,
        disabled: numPages <= 1
      }}
    >
      <div className={classes.navigation}>
        <div className={classes.grid}>
          <TextField
            label="Page"
            name="page"
            value={page}
            type="number"
            placeholder={String(bookmark + 1)}
            variant="outlined"
            disabled
            fullWidth
            InputLabelProps={{ shrink: true }}
            className={classes.page}
          />
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(digit => (
            <Digit
              key={digit}
              disabled={!isValid(digit)}
              onClick={() => setPage(prev => prev + digit)}
            >
              {digit}
            </Digit>
          ))}
          <Button
            variant="outlined"
            disabled={page.length === 0}
            className={clsx(classes.button, classes.erase)}
            onClick={() => setPage(prev => prev.slice(0, prev.length - 1))}
          >
            <BackspaceIcon className={classes.icon} />
          </Button>
          <Digit
            key={0}
            disabled={page.length === 0 || !isValid(0)}
            onClick={() => setPage(prev => prev + '0')}
          >
            {0}
          </Digit>
          <Button
            variant="outlined"
            disabled={page.length === 0}
            className={clsx(classes.button, classes.go)}
            onClick={() => {
              onPageChange(Number(page) - 1);
              setPage('');
            }}
          >
            <TelegramIcon className={classes.icon} />
          </Button>
        </div>
      </div>
    </Flyout>
  );
}

export default Navigation;
