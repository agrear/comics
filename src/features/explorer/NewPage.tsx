import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CircularProgress from '@mui/material/CircularProgress';
import { EntityId } from '@reduxjs/toolkit';
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

const pageStyle: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  right: 0,
  marginLeft: 'auto',
  marginRight: 'auto'
};

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
  const dispatch = useDispatch();

  const updater = useSelector(selectUpdater(comicId));
  const webpageHistory = useSelector(selectWebpageHistory);
  const webpageImages = useSelector(selectWebpageImages);

  if (selected && navigation === 'selectImage') {
    return (
      <motion.li style={{ ...pageStyle, top, width, height }}>
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
      onTap={() => {
        if (!updater?.running) {
          onTap();
        }
      }}
      whileHover={{ cursor: 'pointer' }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px dashed white',
        ...pageStyle,
        top,
        width,
        height
      }}
    >
      {updater?.running ? (
        <CircularProgress />
      ) : (
        <AddPhotoAlternateIcon
          sx={{
            fontSize: theme => theme.spacing(8),
            pointerEvents: 'none'
          }}
        />
      )}
    </motion.li>
  );
}

export default NewPage;
