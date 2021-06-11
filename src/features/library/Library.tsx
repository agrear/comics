import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Link from '@material-ui/core/Link';
import Slider from '@material-ui/core/Slider';
import Switch from '@material-ui/core/Switch';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import { makeStyles, Theme } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
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

const useStyles = makeStyles((theme: Theme) => ({
  text: {
    textOverflow: "ellipsis"
  },
  comics: {
    flex: "1 1 auto",
    alignSelf: "center",
    margin: theme.spacing(1),
    maxLines: 1,
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
  pages: {
    flex: "1 1 auto",
    alignSelf: "center",
    margin: theme.spacing(1),
    maxLines: 1,
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
  tabs: {
    marginLeft: theme.spacing(1)
  },
  grid: {
    display: 'grid',
    gridAutoFlow: 'row',
    alignItems: 'start',
    alignContent: 'start',
    gridRowGap: theme.spacing(3),
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(2)
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  synopsis: {
    maxWidth: 1024
  },
  switch: {
    maxWidth: 800,
    justifySelf: 'start',
    margin: 0
  },
  slider: {
    maxWidth: 800
  }
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
  const classes = useStyles();
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
      className={classes.tabs}
    >
      <Tab label="General" className={classes.grid}>
        <Typography variant="h2">{title}</Typography>
        <Typography variant="h4">{`by ${author}`}</Typography>
        <Typography variant="h6">
          <Link href={url} rel="noreferrer" target="_blank">{url}</Link>
        </Typography>
        <Typography variant="body1" className={classes.synopsis}>
          {synopsis}
        </Typography>
        <Tags>{tags}</Tags>
      </Tab>

      <Tab label="Updates" className={classes.grid}>
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
          className={classes.switch}
        />

        <FormGroup className={classes.group}>
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
            className={classes.switch}
          />

          <Slider
            value={limit}
            disabled={!updates.enabled || limit === -1}
            min={1}
            max={99}
            valueLabelDisplay="auto"
            onBlur={() => dispatch(
              comicUpdatesUpdated({ comicId: id, updates: { limit } })
            )}
            onChange={(event, value) => setLimit(value as number)}
            className={classes.slider}
          />
        </FormGroup>

        <FormGroup className={classes.group}>
          <Typography gutterBottom>Update interval (hours)</Typography>
          <Slider
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
            className={classes.slider}
          />
        </FormGroup>

        <FormGroup className={classes.group}>
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
        </FormGroup>
      </Tab>
    </TabbedPage>
  );
}

function Library() {
  const classes = useStyles();
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
            className: classes.text
          }}
          secondary={`by ${author}`}
          secondaryTypographyProps={{
            noWrap: true,
            className: classes.text
          }}
        />
      )}
      MasterToolbar={({ items }) => (
        <>
          <Typography variant="h6" className={classes.comics}>
            {showNumItems(items.length, 'comic')}
          </Typography>
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
          {<Typography variant="h6" className={classes.pages}>
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
