import Box from '@mui/material/Box';
import { AnimatePresence } from "framer-motion";
import React from 'react';
import Measure from 'react-measure';

import FlipViewItem from './FlipViewItem';
import { Page } from '../comicSlice';
import { Layout } from 'utils';

interface FlipViewProps {
  pages: Page[];
  selectedIndex: number;
  brightness: number;
  layout: Layout;
  onPageFlip: (index: number) => void;
  exit: boolean;
  onExitComplete: () => void;
}

export function FlipView({
  pages,
  selectedIndex,
  brightness,
  layout,
  onPageFlip,
  exit,
  onExitComplete
}: FlipViewProps) {
  const [direction, setDirection] = React.useState(0);

  return (
    <Measure client>
      {({ measureRef, contentRect: { client } }) => (
        <Box
          component="ul"
          ref={measureRef}
          sx={{
            position: "relative",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            alignItems: "center",
            justifyContent: "center",
            listStyle: "none",
            padding: 0,
            margin: 0,
            perspective: 1000
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
            {!exit && <FlipViewItem
              key={pages[selectedIndex]?.id}
              pageId={pages[selectedIndex]?.id}
              direction={direction}
              parentSize={{
                width: client?.width ?? 0,
                height: client?.height ?? 0
              }}
              objectFit={layout.fit}
              objectPosition={layout.position}
              brightness={brightness}
              zoom={layout.zoom}
              onPageFlip={(direction: 1 | -1) => {
                setDirection(direction);
                onPageFlip(selectedIndex + direction);
              }}
            />}
          </AnimatePresence>
        </Box>
      )}
    </Measure>
  );
}

export default FlipView;
