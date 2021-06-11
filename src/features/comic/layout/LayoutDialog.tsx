import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import SettingsOverscanIcon from '@material-ui/icons/SettingsOverscan';
import React from 'react';

import LayoutForm from './LayoutForm';
import { Comic } from '../comicSlice';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      userSelect: "none"
    },
    cancelButton: {
      position: "absolute",
      top: theme.spacing(1),
      right: theme.spacing(1)
    }
  })
);

interface LayoutDialogProps {
  comic: Comic;
}

export function LayoutDialog({ comic }: LayoutDialogProps) {
  const classes = useStyles();
  const [isOpen, setOpen] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button startIcon={<SettingsOverscanIcon />} onClick={() => setOpen(true)}>
        Layout
      </Button>

      <Dialog
        open={isOpen}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        className={classes.dialog}
      >
        <DialogTitle>Page Layout</DialogTitle>

        <IconButton onClick={handleClose} className={classes.cancelButton}>
          <CloseIcon fontSize="default" />
        </IconButton>

        <LayoutForm comicId={comic.id} layout={comic.layout} onSubmit={handleClose} />
      </Dialog>
    </>
  );
}

export default LayoutDialog;
