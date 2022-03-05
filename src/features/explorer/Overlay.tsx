import CancelIcon from '@mui/icons-material/Cancel';
import PostAddIcon from '@mui/icons-material/PostAdd';
import UpdateIcon from '@mui/icons-material/Update';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { formatDistance } from 'date-fns';
import { motion, Variants } from 'framer-motion';
import { getReasonPhrase } from 'http-status-codes';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Comic } from '../comic/comicSlice';
import { ResponseState } from '../downloader/downloaderSlice';
import {
  selectUpdater,
  UpdateMode,
  updaterStarted,
  updaterStopped
} from '../updater/updaterSlice';
import { getFutureDate } from 'utils';

const variants: Variants = {
  hidden: {
    opacity: 0
  },
  inactive: {
    opacity: 0.5,
  },
  active: {
    opacity: 1
  }
};

interface OverlayProps {
  comic: Comic;
}

export function Overlay({ comic }: OverlayProps) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const updater = useSelector(selectUpdater(comic.id))!;

  const [showTooltip, setShowTooltip] = React.useState(false);

  const { request, running } = updater;

  const nextAutoUpdate = comic.updates.enabled ? (
    getFutureDate(comic.updates.interval, comic.updated ?? comic.created)
  ) : null;

  const updateStatus = React.useMemo(() => {
    let status = '';

    if (request?.mode === UpdateMode.SinglePage) {
      if (request !== undefined) {
        if (request.response === undefined) {
          status = request.progress ?? 'Fetching next page...';
        } else {
          const { message, state, statusCode } = request.response;
          switch (state) {
            case ResponseState.Canceled: {
              status = 'Update canceled';
              break;
            }
            case ResponseState.Error: {
              status = 'Error fetching next page';
              if (statusCode !== undefined) {
                status += `: ${getReasonPhrase(statusCode)}`;
              }
              break;
            }
            case ResponseState.Success: {
              status = message ?? 'Update completed';
              break;
            }
            case ResponseState.Timeout: {
              status = 'Connection timed out';
              break;
            }
          }
        }
      }
    } else if (request?.mode === UpdateMode.MultiplePages) {
      if (request !== undefined) {
        if (request.response === undefined) {
          status = request.progress ?? 'Updating comic...';
        } else {
          const { message, state, statusCode } = request.response;
          switch (state) {
            case ResponseState.Canceled: {
              status = 'Update canceled';
              break;
            }
            case ResponseState.Error: {
              status = 'Error updating comic';
              if (statusCode !== undefined) {
                status += `: ${getReasonPhrase(statusCode)}`;
              }
              break;
            }
            case ResponseState.Success: {
              status = message ?? 'Update completed';
              break;
            }
            case ResponseState.Timeout: {
              status = 'Connection timed out';
              break;
            }
          }
        }
      }
    }

    return status;
  }, [request]);

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="inactive"
      whileHover="active"
      layout
      style={{
        position: 'absolute',
        bottom: theme.spacing(2),
        right: theme.spacing(3)
      }}
    >
      <Paper
        elevation={3}
        square
        sx={{
          display: 'grid',
          gridTemplateAreas: `
            'fetchNextPageButton updateComicButton'
            'updateStatus updateStatus'
            'cancelButton cancelButton'
          `,
          gridTemplateColumns: '1fr 1fr',
          gridGap: theme => theme.spacing(3),
          justifyItems: 'center',
          p: 2,
          minWidth: 440,
          maxWidth: 440
        }}
      >
        <Button
          component={motion.button}
          layout
          variant="contained"
          fullWidth
          startIcon={
            request?.mode === UpdateMode.SinglePage && running ? (
              <CircularProgress size="1em" />
            ) : <PostAddIcon />
          }
          disabled={running}
          onClick={() => dispatch(updaterStarted({
            comicId: comic.id, mode: UpdateMode.SinglePage
          }))}
          sx={{
            gridArea: 'fetchNextPageButton',
            whiteSpace: 'nowrap'
          }}
        >
          Fetch next page
        </Button>

        <Tooltip
          arrow
          placement="top"
          open={!running && showTooltip}
          title={
            nextAutoUpdate !== null ? (
              `Next update in ${formatDistance(nextAutoUpdate, new Date())}`
            ) : 'No update scheduled'
          }
        >
          <Button
            component={motion.button}
            layout
            variant="contained"
            color="primary"
            fullWidth
            startIcon={
              request?.mode === UpdateMode.MultiplePages && running ? (
                <CircularProgress size="1em" />
              ) : <UpdateIcon />
            }
            disabled={running}
            onClick={() => {
              setShowTooltip(false);
              dispatch(updaterStarted({
                comicId: comic.id, mode: UpdateMode.MultiplePages
              }));
            }}
            onHoverStart={() => {
              if (!running) {
                setShowTooltip(true);
              }
            }}
            onHoverEnd={() => setShowTooltip(false)}
            sx={{
              gridArea: 'updateComicButton',
              whiteSpace: 'nowrap'
            }}
          >
            Update comic
          </Button>
        </Tooltip>

        <Typography
          component={motion.span}
          layout
          align="center"
          sx={{
            gridArea: 'updateStatus',
            justifySelf: 'stretch'
          }}
        >
          {updateStatus}
        </Typography>

        <Button
          component={motion.button}
          layout
          variant="text"
          startIcon={<CancelIcon />}
          disabled={!running}
          onClick={() => dispatch(updaterStopped({ comicId: comic.id }))}
          sx={{
            gridArea: 'cancelButton',
            '&:hover': {
              backgroundColor: 'error.main'
            }
          }}
        >
          Cancel
        </Button>
      </Paper>
    </motion.div>
  );
}

export default Overlay;
