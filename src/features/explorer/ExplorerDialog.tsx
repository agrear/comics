import CloseIcon from '@mui/icons-material/Close';
import ExploreIcon from '@mui/icons-material/Explore';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
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

interface ExplorerDialogProps {
  comic: Comic;
}

export function ExplorerDialog({ comic }: ExplorerDialogProps) {
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
        PaperProps={{
          sx: {
            backgroundColor: theme => theme.palette.background.default,
            boxShadow: 'none'
          }
        }}
        sx={{ userSelect: 'none' }}
      >
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            top: theme => theme.spacing(1),
            right: theme => theme.spacing(3),
            zIndex: 1
          }}
        >
          <CloseIcon />
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
    </>
  );
}

export default ExplorerDialog;
