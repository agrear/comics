import CloseIcon from '@mui/icons-material/Close';
import SettingsOverscanIcon from '@mui/icons-material/SettingsOverscan';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import React from 'react';

import LayoutForm from './LayoutForm';
import { Comic } from '../comicSlice';

interface LayoutDialogProps {
  comic: Comic;
}

export function LayoutDialog({ comic }: LayoutDialogProps) {
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
        sx={{ userSelect: "none" }}
      >
        <DialogTitle>Page Layout</DialogTitle>

        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            top: 1,
            right: 1
          }}
        >
          <CloseIcon sx={{ fontSize: 'medium' }} />
        </IconButton>

        <LayoutForm comicId={comic.id} layout={comic.layout} onSubmit={handleClose} />
      </Dialog>
    </>
  );
}

export default LayoutDialog;
