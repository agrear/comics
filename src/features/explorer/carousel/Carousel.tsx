import ClickAwayListener from '@mui/material/ClickAwayListener';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';
import { clamp, snap } from '@popmotion/popcorn';
import { animate, motion, useMotionValue, Variants } from 'framer-motion';
import React from 'react';

import CarouselItem from './CarouselItem';
import { WebImage } from '../../comic/imageSlice';

function findLargestImageIndex(images: WebImage[]) {
  return images.reduce(({ size, index }, { width, height }, i) => {
    const imageSize = width * height;
    return imageSize > size ? { size: imageSize, index: i } : { size, index };
  }, { size: -Infinity, index: -1 }).index;
}

const variants: Variants = {
  initial: {},
  show: {}
};

interface ImagesProps {
  images: WebImage[];
  selectedIndex: number;
  itemWidth: number;
  itemHeight: number;
  spacing: number;
  onSelect: (image: WebImage) => void;
  onSelectedIndexChange: (index: number) => void;
}

function Images({
  images,
  selectedIndex,
  itemWidth,
  itemHeight,
  spacing,
  onSelect,
  onSelectedIndexChange
}: ImagesProps) {
  const theme = useTheme();

  const itemDistance = itemWidth + parseInt(theme.spacing(spacing));
  const dragDistance = (images.length - 1) * itemDistance;
  const snapTo = snap(itemDistance);

  const x = useMotionValue<number>(selectedIndex * -itemDistance);

  const handleItemTap = (index: number) => {
    // Animate to tapped item
    const xStart = x.get();
    const xEnd = index * -itemDistance;
    animate(x, xEnd, {
      type: 'tween',
      ease: 'easeInOut',
      duration: clamp(0, 1, Math.abs(xEnd - xStart) / itemDistance) * 0.5
    });

    onSelectedIndexChange(index);
  };

  // Update index on drag
  React.useEffect(() => {
    function updateView(value: number) {
      onSelectedIndexChange(
        Math.round(clamp(-dragDistance, 0, value) / -itemDistance)
      );
    }

    return x.onChange(updateView);
  }, [dragDistance, itemDistance, onSelectedIndexChange, x]);

  return (
    <motion.ul
      initial="initial"
      animate="show"
      variants={variants}
      drag="x"
      dragConstraints={{ left: -dragDistance, right: 0 }}
      dragTransition={{
        timeConstant: 80,
        power: 0.2,
        modifyTarget: snapTo
      }}
      style={{
        x,
        display: 'grid',
        gridAutoFlow: `column`,
        gridColumnGap: theme.spacing(spacing),
        padding: 0
      }}
    >
      {images.map((image, i) => (
        <CarouselItem
          key={image.src}
          image={image}
          width={itemWidth}
          height={itemHeight}
          offset={selectedIndex - i}
          selected={image.src === images[selectedIndex]?.src}
          onSelect={onSelect}
          onTap={() => handleItemTap(i)}
        />
      ))}
    </motion.ul>
  );
}

interface CarouselProps {
  images: WebImage[];
  selectedIndex?: number;
  itemWidth: number;
  itemHeight: number;
  spacing?: number;
  onImageSelected: (image?: WebImage) => void;
}

export function Carousel({
  images,
  selectedIndex = -1,
  itemWidth,
  itemHeight,
  spacing = 4,
  onImageSelected
}: CarouselProps) {
  const [itemIndex, setItemIndex] = React.useState(
    selectedIndex !== -1 ? selectedIndex : findLargestImageIndex(images)
  );

  const [tooltip, setTooltip] = React.useState('');

  return (
    <ClickAwayListener
      mouseEvent="onMouseDown"
      touchEvent="onTouchStart"
      onClickAway={() => onImageSelected(images[itemIndex])}
    >
      <Tooltip
        title={images.length > 0 ? tooltip : 'No images available'}
        disableFocusListener
        disableHoverListener
        disableTouchListener
        open={true}
        placement="top"
        sx={{
          '& .MuiTooltip-tooltip': {
            maxWidth: theme => theme.breakpoints.values.md
          }
        }}
      >
        <motion.div
          style={{
            display: 'flex',
            position: 'absolute',
            top: 0,
            width: itemWidth,
            zIndex: 1
          }}
        >
          <Images
            images={images}
            selectedIndex={itemIndex}
            itemWidth={itemWidth}
            itemHeight={itemHeight}
            spacing={spacing}
            onSelect={image => setTooltip(image.src)}
            onSelectedIndexChange={setItemIndex}
          />
        </motion.div>
      </Tooltip>
    </ClickAwayListener>
  );
}

export default Carousel;
