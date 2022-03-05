import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import { EntityId } from '@reduxjs/toolkit';
import React from 'react';

import EditComicForm from './EditComicForm';

interface EditComicDialogProps {
  title: string;
  buttonText: string;
  buttonIcon: React.ReactNode;
  comicId?: EntityId;
}

export function EditComicDialog({ title, buttonText, buttonIcon, comicId }: EditComicDialogProps) {
  const [open, setOpen] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button startIcon={buttonIcon} onClick={() => setOpen(true)}>
        {buttonText}
      </Button>

      <Dialog
        open={open}
        onClose={(_event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose();
          }
        }}
        disableEscapeKeyDown
        keepMounted={false}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{title}</DialogTitle>

        <IconButton
          onClick={handleClose}
          sx={{
            position: "absolute",
            top: theme => theme.spacing(1),
            right: theme => theme.spacing(1)
          }}
        >
          <CloseIcon sx={{ fontSize: 32 }} />
        </IconButton>

        <EditComicForm comicId={comicId} />
      </Dialog>
    </>
  );
}

export default EditComicDialog;
