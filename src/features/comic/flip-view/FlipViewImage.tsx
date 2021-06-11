import { makeStyles, Theme } from '@material-ui/core/styles';
import { animate, motion, Spring, useMotionValue } from 'framer-motion';
import React from 'react';

import { ObjectFit, ObjectPosition, Point, Size } from 'utils';

const useStyles = makeStyles((theme: Theme) => ({
  image: ({ brightness }: { brightness: number }) => ({
    filter: `brightness(${brightness})`
  })
}));

const spring: Spring = {
  type: 'spring',
   duration: 0.5,
   bounce: 0.4
};

interface FlipViewImageProps {
  src?: string;
  position: Point;
  size: Size;
  objectFit: ObjectFit;
  objectPosition: ObjectPosition;
  brightness: number;
  zoom: number;
  animateLayout: boolean;
  onDoubleClick: () => void;
}

function FlipViewImage({
  src,
  position,
  size,
  objectFit,
  objectPosition,
  zoom,
  brightness,
  animateLayout,
  onDoubleClick
}: FlipViewImageProps) {
  const classes = useStyles({ brightness });

  const x = useMotionValue<number>(0);
  const y = useMotionValue<number>(0);
  const width = useMotionValue<number>(size.width);
  const height = useMotionValue<number>(size.height);

  React.useEffect(() => {
    if (animateLayout) {
      animate(x, position.x, spring);
      animate(y, position.y, spring);
    } else {
      x.set(position.x);
      y.set(position.y);
    }
  }, [animateLayout, objectPosition, position, x, y]);

  React.useEffect(() => {
    if (animateLayout) {
      animate(width, size.width, spring);
      animate(height, size.height, spring);
    } else {
      width.set(size.width);
      height.set(size.height);
    }
  }, [animateLayout, objectFit, height, size, width, zoom]);

  return (
    <motion.img
      src={src}
      alt=""
      draggable={false}
      style={{ x, y, width, height }}
      onDoubleClick={onDoubleClick}
      className={classes.image}
    />
  );
}

export default FlipViewImage;
