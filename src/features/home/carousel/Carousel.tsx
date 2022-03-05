import { clamp, snap } from '@popmotion/popcorn';
import { EntityId } from '@reduxjs/toolkit';
import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform
} from 'framer-motion';
import React from 'react';

import Cover from './Cover';
import Image from './Image';

const itemWidth = 400;
const itemHeight = 400;
const itemSpacing = 100;
const itemDistance = itemWidth + itemSpacing;

const snapTo = snap(itemDistance);

const contentOffset = itemDistance / 2;

interface CarouselProps<T> {
  items: T[];
  selectedItem?: T;
  onItemTap: (item: T) => void;
  onSelectedItemChange: (item?: T) => void;
  selectBadgeContent?: (item: T) => React.ReactNode;
  selectId: (item: T) => EntityId;
  selectImage: (item: T) => Image;
  entering: boolean;
}

function Carousel<T>({
  items,
  selectedItem,
  onSelectedItemChange,
  onItemTap,
  selectBadgeContent,
  selectId,
  selectImage,
  entering
}: CarouselProps<T>) {
  const controls = useAnimation();

  const selectedIndex = React.useMemo(() => {
    if (selectedItem === undefined) {
      return -1;
    }

    return items.findIndex(item => selectId(item) === selectId(selectedItem));
  }, [items, selectedItem, selectId]);

  const contentWidth = React.useMemo(() => (
    (items.length - 1) * itemDistance
  ), [items.length]);

  const offset = React.useMemo(() => (
    `calc(50% - ${contentWidth / 2}px - ${contentOffset}px)`
  ), [contentWidth]);

  const x = useMotionValue<number>(
    clamp(-contentWidth, 0, selectedIndex * -itemDistance)
  );

  const perspectiveOrigin = useTransform<number, string>(x, value => (
    `calc(50% - ${contentWidth / 2}px - ${value}px)`
  ));

  const handleCoverTap = (item: T, index: number) => {
    const xStart = x.get();
    const xEnd = snapTo(index * -itemDistance)
    controls.start({  // Animate to clicked item
      x: xEnd,
      transition: {
        type: "tween",
        ease: "easeInOut",
        duration: clamp(0, 1, Math.abs(xEnd - xStart) / itemDistance) * 0.5
      }
    }).then(() => onItemTap(item));
  };

  React.useEffect(() => {
    const index = Math.round(x.get() / -itemDistance);
    if (index !== selectedIndex) {
      x.set(clamp(-contentWidth, 0, selectedIndex * -itemDistance));
    }
  }, [contentWidth, selectedIndex, x]);

  React.useEffect(() => () => {
    const index = Math.round(x.get() / -itemDistance);
    onSelectedItemChange(items[index]);
  }, [items, onSelectedItemChange, x]);

  return (
    <motion.div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      }}
    >
      <motion.ul
        animate={controls}
        drag="x"
        dragConstraints={{
          left: -contentWidth,
          right: 0
        }}
        dragTransition={{
          //bounceDamping: 50,
          //bounceStiffness: 250,
          power: 0.25,
          timeConstant: 160,
          modifyTarget: snapTo
        }}
        style={{
          perspectiveOrigin,
          width: `calc(100% + ${contentWidth}px)`,
          display: 'flex',
          height: '100%',
          alignItems: 'center',
          listStyle: 'none',
          margin: 0,
          padding: 0,
          perspective: 800,
          x
        }}
      >
        {items.map((item, i) => (
          <Cover
            key={selectId(item)}
            badgeContent={selectBadgeContent?.(item)}
            cover={selectImage(item)}
            index={i}
            selectedIndex={selectedIndex}
            offset={i === 0 ? offset : '0px'}
            width={itemWidth}
            height={itemHeight}
            spacing={itemSpacing}
            x={x}
            onTap={() => handleCoverTap(item, i)}
            entering={entering}
          />
        ))}
      </motion.ul>
    </motion.div>
  );
};

export default Carousel;
