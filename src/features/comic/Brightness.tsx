import Slider from '@material-ui/core/Slider';
import { darken, makeStyles, Theme } from '@material-ui/core/styles';
import WbIncandescentIcon from '@material-ui/icons/WbIncandescent';
import React from 'react';

import Flyout from '../flyout/Flyout';

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    minWidth: 88
  },
  brightness: {
    height: 200,
    width: 80,
    padding: theme.spacing(2.5, 0.5),
    background: darken(theme.palette.background.paper, 0.15)
  }
}));

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
  const classes = useStyles();

  // TODO: Fix white space padding issue
  const getText = (value: number) => `${value.toFixed(0)}%`.padStart(4);

  return (
    <Flyout
      buttonProps={{
        startIcon: <WbIncandescentIcon />,
        children: getText(value),
        className: classes.button
      }}
      onClose={onClose}
    >
      <div className={classes.brightness}>
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
        />
      </div>
    </Flyout>
  );
}

export default Brightness;
