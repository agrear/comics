import { makeStyles, Theme } from '@material-ui/core/styles';
import { AnimatePresence } from "framer-motion";
import React from 'react';
import Measure from 'react-measure';

import FlipViewItem from './FlipViewItem';
import { Page } from '../comicSlice';
import { Layout } from 'utils';

const useStyles = makeStyles((theme: Theme) => ({
  flipView: {
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
  }
}));

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
  const classes = useStyles();
  const [direction, setDirection] = React.useState(0);

  return (
    <Measure client>
      {({ measureRef, contentRect: { client } }) => (
        <ul ref={measureRef} className={classes.flipView}>
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
        </ul>
      )}
    </Measure>
  );
}

export default FlipView;
