import { clamp } from '@popmotion/popcorn';
import { EntityId } from '@reduxjs/toolkit';
import {
  animate,
  DragControls,
  motion,
  Spring,
  useMotionValue
} from 'framer-motion';
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

const spring: Spring = {
  type: 'spring',
  damping: 50,
  stiffness: 300,
  mass: 1.25
};

// Controls the amount of speed necessary when dragging to
// flip to the next/previous page
const flipThreshold = 1800;

// Distance factor for panning with scroll wheel and arrow keys
const panDistanceFactor = 0.25;

interface FlipViewItemProps {
  pageId?: EntityId;
  dragControls: DragControls;
  parentSize: Size;
  direction: number;
  objectFit: ObjectFit;
  objectPosition: ObjectPosition;
  brightness: number;
  zoom: number;
  onFlip: (direction: 1 | -1) => void;
}

function FlipViewItem({
  pageId,
  dragControls,
  parentSize,
  direction,
  objectFit,
  objectPosition,
  brightness,
  zoom,
  onFlip
}: FlipViewItemProps) {
  const image = useSelector(selectImage(pageId));

  const x = useMotionValue<number>(0);
  const y = useMotionValue<number>(0);

  const size = React.useMemo(() => {
    if (image === undefined) {
      return { width: 0, height: 0 };
    }

    const size = { width: image.width, height: image.height };
    const { width, height } = fitObjectSize(objectFit, parentSize, size);
    return { width: width * zoom, height: height * zoom };
  }, [image, objectFit, parentSize, zoom]);

  const position = React.useMemo(() => (
    fitObjectPosition(objectPosition, parentSize, size)
  ), [objectPosition, parentSize, size]);

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
  }, [dragConstraints, x, y]);

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragListener={false}
      dragConstraints={dragConstraints}
      dragTransition={{
        power: 0.2,
        timeConstant: 120
      }}
      onDragEnd={(_event, { velocity }) => {
        if (velocity.x <= -flipThreshold) {
          onFlip(1);
        } else if (velocity.x >= flipThreshold) {
          onFlip(-1);
        }
      }}
      onKeyDown={event => {
        if (parentSize === null || dragConstraints === undefined) {
          return;
        }

        const { left, right, top, bottom } = dragConstraints;

        switch (event.key) {
          case 'ArrowLeft': {
            event.stopPropagation();
            const delta = parentSize.width * panDistanceFactor;
            animate(x, clamp(left, right, x.get() + delta), spring);
            break;
          }
          case 'ArrowRight': {
            event.stopPropagation();
            const delta = parentSize.width * panDistanceFactor;
            animate(x, clamp(left, right, x.get() - delta), spring);
            break;
          }
          case 'ArrowDown': {
            event.stopPropagation();
            const delta = parentSize.height * panDistanceFactor;
            animate(y, clamp(top, bottom, y.get() - delta), spring);
            break;
          }
          case 'ArrowUp': {
            event.stopPropagation();
            const delta = parentSize.height * panDistanceFactor;
            animate(y, clamp(top, bottom, y.get() + delta), spring);
            break;
          }
          default:
            break;
        }
      }}
      onWheel={event => {  // Mouse wheel scroll
        if (!event.ctrlKey) {
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
      tabIndex={0}
      style={{ x, y }}
    >
      {image !== undefined && (
        <FlipViewImage
          src={image.url}
          position={position}
          size={size}
          brightness={brightness}
          onDoubleClick={resetDrag}
        />
      )}
    </motion.div>
  );
}

export default FlipViewItem;
