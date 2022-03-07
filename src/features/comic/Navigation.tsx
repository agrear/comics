import BackspaceIcon from '@mui/icons-material/Backspace';
import TelegramIcon from '@mui/icons-material/Telegram';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import React from 'react';

import Flyout from '../flyout/Flyout';

interface DigitProps {
  disabled: boolean;
  children: number;
  onClick: () => void;
}

function Digit({ disabled, children, onClick }: DigitProps) {
  return (
    <Button
      variant="outlined"
      disabled={disabled}
      style={{ gridArea: `digit-${children}` }}
      onClick={onClick}
      sx={{
        minWidth: 'initial',
        minHeight: 'initial',
        padding: 0
      }}
    >
      <Typography>
        {children}
      </Typography>
    </Button>
  );
}

interface NavigationProps {
  open: boolean;
  anchorEl?: HTMLElement | null;
  numPages: number;
  onClose: () => void;
  onPageChange: (index: number) => void;
}

export function Navigation({
  open,
  anchorEl,
  numPages,
  onClose,
  onPageChange
}: NavigationProps) {
  const [page, setPage] = React.useState('');

  const isValid = (digit: number) => Number(page + digit) <= numPages;

  return (
    <Flyout
      open={open}
      anchorEl={anchorEl}
      paperProps={{ sx: { p: 2 } }}
      onClose={onClose}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 40px)',
          gridTemplateRows: 'repeat(5, 40px)',
          gridTemplateAreas: `
            'page page page'
            'digit-7 digit-8 digit-9'
            'digit-4 digit-5 digit-6'
            'digit-1 digit-2 digit-3'
            'erase digit-0 go'
          `,
          gridGap: theme => theme.spacing(1),
          alignItems: 'stretch',
          justifyItems: 'stretch'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gridArea: 'page',
            px: 1,
            border: 1,
            borderColor: 'primary.main',
            borderRadius: 1
          }}
        >
          <Typography variant="h3">
            {page !== '' ? page : 0}
          </Typography>
        </Box>

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
          onClick={() => setPage(prev => prev.slice(0, prev.length - 1))}
          sx={{
            minWidth: 'initial',
            minHeight: 'initial',
            p: 0,
            gridArea: 'erase'
          }}
        >
          <BackspaceIcon sx={{ fontSize: 24 }} />
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
          onClick={() => {
            onPageChange(Number(page) - 1);
            setPage('');
          }}
          sx={{
            minWidth: 'initial',
            minHeight: 'initial',
            p: 0,
            gridArea: 'go'
          }}
        >
          <TelegramIcon sx={{ fontSize: 24 }} />
        </Button>
      </Box>
    </Flyout>
  );
}

export default Navigation;
