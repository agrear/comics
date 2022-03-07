import Slider from '@mui/material/Slider';
import React from 'react';

import Flyout from '../flyout/Flyout';

const marks = [25, 50, 75, 100, 125].map(value => ({
  value,
  label: `${value}%`
}));

interface BrightnessProps {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onChange: (brightness: number) => void;
  onClose?: () => void;
  value: number;
  displayValue: (value: number) => string;
}

export function Brightness({
  open,
  anchorEl,
  value,
  displayValue,
  onChange,
  onClose
}: BrightnessProps) {
  return (
    <Flyout
      open={open}
      anchorEl={anchorEl}
      paperProps={{ sx: { height: 240, width: 80, px: 2, py: 3 } }}
      onClose={onClose}
    >
      <Slider
        orientation="vertical"
        defaultValue={100}
        value={value}
        step={5}
        marks={marks}
        min={25}
        max={125}
        onChange={(e, v) => onChange(v as number)}
        getAriaValueText={displayValue}
        valueLabelDisplay="auto"
      />
    </Flyout>
  );
}

export default Brightness;
