import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Zoom from '@mui/material/Zoom';
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

interface BackButtonProps {
  disabled: boolean;
  onClick: () => void;
}

function BackButton({ disabled, onClick }: BackButtonProps) {
  const [hovering, setHovering] = React.useState(false);

  return (
    <Tooltip title="Go back" open={hovering}>
      <span>
        <IconButton
          size="small"
          disabled={disabled}
          onClick={onClick}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          sx={{ mr: 1 }}
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
      sx={{ userSelect: 'none' }}
    >
      <DialogTitle>
        {selectedPage ? `Edit page ${selectedPage.number + 1}` : 'Create new page'}
      </DialogTitle>

      <DialogContent
        sx={{
          display: 'grid',
          rowGap: 2,
          minWidth: theme => theme.breakpoints.values.sm,
          px: 3,
          py: 1,
          overflow: 'visible'
        }}
      >
        <Typography>
          URL: <Box
            component="span"
            sx={{ cursor: 'pointer' }}
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
            </Box>
        </Typography>
        <Typography>
          Images: {webpage?.images?.length ?? 'N/A'}
        </Typography>
        {statusCode && (
          <Typography color="error">
            Error fetching node: {getReasonPhrase(statusCode)}
          </Typography>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
            options={options}
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
            sx={{
              '& .MuiAutocomplete-endAdornment': {
                top: '50%',
                transform: 'translate(0, -50%)'
              }
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
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
