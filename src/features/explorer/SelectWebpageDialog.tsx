import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import Zoom from '@material-ui/core/Zoom';
import { makeStyles, Theme } from '@material-ui/core/styles';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { getReasonPhrase } from 'http-status-codes';
import { matchSorter } from 'match-sorter';
import { useSnackbar } from 'notistack';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  newPageCanceled,
  previousWebpageSelected,
  selectNavigation,
  selectSelectedPage,
  selectStatusCode,
  selectWebpageCanceled,
  selectWebpageHistory,
  urlSelected,
  webpageSelected,
  webpageUpdated
} from './explorerSlice';
import { Comic, Page } from '../comic/comicSlice';
import { selectDownloader } from '../downloader/downloaderSlice';

const useStyles = makeStyles((theme: Theme) => ({
  dialog: {
    userSelect: 'none'
  },
  content: {
    display: 'grid',
    rowGap: theme.spacing(2),
    minWidth: theme.breakpoints.values.sm,
    padding: theme.spacing(1, 3),
    overflow: 'visible'
  },
  navigation: {
    display: 'flex',
    alignItems: 'center'
  },
  backButton: {
    marginRight: theme.spacing(1)
  },
  actions: {
    padding: theme.spacing(3)
  },
  endAdornment: {
    top: '50%',
    transform: 'translate(0, -50%)'
  },
  url: {
    cursor: 'pointer'
  }
}));

interface BackButtonProps {
  disabled: boolean;
  onClick: () => void;
}

function BackButton({ disabled, onClick }: BackButtonProps) {
  const classes = useStyles();

  const [hovering, setHovering] = React.useState(false);

  return (
    <Tooltip title="Go back" open={hovering}>
      <span>
        <IconButton
          size="small"
          disabled={disabled}
          className={classes.backButton}
          onClick={onClick}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          <ArrowBackIcon />
        </IconButton>
      </span>
    </Tooltip>
  );
}

interface SelectNodeDialogProps {
  comic: Comic;
}

export function SelectWebpageDialog({ comic }: SelectNodeDialogProps) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const navigation = useSelector(selectNavigation);
  const downloader = useSelector(selectDownloader);

  const history = useSelector(selectWebpageHistory);
  const selectedPage = useSelector(selectSelectedPage);
  const statusCode = useSelector(selectStatusCode);

  const [open, setOpen] = React.useState(false);

  const webpage: Webpage | undefined = history[history.length - 1];
  const downloading = downloader.running;
  const loading = open && (downloading || webpage === undefined);

  const [value, setValue] = React.useState<string | null>(null);
  const [inputValue, setInputValue] = React.useState('');

  const lastPage: Page | undefined = comic.pages[comic.pages.length - 1];
  const url = React.useMemo(() => (
    webpage?.url ?? selectedPage?.url ?? lastPage?.url ?? comic.url
  ), [comic.url, lastPage, selectedPage, webpage]);

  const options = React.useMemo(() => (
    Array.from(new Set([
      ...(webpage?.links?.map(({ href }) => href) ?? []),
      ...(webpage?.inlineFrames?.map(({ src }) => src) ?? [])
    ]))
  ), [webpage]);

  const handleClose = () => {
    if (selectedPage === null) {
      dispatch(newPageCanceled());
    } else {
      dispatch(selectWebpageCanceled());
    }
  };

  return (
    <Dialog
      open={navigation === 'selectWebpage'}
      maxWidth="lg"
      onClose={handleClose}
      className={classes.dialog}
    >
      <DialogTitle>
        {selectedPage ? `Edit page ${selectedPage.number + 1}` : 'Create new page'}
      </DialogTitle>

      <DialogContent className={classes.content}>
        <Typography>
          URL: <span
            className={classes.url}
            onClick={() => {
              window.comicsApi.copyToClipboard(url);
              enqueueSnackbar('URL copied to clipboard', {
                anchorOrigin: { horizontal: 'center', vertical: 'bottom' },
                autoHideDuration: 2500,
                TransitionComponent: Zoom as any,
                variant: 'info'
              });
            }}>
              {url}
            </span>
        </Typography>
        <Typography>
          Images: {webpage?.images?.length ?? 'N/A'}
        </Typography>
        {statusCode && (
          <Typography color="error">
            Error fetching node: {getReasonPhrase(statusCode)}
          </Typography>
        )}

        <div className={classes.navigation}>
          <BackButton
            disabled={history.length <= 1}
            onClick={() => dispatch(previousWebpageSelected())}
          />
          <Autocomplete
            fullWidth
            open={open}
            loading={loading}
            value={value}
            onOpen={() => {
              if (!downloading && history.length === 0) {
                dispatch(urlSelected({
                  url,
                  comicId: comic.id,
                  pageId: selectedPage && selectedPage.id
                }));
              }

              setOpen(true);
            }}
            onClose={() => setOpen(false)}
            onChange={(event, newValue) => {
              if (newValue !== null) {
                dispatch(urlSelected({
                  url: newValue,
                  comicId: comic.id,
                  pageId: selectedPage && selectedPage.id
                }));

                setValue(null);
                setInputValue('');
              }
            }}
            filterOptions={(options, state) => (
              matchSorter(options, state.inputValue)
            )}
            getOptionSelected={(option, value) => option === value}
            options={options}
            classes={{ endAdornment: classes.endAdornment }}
            inputValue={inputValue}
            onInputChange={(event, newInputValue) => {
              setInputValue(newInputValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select a URL"
                variant="outlined"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </div>
      </DialogContent>

      <DialogActions className={classes.actions}>
        <Button onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={
            downloading ||
            webpage === undefined ||
            webpage.images.length === 0 ||
            webpage.url === selectedPage?.url
          }
          onClick={() => {
            if (selectedPage === null) {  // Create new page
              dispatch(webpageSelected({ comicId: comic.id, webpage }));
            } else {  // Update page
              dispatch(webpageUpdated({ page: selectedPage!, url }));
            }
          }}
        >
          Select
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SelectWebpageDialog;
