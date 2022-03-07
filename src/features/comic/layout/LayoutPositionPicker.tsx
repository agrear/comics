import ImageIcon from '@mui/icons-material/ImageSharp';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { motion, MotionStyle } from 'framer-motion';
import React from 'react';

import {
  fitObjectSize,
  getHorizontalAlignment,
  getVerticalAlignment,
  ObjectFit,
  ObjectPosition
} from 'utils';

type Point = { position: ObjectPosition, style: MotionStyle };
const pointOverlap = 8;
const positionPoints: Point[] = [
  { position: "left top", style: { top: -pointOverlap, left: -pointOverlap } },
  { position: "center top", style: { top: -pointOverlap, left: `calc(50% - ${pointOverlap}px)` } },
  { position: "right top", style: { top: -pointOverlap, right: -pointOverlap } },
  { position: "left center", style: { top: `calc(50% - ${pointOverlap}px)`, left: -pointOverlap } },
  { position: "center center", style: { top: `calc(50% - ${pointOverlap}px)`, left: `calc(50% - ${pointOverlap}px)` } },
  { position: "right center", style: { top: `calc(50% - ${pointOverlap}px)`, right: -pointOverlap } },
  { position: "left bottom", style: { bottom: -pointOverlap, left: -pointOverlap } },
  { position: "center bottom", style: { bottom: -pointOverlap, left: `calc(50% - ${pointOverlap}px)` } },
  { position: "right bottom", style: { bottom: -pointOverlap, right: -pointOverlap } }
];

interface LayoutPositionPickerProps {
  fit: ObjectFit;
  position: ObjectPosition;
  onChange: (position: ObjectPosition) => void;
}

function LayoutPositionPicker({
  fit,
  position,
  onChange
}: LayoutPositionPickerProps) {
  const theme = useTheme();

  const container = { width: 180, height: 140 };
  const image = { width: 80, height: 100 };
  const size = fitObjectSize(fit, container, image);

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        border: 2,
        borderColor: 'white',
        ...container,
        alignItems: getVerticalAlignment(position),
        justifyContent: getHorizontalAlignment(position)
      }}
    >
      <Box
        component={motion.div}
        layout
        sx={{
          ...size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 1,
          borderColor: 'white',
          opacity: 0.5,
          pointerEvents: 'none',
          zIndex: 'tooltip'
        }}
      >
        <ImageIcon />
      </Box>

      {positionPoints.map(({ position: pos, style }) => (
        <motion.div
          key={pos}
          style={{
            ...style,
            backgroundColor: pos === position ? (
              theme.palette.secondary.main
            ) : 'white',
            position: 'absolute',
            width: 16,
            height: 16,
            borderRadius: '50%',
            cursor: pos === position ? 'default' : 'pointer'
          }}
          whileHover={{ scale: 1.25 }}
          onClick={() => onChange(pos)}
        />
      ))}
    </Box>
  );
}

export default LayoutPositionPicker;
