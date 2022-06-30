import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import React from 'react';
import Measure from 'react-measure';

import Explorer from './Explorer';
import Overlay from './Overlay';
import { Comic } from '../comic/comicSlice';

interface ExplorerDialogProps {
  open: boolean;
  comic: Comic;
  onClose: () => void;
}

export function ExplorerDialog({ open, comic, onClose }: ExplorerDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      keepMounted={false}
      PaperProps={{
        sx: {
          backgroundColor: theme => theme.palette.background.default,
          boxShadow: 'none'
        }
      }}
      sx={{ userSelect: 'none' }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          top: theme => theme.spacing(1),
          left: theme => theme.spacing(1),
          zIndex: 1
        }}
      >
        <ArrowBackIcon />
      </IconButton>

      <Measure client>
        {({ measureRef, contentRect: { client } }) => (
          <DialogContent
            ref={measureRef}
            sx={{
              position: 'relative',
              overflow: 'hidden',
              p: 0
            }}
          >
            <Explorer comic={comic} parentHeight={client?.height ?? 0} />

            <Overlay comic={comic} />
          </DialogContent>
        )}
      </Measure>
    </Dialog>
  );
}

export default ExplorerDialog;
