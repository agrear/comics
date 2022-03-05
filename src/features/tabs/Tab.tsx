import Box, { BoxProps } from '@mui/material/Box';

export interface TabProps extends BoxProps {
  label: string;
}

function Tab({ children, ...props }: TabProps) {
  return (
    <Box {...props}>
      {children}
    </Box>
  );
}

export default Tab;
