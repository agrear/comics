import Box from '@mui/material/Box';
import MuiTab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { SxProps } from '@mui/material/styles';
import { AnimatePresence } from 'framer-motion';
import React from 'react';

import { TabProps } from './Tab';
import TabPanel from './TabPanel';

interface TabbedPageProps {
  children: React.ReactElement<TabProps> | React.ReactElement<TabProps>[];
  selectedTab?: number;
  onSelectedTabChange?: (index: number) => void;
  sx?: SxProps;
}

function TabbedPage({
  children,
  selectedTab,
  onSelectedTabChange,
  sx
}: TabbedPageProps) {
  const [selectedIndex, setSelectedIndex] = React.useState({
    direction: 0,
    value: selectedTab ?? 0
  });

  React.useEffect(() => {
    if (selectedTab !== undefined) {
      setSelectedIndex(({ value }) => ({
        direction: Math.sign(selectedTab - value),
        value: selectedTab
      }));
    }
  }, [selectedTab]);

  const pages = Array.isArray(children) ? children : [children];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        height: '100%',
        ...sx
      }}
    >
      <Tabs
        value={selectedIndex.value}
        onChange={(event, value) => {
          if (onSelectedTabChange) {
            onSelectedTabChange(value);
          } else {
            setSelectedIndex({
              direction: Math.sign(value - selectedIndex.value),
              value
            });
          }
        }}
        indicatorColor="primary"
        textColor="primary"
      >
        {pages.map(child => (
          <MuiTab
            key={child.props.label}
            label={child.props.label}
            sx={{ fontSize: 24 }}
          />
        ))}
      </Tabs>

      <Box
        sx={{
          position: 'relative',
          width: '100%',
          flexGrow: 1
        }}
      >
        <AnimatePresence initial={false} custom={selectedIndex.direction}>
          <TabPanel key={selectedIndex.value} direction={selectedIndex.direction}>
            {pages[selectedIndex.value]}
          </TabPanel>
        </AnimatePresence>
      </Box>
    </Box>
  );
}

export default TabbedPage;
