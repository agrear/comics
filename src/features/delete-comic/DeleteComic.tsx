import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import React from 'react';
import { useDispatch } from 'react-redux';

import { comicDeleted } from '../comic/comicSlice';

interface DeleteComicProps {
  comicId: number | string;
}

export function DeleteComic({ comicId }: DeleteComicProps) {
  const dispatch = useDispatch();
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLButtonElement>(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (target: EventTarget | null) => {
    if (anchorRef.current?.contains(target as (HTMLElement | null))) {
      return;
    }

    setOpen(false);
  };

  const handleDelete = (target: EventTarget) => {
    dispatch(comicDeleted({ id: comicId }));
    handleClose(target);
  };

  return (
    <>
      <Button
        ref={anchorRef}
        startIcon={<DeleteForeverIcon />}
        onClick={handleToggle}
        sx={{
          '&:hover': {
            backgroundColor: theme => alpha(theme.palette.error.main, 0.5)
          }
        }}
      >
        Delete
      </Button>

      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        placement="top-end"
        popperOptions={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [-8, 8]
              }
            }
          ]
        }}
      >
        {({ TransitionProps }) => (
          <Grow
            {...TransitionProps}
            style={{ transformOrigin: 'right bottom' }}
          >
            <Paper sx={{ maxWidth: 240, m: 0 }}>
              <ClickAwayListener
                onClickAway={event => handleClose(event.target)}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    p: 2,
                    userSelect: 'none'
                  }}
                >
                  <Typography variant="body2" paragraph>
                    This comic and all its pages will be permanently deleted.
                  </Typography>
                  
                  <Button
                    color="primary"
                    variant="contained"
                    onClick={event => handleDelete(event.target)}
                    sx={{ alignSelf: 'flex-end' }}
                  >
                    Delete
                  </Button>
                </Box>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
}

export default DeleteComic;
