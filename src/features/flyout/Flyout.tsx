import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper, { PaperProps } from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import React from 'react';

interface FlyoutProps {
  open: boolean;
  children: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  anchorEl?: HTMLElement | null;
  paperProps?: PaperProps;
  onClose?: () => void;
}

export function Flyout({
  open,
  children,
  anchorEl,
  paperProps = {},
  onClose
}: FlyoutProps) {
  const handleClose = (event: MouseEvent | TouchEvent) => {
    const target = event.target as HTMLElement;
    if (anchorEl?.contains(target)) {
      return;
    }

    onClose?.();
  };

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      role={undefined}
      transition
    >
      {({ TransitionProps, placement }) => (
        <Grow
          {...TransitionProps}
          style={{
            transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom'
          }}
        >
          <Paper {...paperProps}>
            <ClickAwayListener onClickAway={handleClose}>
              {children}
            </ClickAwayListener>
          </Paper>
        </Grow>
      )}
    </Popper>
  );
}

export default Flyout;
