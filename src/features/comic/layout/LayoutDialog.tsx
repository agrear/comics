import SettingsOverscanIcon from '@mui/icons-material/SettingsOverscan';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import React from 'react';
import { useDispatch } from 'react-redux';

import LayoutPositionPicker from './LayoutPositionPicker';
import { Comic, comicLayoutUpdated } from '../comicSlice';
import { Layout, ObjectFit } from 'utils';

interface LayoutDialogProps {
  comic: Comic;
}

export function LayoutDialog({ comic }: LayoutDialogProps) {
  const dispatch = useDispatch();

  const [open, setOpen] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleLayoutChange = (layout: Partial<Layout>) => {
    dispatch(comicLayoutUpdated({
      comicId: comic.id,
      layout: {
        ...comic.layout,
        ...layout
      }
    }));
  };

  return (
    <>
      <Button
        startIcon={<SettingsOverscanIcon />}
        onClick={() => setOpen(true)}
      >
        Layout
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        sx={{ userSelect: 'none' }}
      >
        <DialogTitle>Page Layout</DialogTitle>

        <DialogContent
          sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
        >
          <Box sx={{ display: 'flex', my: 3, py: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Fit</FormLabel>
                <RadioGroup
                  name="fit"
                  value={comic.layout.fit}
                  onChange={(_event, value) => handleLayoutChange({
                    fit: value as ObjectFit
                  })}
                >
                  <FormControlLabel value="none" control={<Radio />} label="None" />
                  <FormControlLabel value="contain" control={<Radio />} label="Contain" />
                  <FormControlLabel value="cover" control={<Radio />} label="Cover" />
                  <FormControlLabel value="fill" control={<Radio />} label="Fill" />
                  <FormControlLabel value="scale-down" control={<Radio />} label="Scale down" />
                </RadioGroup>
              </FormControl>
            </Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexGrow: 1
              }}
            >
              <LayoutPositionPicker
                fit={comic.layout.fit}
                position={comic.layout.position}
                onChange={position => handleLayoutChange({ position })}
              />
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default LayoutDialog;
