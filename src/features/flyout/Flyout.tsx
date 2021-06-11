import Button, { ButtonProps } from '@material-ui/core/Button';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import React from 'react';

interface FlyoutProps {
  buttonProps: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>;
  children: React.ReactNode;
  onClose?: () => void;
}

export function Flyout({ buttonProps, children, onClose }: FlyoutProps) {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLButtonElement>(null);

  const { children: buttonChildren, ...otherButtonProps } = buttonProps;

  const handleToggle = React.useCallback(() => {
    setOpen(open => {
      if (!open && onClose !== undefined) {
        onClose();
      }

      return !open;
    });
  }, [onClose]);

  const handleClose = (event: React.MouseEvent<EventTarget>) => {
    const target = event.target as HTMLElement;
    if (anchorRef.current && anchorRef.current.contains(target)) {
      return;
    }

    if (onClose !== undefined) {
      onClose();
    }

    setOpen(false);
  };

  return (
    <>
      <Button
        {...otherButtonProps}
        ref={anchorRef}
        onClick={handleToggle}
      >
        {buttonChildren}
      </Button>

      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom'
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                {children}
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
}

export default Flyout;
