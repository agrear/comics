import { animate, motion, Spring, useMotionValue } from 'framer-motion';
import React from 'react';

import { Point, Size } from 'utils';

const spring: Spring = {
  type: 'spring',
  duration: 0.5,
  bounce: 0.4
};

interface FlipViewImageProps {
  src?: string;
  position: Point;
  size: Size;
  brightness: number;
  onDoubleClick: () => void;
}

function FlipViewImage({
  src,
  position,
  size,
  brightness,
  onDoubleClick
}: FlipViewImageProps) {
  const x = useMotionValue<number>(position.x);
  const y = useMotionValue<number>(position.y);
  const width = useMotionValue<number>(size.width);
  const height = useMotionValue<number>(size.height);

  React.useEffect(() => {
    animate(x, position.x, spring);
    animate(y, position.y, spring);
  }, [position, x, y]);

  React.useEffect(() => {
    animate(width, size.width, spring);
    animate(height, size.height, spring);
  }, [height, size, width]);

  return (
    <motion.img
      src={src}
      alt=""
      draggable={false}
      style={{
        x,
        y,
        width,
        height,
        filter: `brightness(${brightness})`
      }}
      onDoubleClick={onDoubleClick}
    />
  );
}

export default FlipViewImage;
