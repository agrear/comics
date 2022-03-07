import Box from '@mui/material/Box';
import {
  AnimatePresence,
  motion,
  useDragControls,
  Variants
} from 'framer-motion';
import React from 'react';
import Measure from 'react-measure';

import FlipViewItem from './FlipViewItem';
import { Page } from '../comicSlice';
import { Layout } from 'utils';

type Direction = 1 | 0 | -1;

const variants: Variants = {
  initial: (direction: number) => ({
    opacity: direction === 0 ? 1 : 0,
    rotateY: direction === 0 ? -90 : 0,
    scale: direction === 0 ? 0.5 : 1,
    x: direction === 0 ? 0 : (direction > 0 ? '100%' : '-100%')
  }),
  enter: (direction: number) => ({
    opacity: 1,
    rotateY: 0,
    scale: 1,
    x: 0,
    transition: {
      opacity: {
        type: 'tween',
        ease: 'linear',
        duration: direction === 0 ? 0.5 : 0.3
      },
      rotateY: {
        type: 'tween',
        ease: 'easeOut',
        duration: direction === 0 ? 0.5 : 0.3
      },
      scale: {
        type: 'tween',
        ease: 'easeOut',
        duration: direction === 0 ? 0.5 : 0.3
      },
      x: {
        type: 'tween',
        ease: 'easeInOut',
        duration: direction === 0 ? 0.5 : 0.3
      }
    }
  }),
  exit: (direction: number) => ({
    opacity: 0,
    rotateY: direction === 0 ? -90 : 0,
    scale: direction === 0 ? 0.5 : 1,
    x: direction === 0 ? 0 : (direction < 0 ? '100%' : '-100%'),
    transition: {
      opacity: {
        type: 'tween',
        ease: 'linear',
        duration: direction === 0 ? 0.5 : 0.3
      },
      rotateY: {
        type: 'tween',
        ease: 'easeIn',
        duration: direction === 0 ? 0.5 : 0.3
      },
      scale: {
        type: 'tween',
        ease: 'easeIn',
        duration: direction === 0 ? 0.5 : 0.3
      },
      x: {
        type: 'tween',
        ease: 'easeInOut',
        duration: direction === 0 ? 0.5 : 0.3
      }
    }
  })
};

interface FlipViewProps {
  pages: Page[];
  selectedIndex: number;
  disabled: boolean;
  brightness: number;
  layout: Layout;
  exit: boolean;
  onExitComplete: () => void;
  onSelectedIndexChange: (index: number) => void;
  onZoomChange: (value: number) => void;
}

export function FlipView({
  pages,
  selectedIndex,
  disabled,
  brightness,
  layout,
  exit,
  onExitComplete,
  onSelectedIndexChange,
  onZoomChange
}: FlipViewProps) {
  const dragControls = useDragControls();

  const [previousIndex, setPreviousIndex] = React.useState(selectedIndex);

  const direction = Math.sign(selectedIndex - previousIndex) as Direction;

  const startDrag = (event: React.PointerEvent) => {
    dragControls.start(event);
  }

  React.useEffect(() => setPreviousIndex(selectedIndex), [selectedIndex]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey) {
        switch (event.key) {
          case '+':  // Zoom in
            onZoomChange(layout.zoom + 0.05);
            break;
          case '-':  // Zoom out
            onZoomChange(layout.zoom - 0.05);
            break;
          case '0':  // Reset zoom
            onZoomChange(1.0);
            break;
          default:
            break;
        }
      } else {
        switch (event.key) {
          case 'Home':
            onSelectedIndexChange(0);
            break;
          case 'End':
            onSelectedIndexChange(pages.length - 1);
            break;
          case 'PageDown':
            onSelectedIndexChange(selectedIndex - 1);
            break;
          case 'PageUp':
            onSelectedIndexChange(selectedIndex + 1);
            break;
          default:
            break;
        }
      }
    };

    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey) {
        onZoomChange(layout.zoom + event.deltaY * -0.0005);
      }
    };

    const cleanup = () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
    };

    if (!disabled) {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('wheel', handleWheel);
    } else {
      cleanup();
    }

    return cleanup;
  }, [
    disabled,
    layout.zoom,
    pages.length,
    onSelectedIndexChange,
    onZoomChange,
    selectedIndex
  ]);

  return (
    <Measure client>
      {({ measureRef, contentRect: { client } }) => (
        <Box
          component="ul"
          ref={measureRef}
          onPointerDown={startDrag}
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            margin: 0,
            padding: 0,
            perspective: 1000,
            listStyle: 'none',
            userSelect: 'none'
          }}
        >
          <AnimatePresence
            custom={exit ? 0 : direction}
            onExitComplete={() => {
              if (exit) {
                onExitComplete();
              }
            }}
          >
            {!exit && client?.width !== undefined && client?.height !== undefined && (
              <Box
                key={pages[selectedIndex]?.id}
                component={motion.li}
                custom={exit ? 0 : direction}
                variants={variants}
                initial="initial"
                animate="enter"
                exit="exit"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  overflow: 'hidden'
                }}
              >
                <FlipViewItem
                  pageId={pages[selectedIndex]?.id}
                  dragControls={dragControls}
                  direction={direction}
                  parentSize={{ width: client.width, height: client.height }}
                  objectFit={layout.fit}
                  objectPosition={layout.position}
                  brightness={brightness}
                  zoom={layout.zoom}
                  onFlip={direction => {
                    onSelectedIndexChange(selectedIndex + direction);
                  }}
                />
              </Box>
            )}
          </AnimatePresence>
        </Box>
      )}
    </Measure>
  );
}

export default FlipView;
