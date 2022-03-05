import { clamp } from '@popmotion/popcorn';
import { motion, Variants } from 'framer-motion';
import React from 'react';

import { WebImage } from '../../comic/imageSlice';

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
  React.useEffect(() => {
    if (selected && image !== undefined) {
      onSelect(image);
    }
  }, [image, onSelect, selected])

  return (
    <motion.li
      variants={variants}
      custom={offset}
      style={{
        width,
        height,
        listStyle: 'none'
      }}
    >
      <motion.img
        src={image?.url}
        draggable={false}
        initial={{ cursor: "default" }}
        whileHover={{ cursor: "pointer" }}
        onTap={onTap}
        style={{
          width,
          height,
          objectFit: 'cover'
        }}
      />
    </motion.li>
  );
}

export default CarouselItem;
