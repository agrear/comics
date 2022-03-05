import { clamp } from '@popmotion/popcorn';
import { EntityId } from '@reduxjs/toolkit';
import { animate, motion, Spring, useMotionValue, Variants } from "framer-motion";
import React from 'react';
import { useSelector } from 'react-redux';

import FlipViewImage from './FlipViewImage';
import { selectImage } from '../imageSlice';
import {
  fitObjectPosition,
  fitObjectSize,
  getAlignment,
  ObjectFit,
  ObjectPosition,
  Size
} from 'utils';

const variants: Variants = {
  initial: (direction: number) => ({
    opacity: direction === 0 ? 1 : 0,
    rotateY: direction === 0 ? -90 : 0,
    scale: direction === 0 ? 0.5 : 1,
    x: direction === 0 ? 0 : (direction > 0 ? 2000 : -2000)
  }),
  enter: (direction: number) => ({
    opacity: 1,
    rotateY: 0,
    scale: 1,
    x: 0,
    transition: {
      rotateY: {
        type: 'tween',
        ease: 'easeOut',
        duration: 0.5
      },
      x: {
        type: "tween",
        ease: "easeOut",
        duration: direction === 0 ? 0.5 : 0.3
      }
    }
  }),
  exit: (direction: number) => ({
    opacity: 0,
    rotateY: direction === 0 ? -90 : 0,
    scale: direction === 0 ? 0.5 : 1,
    x: direction === 0 ? 0 : (direction < 0 ? 2000 : -2000),
    transition: {
      opacity: {
        duration: direction === 0 ? 0.4 : 0.15
      },
      rotateY: {
        type: 'tween',
        ease: 'easeIn',
        duration: 0.4
      },
      scale: {
        type: 'tween',
        ease: 'easeIn',
        duration: 0.4
      },
      x: {
        type: "tween",
        ease: "easeIn",
        duration: 0.15
      }
    }
  })
};

const spring: Spring = {
  type: "spring",
  damping: 50,
  stiffness: 300,
  mass: 1.25
};

const dragThreshold = 280;

interface FlipViewItemProps {
  pageId?: EntityId;
  parentSize: Size;
  direction: number;
  objectFit: ObjectFit;
  objectPosition: ObjectPosition;
  brightness: number;
  zoom: number;
  onPageFlip: (direction: 1 | -1) => void;
}

function FlipViewItem({
  pageId,
  parentSize,
  direction,
  objectFit,
  objectPosition,
  brightness,
  zoom,
  onPageFlip
}: FlipViewItemProps) {
  const image = useSelector(selectImage(pageId));
  const [entered, setEntered] = React.useState(false);

  const x = useMotionValue<number>(0);
  const y = useMotionValue<number>(0);

  const size = (() => {
    const size = { width: image?.width || 0, height: image?.height || 0 };
    const { width, height } = fitObjectSize(objectFit, parentSize, size);
    return { width: width * zoom, height: height * zoom };
  })();

  const position = fitObjectPosition(objectPosition, parentSize, size);

  const dragConstraints = React.useMemo(() => {
    const [horizontal, vertical] = getAlignment(objectPosition);
    const { width, height } = size;
    let left = 0, right = 0, top = 0, bottom = 0;

    switch (horizontal) {
      case 'left':
        left = Math.min(0, parentSize.width - width);
        break;
      case 'center':
        left = Math.min(0, (parentSize.width - width) * 0.5);
        right = Math.max(0, (width - parentSize.width) * 0.5);
        break;
      case 'right':
        right = Math.max(0, width - parentSize.width);
        break;
    }

    switch (vertical) {
      case 'top':
        top = Math.min(0, parentSize.height - height);
        break;
      case 'center':
        top = Math.min(0, parentSize.height - height) * 0.5;
        bottom = Math.max(0, height - parentSize.height) * 0.5;
        break;
      case 'bottom':
        bottom = Math.max(0, height - parentSize.height);
        break;
    }

    return { left, right, top, bottom };
  }, [objectPosition, parentSize, size]);

  const resetDrag = React.useCallback(() => {
    animate(x, 0, spring);
    animate(y, 0, spring);
  }, [x, y]);

  React.useEffect(() => {
    if (entered) {  // Animate position to fit inside new constraints
      const { left, right, top, bottom } = dragConstraints;

      if (x.get() < left) {
        animate(x, left, spring);
      } else if (x.get() > right) {
        animate(x, right, spring);
      }

      if (y.get() < top) {
        animate(y, top, spring);
      } else if (y.get() > bottom) {
        animate(y, bottom, spring);
      }
    }
  }, [dragConstraints, entered, x, y]);

  return (
    <motion.li
      custom={direction}
      variants={variants}
      initial="initial"
      animate="enter"
      exit="exit"
      onAnimationComplete={() => setEntered(true)}
      drag={true}
      dragConstraints={dragConstraints}
      dragTransition={{
        power: 0.2,
        timeConstant: 120
      }}
      onDragEnd={(e, { offset }) => {
        if (dragConstraints.right + offset.x <= -dragThreshold) {
          onPageFlip(1);
        } else if (dragConstraints.left + offset.x >= dragThreshold) {
          onPageFlip(-1);
        }
      }}
      onWheel={event => {  // Mouse wheel scroll
        if (!event.getModifierState('Control')) {
          const { left, right, top, bottom } = dragConstraints;
          const offscreen = { width: right - left, height: bottom - top };

          // Scroll axis with larger offscreen portion
          if (offscreen.width > offscreen.height) {  // Scroll horizontally
            const delta = Math.sign(event.deltaY) * parentSize.width * 0.2;
            animate(x, clamp(left, right, x.get() - delta), spring);
          } else {  // Scroll vertically
            const delta = Math.sign(event.deltaY) * parentSize.height * 0.2;
            animate(y, clamp(top, bottom, y.get() - delta), spring);
          }
        }
      }}
      style={{
        x,
        y,
        position: "absolute",
        width: "100%",
        height: "100%"
      }}
    >
      <FlipViewImage
        src={image?.url}
        position={position}
        size={size}
        objectFit={objectFit}
        objectPosition={objectPosition}
        brightness={brightness}
        zoom={zoom}
        animateLayout={entered}
        onDoubleClick={resetDrag}
      />
    </motion.li>
  );
}

export default FlipViewItem;
