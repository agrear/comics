import { makeStyles, Theme } from '@material-ui/core/styles';
import { clamp } from '@popmotion/popcorn';
import { motion, Variants } from 'framer-motion';
import React from 'react';

import { WebImage } from '../../comic/imageSlice';

interface StyleProps {
  width: number;
  height: number;
}

export const useStyles = makeStyles((theme: Theme) => ({
  item: ({ width, height }: StyleProps) => ({
    width,
    height,
    listStyle: 'none'
  }),
  image: ({ width, height }: StyleProps) => ({
    width,
    height,
    objectFit: 'cover'
  })
}));

const variants: Variants = {
  initial: (offset: number) => ({
    cursor: "default",
    opacity: 0,  //Number(offset === 0),
    x: clamp(-1, 1, offset) * 64
  }),
  show: (offset: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      type: "tween",
      ease: "easeOut",
      duration: 0.3,
      delay: Math.abs(offset) * 0.1
    }
  })
};

interface CarouselItemProps {
  image: WebImage;
  width: number;
  height: number;
  offset: number;
  selected: boolean;
  onSelect: (image: WebImage) => void;
  onTap: () => void;
}

function CarouselItem({
  image,
  width,
  height,
  offset,
  selected,
  onSelect,
  onTap
}: CarouselItemProps) {
  const classes = useStyles({ width, height });

  React.useEffect(() => {
    if (selected && image !== undefined) {
      onSelect(image);
    }
  }, [image, onSelect, selected])

  return (
    <motion.li
      variants={variants}
      custom={offset}
      className={classes.item}
    >
      <motion.img
        src={image?.url}
        width={width}
        height={height}
        draggable={false}
        initial={{ cursor: "default" }}
        className={classes.image}
        whileHover={{ cursor: "pointer" }}
        onTap={onTap}
      />
    </motion.li>
  );
}

export default CarouselItem;
