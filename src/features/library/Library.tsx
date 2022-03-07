import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Link from '@mui/material/Link';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { formatDistance } from 'date-fns';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import MasterDetailView from './master-detail/MasterDetailView';
import Tags from './Tags';
import {
  Comic,
  comicUpdated,
  comicUpdatesUpdated,
  selectComics
} from '../comic/comicSlice';
import DeleteComic from '../delete-comic/DeleteComic';
import EditComicDialog from '../edit-comic/EditComicDialog';
import Tab from '../tabs/Tab';
import TabbedPage from '../tabs/TabbedPage';
import { getFutureDate } from 'utils';

const StyledFormGroup = styled(FormGroup)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  position: 'relative'
});

const StyledSlider = styled(Slider)(({ theme }) => ({
  maxWidth: `calc(100% - ${theme.spacing(3)})`,
  marginLeft: theme.spacing(2)
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  display: 'grid',
  gridAutoFlow: 'row',
  alignItems: 'start',
  alignContent: 'start',
  gridRowGap: theme.spacing(3),
  maxWidth: 800,
  marginTop: theme.spacing(4)
}));

interface DetailPageProps {
  comic: Comic;
  selectedTab: number;
  onSelectedTabChange: (index: number) => void;
}

const DEFAULT_UPDATE_LIMIT = 3;

function DetailPage({
  comic: {
    id,
    url,
    title,
    author,
    synopsis,
    tags,
    created,
    updated,
    updates
  },
  selectedTab,
  onSelectedTabChange
 }: DetailPageProps) {
  const dispatch = useDispatch();

  const nextAutoUpdate = updates.enabled ? (
    getFutureDate(updates.interval, updated ?? created)
  ) : null;

  const [limit, setLimit] = React.useState(updates.limit);
  const [interval, setInterval] = React.useState(
    Math.round(updates.interval / 3600)
  );

  return (
    <TabbedPage
      selectedTab={selectedTab}
      onSelectedTabChange={onSelectedTabChange}
      sx={{ px: 2 }}
    >
      <StyledTab label="General">
        <Typography variant="h6">
          <Link href={url} rel="noreferrer" target="_blank">{url}</Link>
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: 1024 }}>
          {synopsis}
        </Typography>
        <Tags>{tags}</Tags>
      </StyledTab>

      <StyledTab label="Updates">
        <FormControlLabel
          control={
            <Switch
              checked={updates.enabled}
              onChange={(event, checked) => {
                dispatch(comicUpdated({
                  id,
                  changes: {
                    updates: {
                      ...updates,
                      enabled: checked
                    }
                  }
                }));
              }}
              name="updatesEnabled"
              color="primary"
            />
          }
          label="Updates enabled"
          labelPlacement="start"
          sx={{ maxWidth: 800, justifySelf: 'start', m: 0 }}
        />

        <StyledFormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={limit !== -1}
                disabled={!updates.enabled}
                onChange={(event, checked) => {
                  const limit = checked ? DEFAULT_UPDATE_LIMIT : -1;

                  setLimit(limit);
                  dispatch(comicUpdatesUpdated({
                    comicId: id,
                    updates: { limit }
                  }));
                }}
                name="updatesEnabled"
                color="primary"
              />
            }
            label="New page limit"
            labelPlacement="start"
            sx={{ maxWidth: 800, justifySelf: 'start', m: 0 }}
          />

          <StyledSlider
            value={limit}
            disabled={!updates.enabled || limit === -1}
            min={1}
            max={99}
            valueLabelDisplay="auto"
            onBlur={() => dispatch(
              comicUpdatesUpdated({ comicId: id, updates: { limit } })
            )}
            onChange={(event, value) => setLimit(value as number)}
          />
        </StyledFormGroup>

        <StyledFormGroup>
          <Typography gutterBottom>Update interval (hours)</Typography>
          <StyledSlider
            value={interval}
            disabled={!updates.enabled}
            min={24}
            max={72}
            step={6}
            marks={true}
            getAriaLabel={value => `${value} hours`}
            valueLabelDisplay="auto"
            onBlur={() => dispatch(
              comicUpdatesUpdated({
                comicId: id,
                updates: { interval: interval * 3600 }
              })
            )}
            onChange={(event, value) => setInterval(value as number)}
          />
        </StyledFormGroup>

        <StyledFormGroup>
          <Typography>
            {updated !== null ? (
              `Last updated ${formatDistance(updated, new Date())} ago`
            ) : 'Never updated'}
          </Typography>

          {nextAutoUpdate && (
            <Typography>
              Next update in {formatDistance(nextAutoUpdate, new Date())}
            </Typography>
          )}
        </StyledFormGroup>
      </StyledTab>
    </TabbedPage>
  );
}

function Library() {
  const comics = useSelector(selectComics);

  const [selectedTab, setSelectedTab] = React.useState(0);

  const showNumItems = (count: number, item: string) => {
    switch (count) {
      case 0:
        return `No ${item}s`;
      case 1:
        return `1 ${item}`;
      default:
        return `${count} ${item}s`;
    }
  };

  return (
    <MasterDetailView
      items={comics}
      MasterItemTemplate={({ title, author }) => (
        <ListItemText
          primary={title}
          primaryTypographyProps={{
            variant: "h5",
            noWrap: true,
            sx: { textOverflow: 'ellipsis' }
          }}
          secondary={author}
          secondaryTypographyProps={{
            noWrap: true,
            sx: { textOverflow: 'ellipsis' }
          }}
        />
      )}
      MasterToolbar={({ items }) => (
        <>
          <Box
            sx={{
              display: 'flex',
              flex: '1 1 auto',
              alignItems: 'center',
              px: 1
            }}
          >
            <Typography
              variant="h6"
              alignItems="center"
              sx={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {showNumItems(items.length, 'comic')}
            </Typography>
          </Box>

          <EditComicDialog
            title="Add Comic"
            buttonIcon={<AddIcon />}
            buttonText="Add"
          />
        </>
      )}
      DetailItemTemplate={comic => (
        <DetailPage
        comic={comic}
        selectedTab={selectedTab}
        onSelectedTabChange={setSelectedTab}
      />
      )}
      DetailToolbar={({ id, pages }) => (
        <>
          {<Typography
            variant="h6"
            sx={{
              flex: '1 1 auto',
              alignSelf: 'center',
              m: 1,
              maxLines: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {showNumItems(pages.length, 'page')}
          </Typography>}

          <EditComicDialog
            title="Edit Comic"
            buttonIcon={<EditIcon />}
            buttonText="Edit"
            comicId={id}
          />

          <DeleteComic comicId={id} />
        </>
      )}
    />
  );
}

export default Library;
