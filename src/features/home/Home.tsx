import { AnimatePresence } from 'framer-motion';
import React from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import Carousel from './carousel/Carousel';
import { Comic, selectComics } from '../comic/comicSlice';
import {
  comicLastViewedUpdated,
  selectLastComicViewed
} from '../history/historySlice';

export function Home() {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();

  const comics = useSelector(selectComics, shallowEqual);
  const comicLastViewed = useSelector(selectLastComicViewed);
  const [selectedComic, setSelectedComic] = React.useState<Comic | undefined>(
    comics.find(({ id }) => id === comicLastViewed)
  );

  const [exiting, setExiting] = React.useState<boolean>(false);

  const handleItemTap = React.useCallback((comic: Comic) => {
    setSelectedComic(comic);
    setExiting(true);
  }, []);

  const handleSelectedItemChange = React.useCallback((comic?: Comic) => {
    if (comic !== undefined) {
      dispatch(comicLastViewedUpdated({ comicId: comic.id }));
    }

    setSelectedComic(comic);
  }, [dispatch]);

  return (
    <AnimatePresence
      onExitComplete={() => {
        if (selectedComic !== undefined) {
          history.push(`/comic/${selectedComic.id}`);
        }
      }}
    >
      {!exiting && (
        <Carousel
          items={comics}
          onItemTap={handleItemTap}
          selectedItem={selectedComic}
          onSelectedItemChange={handleSelectedItemChange}
          selectBadgeContent={item => (
            item.pages.filter(({ accessed }) => accessed === null).length
          )}
          selectId={item => item.id}
          selectImage={item => item.cover}
          entering={location.hash === '#back'}
        />
      )}
    </AnimatePresence>
  );
}

export default Home;
