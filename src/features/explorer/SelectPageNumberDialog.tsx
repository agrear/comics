import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slider from '@material-ui/core/Slider';
import Tooltip from '@material-ui/core/Tooltip';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  editPageNumberCanceled,
  pageNumberUpdated,
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
      minWidth: theme.breakpoints.values.sm,
      padding: theme.spacing(1, 3)
    },
    actions: {
      padding: theme.spacing(3)
    }
  })
);

interface Props {
  children: React.ReactElement;
  open: boolean;
  value: number;
}

function ValueLabelComponent({ children, open, value }: Props) {
  return (
    <Tooltip open={open} enterTouchDelay={0} placement="top" title={value + 1}>
      {children}
    </Tooltip>
  );
}

interface SelectPageNumberDialogProps {
  pageTotal: number;
}

export function SelectPageNumberDialog({
  pageTotal
}: SelectPageNumberDialogProps) {
  const classes = useStyles();
  const dispatch = useDispatch();

  const navigation = useSelector(selectNavigation);

  const selectedPage = useSelector(selectSelectedPage);
  const [pageNumber, setPageNumber] = React.useState<number>(-1);

  const handleClose = () => {
    dispatch(editPageNumberCanceled());
  };

  React.useEffect(() => {
    if (selectedPage !== null && selectedPage !== undefined) {
      setPageNumber(selectedPage.number);
    }
  }, [selectedPage]);

  return (
    <Dialog
      open={navigation === 'editPageNumber'}
      maxWidth="lg"
      className={classes.dialog}
      onClose={handleClose}
    >
      <DialogTitle>Edit page number</DialogTitle>

      <DialogContent className={classes.content}>
        <Slider
          ValueLabelComponent={ValueLabelComponent}
          value={pageNumber}
          onChange={(event, newValue) => {
            if (typeof newValue === 'number') {
              setPageNumber(newValue);
            }
          }}
          min={0}
          max={pageTotal - 1}
        />
      </DialogContent>

      <DialogActions className={classes.actions}>
        <Button onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={selectedPage?.number === pageNumber}
          onClick={() => {
            if (selectedPage !== null && selectedPage !== undefined) {
              dispatch(pageNumberUpdated({ page: selectedPage, pageNumber }));
            }
          }}
        >
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SelectPageNumberDialog;
