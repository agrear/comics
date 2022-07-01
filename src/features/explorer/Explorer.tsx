import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { clamp, snap } from '@popmotion/popcorn';
import {
  animate,
  AnimatePresence,
  AnimationOptions,
  motion,
  useDragControls,
  useMotionValue
} from 'framer-motion';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import DeletePageDialog from './DeletePageDialog';
import {
  explorerViewUpdated,
  newPageSelected,
  pageDeselected,
  pageSelected,
  selectNavigation,
  selectSelectedPage
} from './explorerSlice';
import ExplorerPage from './ExplorerPage';
import NewPage from './NewPage';
import SelectWebpageDialog from './SelectWebpageDialog';
import SelectPageNumberDialog from './SelectPageNumberDialog';
import { Comic, Page } from '../comic/comicSlice';

const pageWidth = 240;
const pageHeight = 340;

interface ExplorerProps {
  comic: Comic;
  parentHeight: number;
  spacing?: number;
}

export function Explorer({ comic, parentHeight, spacing = 4 }: ExplorerProps) {
  const theme = useTheme();
  const dispatch = useDispatch();

  const navigation = useSelector(selectNavigation);
  const selectedPage = useSelector(selectSelectedPage);

  const dragControls = useDragControls();
  const scrollbar = React.useRef<HTMLDivElement | null>(null);

  const [selectedIndex, setSelectedIndex] = React.useState<number>(
    comic.bookmark
  );

  const itemDistance = pageHeight + parseInt(theme.spacing(spacing));
  const dragDistance = Math.max(
    0, comic.pages.length * itemDistance - parseInt(theme.spacing(spacing))
  );

  const y = useMotionValue<number>(
    clamp(0, comic.pages.length, selectedIndex) * -itemDistance
  );

  const thumbHeight = parseInt(theme.spacing(6));
  const scrollbarHeight = (scrollbar?.current?.clientHeight ?? 0) - thumbHeight;
  const scrollY = useMotionValue<number>(0);

  const snapTo = snap(itemDistance);

  const scrollToIndex = React.useCallback((
    index: number,
    onComplete?: () => void
  ) => {
      const yStart = y.get();
      const yEnd = index * -itemDistance;
      const transition: AnimationOptions<number> = {
        type: 'tween',
        ease: 'easeInOut',
        duration: clamp(0, 1, Math.abs(yEnd - yStart) / itemDistance) * 0.5
      };

      animate(y, yEnd, { ...transition, onComplete });

      // Update scrollbar
      const scrollYEnd = clamp(0, 1, yEnd / -dragDistance) * scrollbarHeight;
      animate(scrollY, scrollYEnd, transition);
  }, [dragDistance, itemDistance, scrollbarHeight, scrollY, y]);

  const overscan = 1;
  const windowSize = Math.ceil(parentHeight / itemDistance) + overscan * 2;

  const items = React.useMemo(() => {
    const start = Math.max(0, Math.floor(selectedIndex - windowSize / 2));
    const end = Math.min(
      Math.ceil(selectedIndex + windowSize / 2),
      comic.pages.length
    );

    const handlePageTap = (index: number, page?: Page) => {
      if (index !== selectedIndex) {
        dispatch(pageDeselected());
      }

      // Animate to tapped item
      scrollToIndex(index, () => {
        dispatch(page !== undefined ? pageSelected(page) : newPageSelected({
          comicId: comic.id,
          pageNumber: comic.pages.length
        }));
      });
    };

    const padding = (parentHeight - pageHeight) / 2;

    const items = [];
    for (let i = start; i <= end; ++i) {
      const page = comic.pages[i];

      if (page !== undefined) {
        items.push(
          <ExplorerPage
            key={page.id}
            page={page}
            top={i * itemDistance + padding}
            width={pageWidth}
            height={pageHeight}
            navigation={navigation}
            selected={selectedPage?.id === page.id}
            onTap={page => handlePageTap(i, page)}
          />
        );
      } else {
        items.push(
          <NewPage
            key="new-page"
            comicId={comic.id}
            top={i * itemDistance + padding}
            width={pageWidth}
            height={pageHeight}
            navigation={navigation}
            selected={selectedPage === null}
            onTap={() => handlePageTap(comic.pages.length)}
          />
        );
      }
    }

    return items;
  }, [
    comic.id,
    comic.pages,
    dispatch,
    itemDistance,
    navigation,
    parentHeight,
    scrollToIndex,
    selectedIndex,
    selectedPage,
    windowSize
  ]);

  // Update scrollbar position
  React.useEffect(() => {
    scrollY.set((y.get() / -dragDistance) * scrollbarHeight);
  }, [dragDistance, scrollY, scrollbarHeight, y]);

  // Animate page reorder
  React.useEffect(() => {
    if (selectedPage !== undefined && selectedPage !== null) {
      if (selectedPage.number !== selectedIndex) {
        scrollToIndex(selectedPage.number);
      }
    }
  }, [scrollToIndex, selectedIndex, selectedPage]);

  // Update index on drag
  React.useEffect(() => {
    function updateView(value: number) {
      setSelectedIndex(
        Math.round(clamp(-dragDistance, 0, value) / -itemDistance)
      );
    }

    return y.onChange(updateView);
  }, [dragDistance, itemDistance, y]);

  // Signal selected index changed
  React.useEffect(() => {
    if (selectedIndex !== -1) {
      dispatch(explorerViewUpdated({
        comicId: comic.id,
        index: selectedIndex,
        range: Math.floor(windowSize / 2)
      }));
    }
  }, [comic.id, comic.pages, dispatch, selectedIndex, windowSize]);

  return (
    <Box
      onPointerDown={event => dragControls.start(event)}
      onWheel={event => {
        scrollToIndex(clamp(
          0,
          comic.pages.length,
          Math.round(selectedIndex + event.deltaY / 100)
        ));
      }}
      mx={{
        display: 'flex',
        height: '100%'
      }}
    >
      <motion.ul
        drag={navigation === 'viewPages' ? 'y' : false}
        dragControls={dragControls}
        dragConstraints={{ top: -dragDistance, bottom: 0 }}
        dragTransition={{
          power: 0.2,
          timeConstant: 120,
          modifyTarget: value => {
            const percentage = clamp(0, 1, snapTo(value) / -dragDistance);
            animate(scrollY, percentage * scrollbarHeight, {
              type: 'tween',
              ease: 'easeInOut',
              duration: 0.3
            });

            return snapTo(value);
          }
        }}
        onDrag={(event, info) => {
          const percentage = clamp(0, 1, y.get() / -dragDistance);
          scrollY.set(percentage * scrollbarHeight);
        }}
        style={{
          position: 'relative',
          display: 'grid',
          gridRowGap: theme.spacing(spacing),
          justifyContent: 'center',
          width: '100%',
          height: dragDistance,
          listStyle: 'none',
          padding: `${(parentHeight - pageHeight) / 2}px 0`,
          margin: 0,
          y
        }}
      >
        <AnimatePresence initial={false}>
          {items}
        </AnimatePresence>
      </motion.ul>

      <motion.div
        ref={scrollbar}
        onTap={(event, info) => {
          if (event.target !== scrollbar?.current) {
            return;
          }

          // Set scrollbar thumb
          const top = clamp(
            0,
            scrollbarHeight,
            info.point.y - thumbHeight / 2
          );
          const percentage = top / scrollbarHeight;

          y.set(percentage * -dragDistance);
          scrollY.set(top);
        }}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: theme.spacing(2),
          borderLeft: '1px solid',
          borderColor: theme.palette.grey[700],
          boxSizing: 'content-box'
        }}
      >
        <motion.div
          drag="y"
          dragConstraints={scrollbar}
          dragElastic={false}
          dragMomentum={false}
          onDrag={(event, info) => {
            const percentage = scrollY.get() / scrollbarHeight;
            y.set(percentage * -dragDistance);
          }}
          transition={{ duration: 0.1 }}
          whileHover={{ backgroundColor: theme.palette.grey[500] }}
          whileTap={{ backgroundColor: theme.palette.grey[500] }}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            height: theme.spacing(6),
            width: theme.spacing(2),
            backgroundColor: theme.palette.grey[700],
            cursor: 'pointer',
            y: scrollY
          }}
        />
      </motion.div>

      <SelectWebpageDialog comic={comic} />

      <SelectPageNumberDialog pageTotal={comic.pages.length} />

      <DeletePageDialog />
    </Box>
  );
}

export default Explorer;
