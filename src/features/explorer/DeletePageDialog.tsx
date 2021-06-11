import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  deletePageCanceled,
  pageDeleted,
  selectNavigation,
  selectSelectedPage
} from './explorerSlice';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      userSelect: 'none'
    },
    content: {
      display: 'grid',
      rowGap: theme.spacing(2),
      padding: theme.spacing(1, 3)
    },
    actions: {
      padding: theme.spacing(3)
    }
  })
);

export function DeletePageDialog() {
  const classes = useStyles();
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
      className={classes.dialog}
      onClose={handleClose}
    >
      <DialogTitle>Delete page</DialogTitle>

      <DialogContent className={classes.content}>
        <Typography>
          Are you sure you want to delete page {(selectedPage?.number ?? -1) + 1}?
        </Typography>
      </DialogContent>

      <DialogActions className={classes.actions}>
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
