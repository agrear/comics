import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  deletePageCanceled,
  pageDeleted,
  selectNavigation,
  selectSelectedPage
} from './explorerSlice';

export function DeletePageDialog() {
  const dispatch = useDispatch();

  const navigation = useSelector(selectNavigation);
  const selectedPage = useSelector(selectSelectedPage);

  const handleClose = () => {
    dispatch(deletePageCanceled());
  };

  return (
    <Dialog
      open={navigation === 'deletePage'}
      maxWidth="sm"
      onClose={handleClose}
      sx={{ userSelect: 'none' }}
    >
      <DialogTitle>Delete page</DialogTitle>

      <DialogContent sx={{ display: 'grid', rowGap: 2, px: 3, py: 1 }}>
        <Typography>
          Are you sure you want to delete page {(selectedPage?.number ?? -1) + 1}?
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={selectedPage === null || selectedPage === undefined}
          onClick={() => {
            if (selectedPage !== null && selectedPage !== undefined) {
              dispatch(pageDeleted(selectedPage));
            }
          }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DeletePageDialog;
