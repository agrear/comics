import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles, Theme } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import ExploreIcon from '@material-ui/icons/Explore';
import React from 'react';
import Measure from 'react-measure';
import { useDispatch, useSelector } from 'react-redux';

import {
  explorerClosed,
  explorerOpened,
  selectExplorerId
} from './explorerSlice';
import Explorer from './Explorer';
import Overlay from './Overlay';
import { Comic } from '../comic/comicSlice';

const useStyles = makeStyles((theme: Theme) => ({
  dialog: {
    userSelect: "none"
  },
  paper: {
    backgroundColor: theme.palette.background.default,
    boxShadow: 'none'
  },
  closeButton: {
    position: "absolute",
    top: theme.spacing(1),
    right: theme.spacing(3),
    zIndex: 1
  },
  content: {
    position: 'relative',
    overflow: "hidden",
    padding: 0
  }
}));

interface ExplorerDialogProps {
  comic: Comic;
}

export function ExplorerDialog({ comic }: ExplorerDialogProps) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const id = useSelector(selectExplorerId);

  const handleClose = () => {
    dispatch(explorerClosed({ comicId: comic.id }));
  };

  return (
    <>
      <Button
        startIcon={<ExploreIcon />}
        onClick={() => {
          dispatch(explorerOpened({
            comicId: comic.id,
            index: Math.max(0, comic.bookmark)
          }));
        }}
      >
        Explorer
      </Button>

      <Dialog
        open={id !== null}
        onClose={handleClose}
        fullScreen
        keepMounted={false}
        PaperProps={{ className: classes.paper }}
        className={classes.dialog}
      >
        <IconButton onClick={handleClose} className={classes.closeButton}>
          <CloseIcon />
        </IconButton>

        <Measure client>
          {({ measureRef, contentRect: { client } }) => (
            <DialogContent ref={measureRef} className={classes.content}>
              <Explorer comic={comic} parentHeight={client?.height ?? 0} />

              <Overlay comic={comic} />
            </DialogContent>
          )}
        </Measure>
      </Dialog>
    </>
  );
}

export default ExplorerDialog;
