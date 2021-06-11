import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input, { InputProps } from '@material-ui/core/Input';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import GetAppIcon from '@material-ui/icons/GetApp';
import ImageIcon from '@material-ui/icons/Image';
import { useField } from 'formik';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import React from 'react';
import { useDropzone } from 'react-dropzone';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      width: 400,
      height: 400,
      border: '2px dashed',
      borderRadius: '10px',
      outline: 'none',
      cursor: 'pointer',
      userSelect: 'none',
      overflow: 'hidden'
    },
    input: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      opacity: 0
    },
    image: {
      position: 'absolute',
      objectFit: 'contain',
      maxWidth: '100%',
      maxHeight: '100%'
    },
    overlay: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      width: '100%',
      height: '100%',
      background: 'hsla(0, 0%, 13%, 0.75)',
      zIndex: 2
    },
    center: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    text: {
      whiteSpace: 'pre-line'
    }
  })
);

const imageVariants: Variants = {
  initial: {
    scale: 0
  },
  enter: {
    scale: 1,
    zIndex: 1,
    transition: {
      type: 'tween',
      ease: 'easeOut',
      duration: 0.3
    }
  },
  exit: {
    opacity: 0,
    scale: 1.25,
    transition: {
      type: 'tween',
      ease: 'easeIn',
      duration: 0.15
    }
  }
};

const overlayVariants: Variants = {
  initial: {
    opacity: 0
  },
  enter: {
    opacity: 1,
    transition: {
      type: 'tween',
      ease: 'easeOut',
      duration: 0.3
    }
  },
  exit: {
    opacity: 0,
    transition: {
      type: 'tween',
      ease: 'easeIn',
      duration: 0.15
    }
  }
};

function DropIndicator() {
  const classes = useStyles();

  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={overlayVariants}
      className={classes.overlay}
    >
      <div className={classes.center}>
        <GetAppIcon fontSize="large" />
        <Typography align="center" className={classes.text}>
          Drop image here
        </Typography>
      </div>
    </motion.div>
  );
}

function Placeholder({ isDragActive }: { isDragActive: boolean }) {
  const classes = useStyles();

  return (
    <div className={classes.center}>
      {isDragActive ? <GetAppIcon fontSize="large" /> : <ImageIcon fontSize="large" />}
      <Typography align="center" className={classes.text}>
        {isDragActive ? 'Drop image here' : 'Click to browse or\ndrag image here'}
      </Typography>
    </div>
  );
}

export interface ImagePickerProps extends InputProps {
  label: string;
}

export function ImagePicker({ label, ...props }: ImagePickerProps) {
  const classes = useStyles();
  const [field, meta, helpers] = useField(props as any);
  const [key, setKey] = React.useState(Math.random());
  const [isMounting, setIsMounting] = React.useState(true);

  React.useEffect(() => {
    setIsMounting(false);
  }, []);

  const onDrop = React.useCallback(acceptedFiles => {
    const file = acceptedFiles[0];
    const reader = new FileReader();

    reader.onabort = () => console.warn('file reading was aborted');
    reader.onerror = () => console.error('file reading has failed');
    reader.onload = e => {
      if (e.target === null) {
        return;
      }

      if (e.target.result !== null && !(e.target.result instanceof ArrayBuffer)) {
        setKey(Math.random());
        helpers.setValue({ url: e.target.result });
      }
    }

    reader.readAsDataURL(file);
  }, [helpers]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: "image/*",
    multiple: false,
    onDrop
  });

  const { color: rootColor, ...rootProps } = getRootProps({
    className: classes.root
  });

  const { color: inputColor, style, ...inputProps } = getInputProps({
    className: classes.input
  });

  return (
    <FormControl error={meta.touched && meta.error !== undefined} {...rootProps}>
      <Input
        inputProps={{...inputProps}}
        {...props}
        className={classes.input}
      />
      {field.value === null ? <Placeholder isDragActive={isDragActive} /> : null}
      <AnimatePresence>
        <motion.img
          key={key}
          src={(field.value && field.value.url) || undefined}
          alt=""
          initial={field.value !== null && isMounting ? 'enter' : 'initial'}
          animate={field.value !== null ? 'enter' : 'initial'}
          exit="exit"
          variants={imageVariants}
          className={classes.image}
        />
        {field.value !== null && isDragActive ? <DropIndicator key="overlay" /> : null}
      </AnimatePresence>
      {meta.touched && meta.error && (
        <FormHelperText>{meta.error}</FormHelperText>
      )}
    </FormControl>
  );
}

export default ImagePicker;
