import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Input, { InputProps } from '@mui/material/Input';
import Typography from '@mui/material/Typography';
import GetAppIcon from '@mui/icons-material/GetApp';
import ImageIcon from '@mui/icons-material/Image';
import { useField } from 'formik';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import React from 'react';
import { useDropzone } from 'react-dropzone';

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
  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={overlayVariants}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: 'hsla(0, 0%, 13%, 0.75)',
        zIndex: 2
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <GetAppIcon fontSize="large" />
        <Typography align="center" sx={{ whiteSpace: 'pre-line' }}>
          Drop image here
        </Typography>
      </Box>
    </motion.div>
  );
}

function Placeholder({ isDragActive }: { isDragActive: boolean }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      {isDragActive ? <GetAppIcon fontSize="large" /> : <ImageIcon fontSize="large" />}
      
      <Typography align="center" sx={{ whiteSpace: 'pre-line' }}>
        {isDragActive ? 'Drop image here' : 'Click to browse or\ndrag image here'}
      </Typography>
    </Box>
  );
}

export interface ImagePickerProps extends InputProps {
  label: string;
}

export function ImagePicker({ label, ...props }: ImagePickerProps) {
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

  const { color: _rootColor, ...rootProps } = getRootProps({
    style: {
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
    }
  });

  const { color: _inputColor, ...inputProps } = getInputProps({
    style: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      opacity: 0
    }
  });

  return (
    <FormControl error={meta.touched && meta.error !== undefined} {...rootProps}>
      <Input inputProps={{...inputProps}} {...props} />
      
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
          style={{
            position: 'absolute',
            objectFit: 'contain',
            maxWidth: '100%',
            maxHeight: '100%'
          }}
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
