import Slider from '@material-ui/core/Slider';
import { darken, makeStyles, Theme } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import React from 'react';

import Flyout from '../flyout/Flyout';

const useStyles = makeStyles((theme: Theme) =>({
  button: {
    minWidth: 88
  },
  zoom: {
    height: 240,
    width: 80,
    padding: theme.spacing(2.5, 0.5),
    background: darken(theme.palette.background.paper, 0.15)
  }
}));

const marks = [50, 75, 100, 125, 150, 175, 200].map(value => ({
  value,
  label: `${value}%`
}));

interface ZoomProps {
  onChange: (zoom: number) => void;
  onClose?: () => void;
  value: number;
}

export function Zoom({ value, onChange, onClose }: ZoomProps) {
  const classes = useStyles();

  // TODO: Fix white space padding issue
  const getZoomText = (value: number) => `${value.toFixed(0)}%`.padStart(4);

  return (
    <Flyout
      buttonProps={{
        startIcon: <SearchIcon />,
        children: getZoomText(value),
        className: classes.button
      }}
      onClose={onClose}
    >
      <div className={classes.zoom}>
        <Slider
          orientation="vertical"
          defaultValue={100}
          value={value}
          step={5}
          marks={marks}
          min={50}
          max={200}
          onChange={(e, v) => onChange(v as number)}
          getAriaValueText={getZoomText}
        />
      </div>
    </Flyout>
  );
}

export default Zoom;
