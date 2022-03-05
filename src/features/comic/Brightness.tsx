import WbIncandescentIcon from '@mui/icons-material/WbIncandescent';
import Slider from '@mui/material/Slider';
import React from 'react';

import Flyout from '../flyout/Flyout';

const marks = [25, 50, 75, 100, 125].map(value => ({
  value,
  label: `${value}%`
}));

interface BrightnessProps {
  onChange: (brightness: number) => void;
  onClose?: () => void;
  value: number;
}

export function Brightness({ value, onChange, onClose }: BrightnessProps) {
  // TODO: Fix white space padding issue
  const getText = (value: number) => `${value.toFixed(0)}%`.padStart(4);

  return (
    <Flyout
      buttonProps={{
        startIcon: <WbIncandescentIcon />,
        children: getText(value),
        sx: { minWidth: 88 }
      }}
      onClose={onClose}
      paperProps={{
        sx: {
          height: 240,
          width: 80,
          px: 2,
          py: 3
        }
      }}
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
        getAriaValueText={getText}
        valueLabelDisplay="auto"
      />
    </Flyout>
  );
}

export default Brightness;
