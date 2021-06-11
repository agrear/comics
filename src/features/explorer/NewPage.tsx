import CircularProgress from '@material-ui/core/CircularProgress';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import AddPhotoAlternateIcon from '@material-ui/icons/AddPhotoAlternate';
import { EntityId } from '@reduxjs/toolkit';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Carousel from './carousel/Carousel';
import CarouselLoader from './carousel/CarouselLoader';
import {
  Navigation,
  newPageAdded,
  newPageCanceled,
  selectWebpageHistory,
  selectWebpageImages
} from './explorerSlice';
import { selectUpdater } from '../updater/updaterSlice';

interface StyleProps {
  top: number;
  width: number;
  height: number;
}

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    page: ({ top, width, height }: StyleProps) => ({
      position: 'absolute',
      top,
      left: 0,
      right: 0,
      width,
      height,
      marginLeft: 'auto',
      marginRight: 'auto'
    }),
    placeholder: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '2px dashed white'
    },
    icon: {
      fontSize: theme.spacing(8),
      pointerEvents: 'none'
    }
  })
);

export interface NewPageProps {
  comicId: EntityId;
  top: number;
  width: number;
  height: number;
  navigation: Navigation;
  selected: boolean;
  onTap: () => void;
}

export function NewPage({
  comicId,
  top,
  width,
  height,
  navigation,
  selected,
  onTap
}: NewPageProps) {
  const classes = useStyles({ top, width, height });
  const dispatch = useDispatch();

  const updater = useSelector(selectUpdater(comicId));
  const webpageHistory = useSelector(selectWebpageHistory);
  const webpageImages = useSelector(selectWebpageImages);

  if (selected && navigation === 'selectImage') {
    return (
      <motion.li className={clsx(classes.page, classes.placeholder)}>
        <CarouselLoader page={null} onCancel={() => dispatch(newPageCanceled())}>
          <Carousel
            images={webpageImages!}
            itemWidth={width}
            itemHeight={height}
            onImageSelected={image => {
              if (image !== undefined) {
                dispatch(newPageAdded({
                  comicId,
                  url: webpageHistory[webpageHistory.length - 1].url,
                  image
                }));
              } else {
                dispatch(newPageCanceled());
              }
            }}
          />
        </CarouselLoader>
      </motion.li>
    );
  }

  return (
    <motion.li
      className={clsx(classes.page, classes.placeholder)}
      onTap={() => {
        if (!updater?.running) {
          onTap();
        }
      }}
      whileHover={{ cursor: 'pointer' }}
    >
      {updater?.running ? (
        <CircularProgress />
      ) : (
        <AddPhotoAlternateIcon className={classes.icon} />
      )}
    </motion.li>
  );
}

export default NewPage;
