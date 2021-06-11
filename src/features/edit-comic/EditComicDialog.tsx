import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import { EntityId } from '@reduxjs/toolkit';
import React from 'react';

import EditComicForm from './EditComicForm';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%"
    },
    cancelButton: {
      position: "absolute",
      top: theme.spacing(1),
      right: theme.spacing(1)
    }
  })
);

interface EditComicDialogProps {
  title: string;
  buttonText: string;
  buttonIcon: React.ReactNode;
  comicId?: EntityId;
}

export function EditComicDialog({ title, buttonText, buttonIcon, comicId }: EditComicDialogProps) {
  const classes = useStyles();
  const [isOpen, setOpen] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button startIcon={buttonIcon} onClick={() => setOpen(true)}>
        {buttonText}
      </Button>

      <Dialog
        open={isOpen}
        onClose={handleClose}
        disableBackdropClick
        disableEscapeKeyDown
        keepMounted={false}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{title}</DialogTitle>

        <IconButton onClick={handleClose} className={classes.cancelButton}>
          <CloseIcon fontSize="default" />
        </IconButton>

        <EditComicForm comicId={comicId} />
      </Dialog>
    </>
  );
}

export default EditComicDialog;
