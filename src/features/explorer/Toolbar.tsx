import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { motion, Variants } from 'framer-motion';
import React from 'react';

export const useStyles = makeStyles((theme: Theme) => ({
  toolbar: {
    display: 'grid',
    gridRowGap: theme.spacing(1),
    position: 'absolute',
    top: 0,
    left: '100%',
    marginLeft: theme.spacing(1)
  }
}));

const toolbar: Variants = {
  initial: {},
  visible: { transition: { staggerChildren: 0.04 } },
  exit: {}
};

const button: Variants = {
  initial: { opacity: 0, x: -64 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -64 }
};

interface ToolbarButtonProps {
  tooltip: string;
  children: React.ReactNode;
  className: string;
  onTap: (event: any) => void;
}

function ToolbarButton({
  tooltip,
  children,
  ...props
}: ToolbarButtonProps) {
  const [showTooltip, setShowTooltip] = React.useState(false);

  return (
    <Tooltip title={tooltip} open={showTooltip} placement="right">
      <IconButton
        component={motion.button}
        variants={button}
        onHoverStart={() => setShowTooltip(true)}
        onHoverEnd={() => setShowTooltip(false)}
        {...props}
      >
        {children}
      </IconButton>
    </Tooltip>
  );
}

interface ToolbarProps {
  children: ({ id: string } & ToolbarButtonProps)[];
}

export function Toolbar({ children }: ToolbarProps) {
  const classes = useStyles();

  return (
    <motion.div
      variants={toolbar}
      initial="initial"
      animate="visible"
      exit="exit"
      className={classes.toolbar}
    >
      {children.map(({ id, children, ...props }, i) => (
        <ToolbarButton key={id} {...props}>
          {children}
        </ToolbarButton>
      ))}
    </motion.div>
  );
}

export default Toolbar;
