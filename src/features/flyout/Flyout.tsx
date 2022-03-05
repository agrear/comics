import Button, { ButtonProps } from '@mui/material/Button';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper, { PaperProps } from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import React from 'react';

interface FlyoutProps {
  buttonProps: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>;
  children: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  onClose?: () => void;
  paperProps?: PaperProps
}

export function Flyout({
  buttonProps,
  children,
  onClose,
  paperProps = {}
}: FlyoutProps) {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLButtonElement>(null);

  const { children: buttonChildren, ...otherButtonProps } = buttonProps;

  const handleToggle = React.useCallback(() => {
    setOpen(open => {
      if (!open) {
        onClose?.();
      }

      return !open;
    });
  }, [onClose]);

  const handleClose = (event: MouseEvent | TouchEvent) => {
    const target = event.target as HTMLElement;
    if (anchorRef.current?.contains(target)) {
      return;
    }

    onClose?.();

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
    </>
  );
}

export default Flyout;
