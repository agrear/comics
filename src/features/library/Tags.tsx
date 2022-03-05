import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import React from 'react';

export function Tags({ children }: { children: string[] }) {
  return (
    <Box
      component="ul"
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        listStyle: 'none',
        p: 0,
        m: 0
      }}
    >
      {React.Children.map(children, (tag, i) => (
        <li key={i}>
          <Chip
            label={tag}
            variant="outlined"
            sx={{ fontSize: 16, mr: 1 }}
          />
        </li>
      ))}
    </Box>
  );
}

export default Tags;
