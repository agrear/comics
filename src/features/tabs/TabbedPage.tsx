import { makeStyles, Theme } from '@material-ui/core/styles';
import MuiTab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import clsx from 'clsx';
import { AnimatePresence } from 'framer-motion';
import React from 'react';

import { TabProps } from './Tab';
import TabPanel from './TabPanel';

const useStyles = makeStyles((theme: Theme) => ({
  tabbedPage: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    height: '100%'
  },
  tab: {
    fontSize: 24
  },
  tabPanels: {
    position: 'relative',
    width: '100%',
    flexGrow: 1,
    overflow: 'hidden'
  }
}));

interface TabbedPageProps {
  children: React.ReactElement<TabProps> | React.ReactElement<TabProps>[];
  selectedTab?: number;
  onSelectedTabChange?: (index: number) => void;
  className?: string;
}

function TabbedPage({
  children,
  selectedTab,
  onSelectedTabChange,
  className
}: TabbedPageProps) {
  const classes = useStyles();

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
    <div className={clsx(classes.tabbedPage, className)}>
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
            className={classes.tab}
          />
        ))}
      </Tabs>

      <div className={classes.tabPanels}>
        <AnimatePresence initial={false} custom={selectedIndex.direction}>
          <TabPanel key={selectedIndex.value} direction={selectedIndex.direction}>
            {pages[selectedIndex.value]}
          </TabPanel>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default TabbedPage;
