import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import React from 'react';

import LayoutPositionPicker from './LayoutPositionPicker';
import { Layout, ObjectFit } from 'utils';

interface LayoutDialogProps {
  open: boolean;
  layout: Layout;
  onLayoutChange: (layout: Partial<Layout>) => void;
  onClose: () => void;
}

export function LayoutDialog({
  open,
  layout,
  onLayoutChange,
  onClose
}: LayoutDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
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
                value={layout.fit}
                onChange={(_event, value) => onLayoutChange({
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
              fit={layout.fit}
              position={layout.position}
              onChange={position => onLayoutChange({ position })}
            />
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default LayoutDialog;
