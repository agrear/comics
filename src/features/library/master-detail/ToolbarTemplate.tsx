import { darken } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import React from 'react';

interface ToolbarTemplateProps {
  children: React.ReactNode;
}

export function ToolbarTemplate({ children }: ToolbarTemplateProps) {
  return (
    <AppBar>
      <Toolbar>
        {children}
      </Toolbar>
    </AppBar>
  );
}

export default ToolbarTemplate;
