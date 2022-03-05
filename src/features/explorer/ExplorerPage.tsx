import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ImageIcon from '@mui/icons-material/Image';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { alpha, lighten, styled } from '@mui/material/styles';
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
import ToolbarButton, { ToolbarButtonProps } from './ToolbarButton';
import { Page } from '../comic/comicSlice';
import { selectImage } from '../comic/imageSlice';

const StyledToolbarButton = styled(
  ToolbarButton
)<ToolbarButtonProps>(({ theme }) => ({
  backgroundColor: alpha(lighten(theme.palette.background.paper, 0.2), 0.5),
  '&:hover': {
    backgroundColor: alpha(lighten(theme.palette.background.paper, 0.4), 0.5)
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
        style={{
          position: 'absolute',
          top,
          left: 0,
          right: 0,
          width,
          height,
          boxSizing: 'border-box',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}
      >
        {page ? (
          <img
            src={image.url}
            alt=""
            draggable={false}
            style={{
              position: 'relative',
              width,
              height,
              objectFit: 'cover',
              opacity: selected && navigation === 'selectImage' ? 0.25 : 1,
              zIndex: 1
            }}
          />
        ) : (
          <DeleteIcon
            sx={{
              fontSize: theme => theme.spacing(8),
              pointerEvents: 'none'
            }}
          />
        )}

        <AnimatePresence>
          {selected && navigation === 'showOptions' && (
            <Toolbar>
              <StyledToolbarButton
                key="edit"
                tooltip="Change node"
                onTap={() => dispatch(selectWebpageSelected())}
              >
                <EditIcon />
              </StyledToolbarButton>

              <StyledToolbarButton
                key="editImage"
                tooltip="Change image"
                onTap={() => dispatch(selectImageSelected())}
              >
                <ImageIcon />
              </StyledToolbarButton>

              <StyledToolbarButton
                key="reorder"
                tooltip="Change order"
                onTap={() => dispatch(editPageNumberSelected())}
              >
                <SwapVertIcon />
              </StyledToolbarButton>

              <ToolbarButton
                key="delete"
                tooltip="Delete page"
                onTap={() => dispatch(deletePageSelected())}
                sx={{
                  backgroundColor: theme => (
                    alpha(lighten(theme.palette.error.main, 0.2), 0.5)
                  ),
                  '&:hover': {
                    backgroundColor: theme => (
                      alpha(lighten(theme.palette.error.main, 0.4), 0.5)
                    )
                  }
                }}
              >
                <DeleteIcon />
              </ToolbarButton>
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
