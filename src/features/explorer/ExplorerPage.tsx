import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import {
  fade,
  lighten,
  makeStyles,
  Theme
} from '@material-ui/core/styles';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import ImageIcon from '@material-ui/icons/Image';
import SwapVertIcon from '@material-ui/icons/SwapVert';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Carousel from './carousel/Carousel';
import CarouselLoader from './carousel/CarouselLoader';
import {
  deletePageSelected,
  editPageNumberSelected,
  imageSelected,
  Navigation,
  navigatedToOptions,
  pageDeselected,
  selectImageCanceled,
  selectImageSelected,
  selectWebpageImages,
  selectWebpageSelected
} from './explorerSlice';
import Toolbar from './Toolbar';
import { Page } from '../comic/comicSlice';
import { selectImage } from '../comic/imageSlice';

interface StyleProps {
  top: number;
  width: number;
  height: number;
}

export const useStyles = makeStyles((theme: Theme) => ({
  page: ({ top, width, height }: StyleProps) => ({
    position: 'absolute',
    top,
    left: 0,
    right: 0,
    width,
    height,
    boxSizing: 'border-box',
    marginLeft: 'auto',
    marginRight: 'auto'
  }),
  image: ({ width, height }: StyleProps) => ({
    position: 'relative',
    width,
    height,
    objectFit: 'cover',
    zIndex: 1
  }),
  icon: {
    fontSize: theme.spacing(8),
    pointerEvents: 'none'
  },
  toolbarButton: {
    backgroundColor: fade(lighten(theme.palette.background.paper, 0.2), 0.5),
    "&:hover": {
      backgroundColor: fade(lighten(theme.palette.background.paper, 0.4), 0.5)
    }
  },
  toolbarButtonDelete: {
    backgroundColor: fade(lighten(theme.palette.error.main, 0.2), 0.5),
    "&:hover": {
      backgroundColor: fade(lighten(theme.palette.error.main, 0.4), 0.5)
    }
  }
}));

interface ExplorerPageProps {
  page: Page;
  top: number;
  width: number;
  height: number;
  navigation: Navigation;
  selected: boolean;
  onTap: (page: Page) => void;
}

export function ExplorerPage({
  page,
  top,
  width,
  height,
  navigation,
  selected,
  onTap
}: ExplorerPageProps) {
  const classes = useStyles({ top, width, height });
  const dispatch = useDispatch();

  const image = useSelector(selectImage(page.id));
  const webpageImages = useSelector(selectWebpageImages);

  if (image === undefined) {
    return null;
  }

  return (
    <ClickAwayListener
      onClickAway={() => {
        if (!selected) {
          return;
        }

        if (navigation === 'returningToOptions') {
          dispatch(navigatedToOptions());
        } else if (navigation === 'showOptions') {
          dispatch(pageDeselected());
        }
      }}
    >
      <motion.li
        initial={{ opacity: 0, scale: 0.25 }}
        animate={{
          opacity: 1,
          scale: 1,
          transition: {
            opacity: {
              type: 'tween',
              ease: 'linear',
              duration: 0.15
            },
            scale: {
              type: 'tween',
              ease: 'circOut',
              duration: 0.15
            }
          }
        }}
        exit={{
          opacity: 0,
          scale: 0,
          transition: {
            type: 'tween',
            ease: 'easeIn',
            duration: 0.4
          }
        }}
        onTap={(event) => {
          if (!selected && page !== undefined) {
            onTap(page);
          }
        }}
        whileHover={{ cursor: selected ? 'default' : 'pointer' }}
        className={classes.page}
      >
        {page ? (
          <img
            src={image.url}
            alt=""
            draggable={false}
            className={classes.image}
            style={{
              opacity: selected && navigation === 'selectImage' ? 0.25 : 1
            }}
          />
        ) : <DeleteIcon className={classes.icon} />}

        <AnimatePresence>
          {selected && navigation === 'showOptions' && (
            <Toolbar>
              {[
                {
                  id: 'edit',
                  tooltip: 'Change node',
                  className: classes.toolbarButton,
                  onTap: () => dispatch(selectWebpageSelected()),
                  children: <EditIcon />
                },
                {
                  id: 'editImage',
                  tooltip: 'Change image',
                  className: classes.toolbarButton,
                  onTap: () => dispatch(selectImageSelected()),
                  children: <ImageIcon />
                },
                {
                  id: 'reorder',
                  tooltip: 'Change order',
                  className: classes.toolbarButton,
                  onTap: () => dispatch(editPageNumberSelected()),
                  children: <SwapVertIcon />
                },
                {
                  id: 'delete',
                  tooltip: 'Delete page',
                  className: classes.toolbarButtonDelete,
                  onTap: () => dispatch(deletePageSelected()),
                  children: <DeleteIcon />
                }
              ]}
            </Toolbar>
          )}
        </AnimatePresence>

        {selected && navigation === 'selectImage' && (
          <CarouselLoader
            page={page}
            onCancel={() => dispatch(selectImageCanceled())}
          >
            <Carousel
              images={webpageImages!}
              selectedIndex={
                webpageImages?.findIndex(({ src }) => src === image?.src)
              }
              itemWidth={width}
              itemHeight={height}
              onImageSelected={image => {
                if (image !== undefined) {
                  dispatch(imageSelected({ page, image }));
                } else {
                  dispatch(selectImageCanceled());
                }
              }}
            />
          </CarouselLoader>
        )}
      </motion.li>
    </ClickAwayListener>
  );
}

export default ExplorerPage;
