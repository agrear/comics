import Badge from '@mui/material/Badge';
import { clamp, interpolate } from '@popmotion/popcorn';
import {
  motion,
  MotionValue,
  useAnimation,
  usePresence,
  useTransform
} from 'framer-motion';
import React from 'react';

import Image from './Image';
import { fitObjectSize } from 'utils';

const interpolateAngle = interpolate([-1, 0, 1], [10, 0, -10]);
const interpolateScale = interpolate([-1, 0, 1], [0.8, 1.2, 0.8]);

interface CoverProps {
  cover: Image;
  badgeContent?: React.ReactNode;
  index: number;
  selectedIndex?: number;
  offset: number | string;
  width: number;
  height: number;
  spacing: number;
  x: MotionValue<number>;
  onTap: () => void;
  entering: boolean;
}

export function Cover({
  cover,
  badgeContent,
  index,
  selectedIndex = -1,
  offset,
  width,
  height,
  spacing,
  x,
  onTap,
  entering
}: CoverProps) {
  const controls = useAnimation();
  const [isPresent, safeToRemove] = usePresence();

  const imageSize = fitObjectSize(
    'contain',
    { width, height },
    { width: cover.width, height: cover.height }
  );

  const position = index * (width + spacing);
  const margin = (width - imageSize.width + spacing) / 2;

  const getDelta = (value: number) => {
    const maxRange = 1280;
    const delta = position + value;
    return clamp(-1, 1, delta / maxRange);
  };

  const rotateY = useTransform(x, value => interpolateAngle(getDelta(value)));
  const scale = useTransform(x, value => interpolateScale(getDelta(value)));

  const [, setEntered] = React.useState<boolean>(false);
  const transitionScale = imageSize.height / (height / 2);

  React.useLayoutEffect(() => {
    setEntered(entered => {
      if (entering && !entered) {
        if (selectedIndex === index) {
          controls.start({  // Shrink and flip back vertically
            opacity: 1,
            rotateY: 0,
            scale: 1.2,
            transition: {
              rotateY: {
                type: 'tween',
                ease: 'easeInOut',
                duration: 0.4
              },
              scale: {
                type: 'tween',
                ease: 'easeInOut',
                duration: 0.4
              }
            }
          });
        } else {  // Not selected
          controls.start({  // Fade in left or right
            opacity: 1,
            x: 0,
            transition: {
              type: 'tween',
              ease: 'easeOut',
              duration: 0.4
            }
          });
        }

        return true;
      }

      return entered;
    });
  }, [controls, entering, index, selectedIndex]);

  React.useEffect(() => {
    if (!isPresent) {
      if (selectedIndex === index) {
        controls.start({  // Grow and flip vertically
          opacity: 0,
          rotateY: 90,
          scale: transitionScale,
          transition: {
            type: 'tween',
            ease: 'easeInOut',
            duration: 0.4
          }
        }).then(() => safeToRemove && safeToRemove());
      } else {  // Not selected
        controls.start({  // Fade out left or right
          opacity: 0,
          x: Math.sign(index - selectedIndex) * 128,
          transition: {
            type: 'tween',
            ease: 'easeIn',
            duration: 0.4
          }
        }).then(() => safeToRemove && safeToRemove());
      }
    }
  }, [controls, index, isPresent, safeToRemove, selectedIndex, transitionScale]);

  return (
    <motion.li
      initial={entering ? (index === selectedIndex ? {
        opacity: 0, rotateY: 90, scale: transitionScale
      } : {
        opacity: 0, x: Math.sign(index - selectedIndex) * 128
      }) : false}
      animate={controls}
      style={{
        marginLeft: `calc(${offset} + ${margin}px)`,
        marginRight: margin,
        boxSizing: 'border-box',
        rotateY,
        scale
      }}
    >
      <Badge
        component={motion.span}
        badgeContent={badgeContent}
        color="primary"
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        sx={{
          '& .MuiBadge-anchorOriginBottomRightRectangular': {
            transform: 'scale(1.5) translate(50%, 50%)'
          }
        }}
      >
        <motion.img
          src={cover.url}
          draggable={false}
          style={{ ...imageSize }}
          onTap={() => {
            if (isPresent) {
              onTap();
            }
          }}
          whileHover={{ cursor: 'pointer' }}
        />
      </Badge>
    </motion.li>
  );
}

export default Cover;
