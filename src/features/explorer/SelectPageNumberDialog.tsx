import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Slider from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  editPageNumberCanceled,
  pageNumberUpdated,
  selectNavigation,
  selectSelectedPage
} from './explorerSlice';

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
      sx={{ userSelect: 'none' }}
      onClose={handleClose}
    >
      <DialogTitle>
        Edit order of page {(selectedPage?.number ?? 0) + 1}
      </DialogTitle>

      <DialogContent
        sx={{
          display: 'grid',
          rowGap: 2,
          minWidth: theme => theme.breakpoints.values.sm,
          px: 3,
          py: 1
        }}
      >
        <Slider
          components={{ ValueLabel: ValueLabelComponent }}
          value={pageNumber}
          onChange={(event, newValue) => {
            if (typeof newValue === 'number') {
              setPageNumber(newValue);
            }
          }}
          min={0}
          max={pageTotal - 1}
          valueLabelDisplay="auto"
        />
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
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
