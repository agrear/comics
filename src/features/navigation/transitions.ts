import { Variants } from 'framer-motion';

function invert(value: number | string) {
  if (typeof value === 'number') {
    return -value;
  }

  if (typeof value === 'string') {
    if (value.startsWith('-')) {
      return value.substr(1);
    }

    return '-' + value;
  }
}

type Drill = {
  name: 'drill'
} & Partial<{
  direction: 'in' | 'out'
}>;

type Drop = {
  name: 'drop'
} & Partial<{
    direction: 'left' | 'right'
}>;

type Glide = {
  name: 'glide'
} & Partial<{
    direction: 'left' | 'right' | 'top' | 'bottom',
    offset: number | string
}>;

type GlideIn = {
  name: 'glideIn'
} & Partial<{
    direction: 'left' | 'right' | 'top' | 'bottom'
}>;

type GlideOut = {
  name: 'glideOut'
} & Partial<{
    direction: 'left' | 'right' | 'top' | 'bottom'
}>;

type Rise = {
  name: 'rise'
} & Partial<{
  direction: 'left' | 'right' | 'top' | 'bottom'
}>;

export type Transition = Drill | Drop | Glide | GlideIn | GlideOut | Rise;

const zIndex = {
  below: 1105,
  normal: 1110,
  above: 1115
};

export const transitions: Variants = {
  initial: (transition?: Transition) => {
    switch (transition?.name) {
      case 'drill': {
        const { direction = 'in' } = transition;

        return {
          opacity: direction === 'in' ? 1 : 0,
          scale: direction === 'in' ? 0.8 : 1.2,
          zIndex: direction === 'in' ? zIndex.below : zIndex.above
        };
      }
      case 'drop': {
        const { direction = 'left' } = transition;

        return {
          opacity: 1,
          scale: 1,
          x: direction === 'left' ? '100%' : '-100%',
          zIndex: zIndex.normal
        };
      }
      case 'glide': {
        const { direction = 'left', offset = '100%' } = transition;

        return {
          opacity: 0,
          x: direction === 'left' ? offset : (direction === 'right' ? invert(offset) : 0),
          y: direction === 'top' ? offset : (direction === 'bottom' ? invert(offset) : 0),
          zIndex: zIndex.normal
        };
      }
      case 'glideIn': {
        const { direction = 'left' } = transition;

        return {
          x: direction === 'left' ? '100%' : (direction === 'right' ? '-100%' : 0),
          y: direction === 'top' ? '-100%' : (direction === 'bottom' ? '100%' : 0),
          zIndex: zIndex.normal
        };
      }
      case 'glideOut': {
        return {
          x: 0,
          y: 0,
          zIndex: zIndex.below
        };
      }
      case 'rise': {
        return {
          opacity: 0.3,
          scale: 0.6,
          zIndex: zIndex.below
        };
      }
      default:
        return {};
    }
  },
  enter: (transition?: Transition) => {
    switch (transition?.name) {
      case 'drill': {
        return {
          opacity: 1,
          scale: 1,
          zIndex: zIndex.normal,
          transition: {
            type: 'tween',
            ease: 'easeInOut',
            duration: 0.4
          }
        };
      }
      case 'drop': {
        return {
          opacity: 1,
          scale: 1,
          x: 0,
          zIndex: zIndex.normal,
          transition: {
            type: 'tween',
            ease: 'easeInOut',
            duration: 0.5
          }
        };
      }
      case 'glide': {
        return {
          opacity: 1,
          x: 0,
          y: 0,
          zIndex: zIndex.normal,
          transition: {
            type: 'tween',
            ease: 'circOut',
            duration: 0.3
          }
        };
      }
      case 'glideIn': {
        return {
          x: 0,
          y: 0,
          zIndex: zIndex.normal,
          transition: {
            type: 'tween',
            ease: 'easeInOut',
            duration: 0.5
          }
        };
      }
      case 'glideOut': {
        return {
          x: 0,
          y: 0,
          zIndex: zIndex.normal,
          transition: {
            type: 'tween',
            ease: 'linear',
            duration: 0.5
          }
        };
      }
      case 'rise': {
        return {
          opacity: 1,
          scale: 1,
          zIndex: zIndex.normal,
          transition: {
            type: 'tween',
            ease: 'easeOut',
            duration: 0.5
          }
        };
      }
      default:
        return {};
    }
  },
  exit: (transition?: Transition) => {
    switch (transition?.name) {
      case 'drill': {
        const { direction = 'in' } = transition;

        return {
          opacity: 0,
          scale: direction === 'in' ? 1.2 : 0.8,
          zIndex: direction === 'in' ? zIndex.above : zIndex.normal,
          transition: {
            type: 'tween',
            ease: 'easeInOut',
            duration: 0.4
          }
        };
      }
      case 'drop': {
        return {
          opacity: 0.3,
          scale: 0.6,
          x: 0,
          zIndex: zIndex.below,
          transition: {
            type: 'tween',
            ease: 'easeInOut',
            duration: 0.5
          }
        };
      }
      case 'glide': {
        const { direction = 'left', offset = '100%' } = transition;

        return {
          opacity: 0,
          x: direction === 'left' ? invert(offset) : (direction === 'right' ? offset : 0),
          y: direction === 'top' ? invert(offset) : (direction === 'bottom' ? offset : 0),
          zIndex: zIndex.above,
          transition: {
            type: 'tween',
            ease: 'circIn',
            duration: 0.15
          }
        };
      }
      case 'glideIn': {
        return {
          x: 0,
          y: 0,
          zIndex: zIndex.below,
          transition: {
            type: 'tween',
            ease: 'linear',
            duration: 0.5
          }
        };
      }
      case 'glideOut': {
        const { direction } = transition;

        return {
          x: direction === 'left' ? '-100%' : (direction === 'right' ? '100%' : 0),
          y: direction === 'top' ? '-100%' : (direction === 'bottom' ? '100%' : 0),
          zIndex: zIndex.above,
          transition: {
            type: 'tween',
            ease: 'easeInOut',
            duration: 0.5
          }
        };
      }
      case 'rise': {
        return {
          opacity: 1,
          scale: 1,
          zIndex: zIndex.above,
          transition: {
            type: 'tween',
            ease: 'easeIn',
            duration: 0.5
          }
        };
      }
      default:
        return {};
    }
  }
};

export const getTransitionProps = (transition?: Transition) => ({
  variants: transitions,
  initial: transition ? 'initial' : false,
  animate: transition ? 'enter' : false,
  exit: transition ? 'exit' : undefined,
  custom: transition
});
