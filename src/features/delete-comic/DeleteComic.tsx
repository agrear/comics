import Button from '@material-ui/core/Button';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import { createStyles, fade, makeStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import React from 'react';
import { useDispatch } from 'react-redux';

import { comicDeleted } from '../comic/comicSlice';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    deleteButton: {
      "&:hover": {
        backgroundColor: fade(theme.palette.error.main, 0.5)
      }
    },
    menu: {
      display: "flex",
      flexDirection: "column",
      padding: theme.spacing(2),
      userSelect: "none"
    },
    confirmButton: {
      alignSelf: "flex-end"
    }
  })
);

interface DeleteComicProps {
  comicId: number | string;
}

export function DeleteComic({ comicId }: DeleteComicProps) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLButtonElement>(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: React.MouseEvent<EventTarget>) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return;
    }

    setOpen(false);
  };

  const handleDelete = (event: React.MouseEvent<EventTarget>) => {
    dispatch(comicDeleted({ id: comicId }));
    handleClose(event);
  };

  return (
    <>
      <Button
        ref={anchorRef}
        startIcon={<DeleteForeverIcon />}
        onClick={handleToggle}
        className={classes.deleteButton}
      >
        Delete
      </Button>

      <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{ transformOrigin: 'right bottom' }}
          >
            <Paper style={{ margin: 0 }}>
              <ClickAwayListener onClickAway={handleClose}>
                <div className={classes.menu}>
                  <Typography variant="body2" paragraph>
                    This comic and all its pages will be permanently deleted.
                  </Typography>
                  <Button
                    color="primary"
                    variant="contained"
                    onClick={handleDelete}
                    className={classes.confirmButton}
                  >
                    Delete
                  </Button>
                </div>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
}

export default DeleteComic;
