import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { motion, Variants } from 'framer-motion';
import React from 'react';

const button: Variants = {
  initial: { opacity: 0, x: -64 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -64 }
};

export interface ToolbarButtonProps extends Omit<
  IconButtonProps, 'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragStart'
> {
  tooltip: string;
  onTap: () => void;
}

function ToolbarButton({
  tooltip,
  onTap,
  ...props
}: ToolbarButtonProps) {
  const [showTooltip, setShowTooltip] = React.useState(false);

  return (
    <Tooltip title={tooltip} open={showTooltip} placement="right">
      <IconButton
        {...props}
        component={motion.button}
        variants={button}
        onHoverStart={() => setShowTooltip(true)}
        onHoverEnd={() => setShowTooltip(false)}
        onTap={onTap}
      />
    </Tooltip>
  );
}

export default ToolbarButton;
