import ImageIcon from '@mui/icons-material/ImageSharp';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { useTheme } from '@mui/material/styles';
import { EntityId } from '@reduxjs/toolkit';
import { Form, Formik } from 'formik';
import { motion, MotionStyle } from 'framer-motion';
import React from 'react';
import { useDispatch } from 'react-redux';

import { comicLayoutUpdated } from '../comicSlice';
import {
  fitObjectSize,
  getHorizontalAlignment,
  getVerticalAlignment,
  identity,
  Layout,
  ObjectFit,
  ObjectPosition
} from 'utils';

interface FormValues {
  fit: ObjectFit;
  position: ObjectPosition;
}

type Point = { position: ObjectPosition, style: MotionStyle };
const pointOverlap = 8;
const positionPoints: Point[] = [
  { position: "left top", style: { top: -pointOverlap, left: -pointOverlap } },
  { position: "center top", style: { top: -pointOverlap, left: `calc(50% - ${pointOverlap}px)` } },
  { position: "right top", style: { top: -pointOverlap, right: -pointOverlap } },
  { position: "left center", style: { top: `calc(50% - ${pointOverlap}px)`, left: -pointOverlap } },
  { position: "center center", style: { top: `calc(50% - ${pointOverlap}px)`, left: `calc(50% - ${pointOverlap}px)` } },
  { position: "right center", style: { top: `calc(50% - ${pointOverlap}px)`, right: -pointOverlap } },
  { position: "left bottom", style: { bottom: -pointOverlap, left: -pointOverlap } },
  { position: "center bottom", style: { bottom: -pointOverlap, left: `calc(50% - ${pointOverlap}px)` } },
  { position: "right bottom", style: { bottom: -pointOverlap, right: -pointOverlap } }
];

interface DemoProps {
  values: FormValues;
  setFieldValue: (field: string, value: any, shouldValidate?: boolean | undefined) => void;
}

function Demo({ values, setFieldValue }: DemoProps) {
  const theme = useTheme();

  const container = { width: 180, height: 140 };
  const image = { width: 80, height: 100 };
  const size = fitObjectSize(values.fit, container, image);

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        border: "2px solid white",
        ...container,
        alignItems: getVerticalAlignment(values.position),
        justifyContent: getHorizontalAlignment(values.position)
      }}
    >
      <motion.div
        layout
        style={{
          ...size,
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0.5,
          border: "1px solid white",
          zIndex: theme.zIndex.tooltip,
          pointerEvents: "none"
        }}
      >
        <ImageIcon />
      </motion.div>
      {positionPoints.map(({ position, style }) => (
        <motion.div
          key={position}
          style={{
            ...style,
            backgroundColor: position === values.position ? 'red' : 'white',
            position: "absolute",
            width: 16,
            height: 16,
            borderRadius: "50%"
          }}
          whileHover={{ scale: 1.2 }}
          onClick={() => setFieldValue('position', position)}
        />
      ))}
    </Box>
  );
}

interface LayoutFormProps {
  comicId: EntityId;
  layout: Layout;
  onSubmit: () => void;
}

export function LayoutForm({ comicId, layout, onSubmit }: LayoutFormProps) {
  const dispatch = useDispatch();

  return (
    <Formik
      initialValues={identity<FormValues>({
        fit: layout.fit,
        position: layout.position
      })}
      onSubmit={(values, actions) => {
        dispatch(comicLayoutUpdated({
          comicId, layout: { ...layout, ...values }
        }));

        onSubmit();
      }}
    >
      {({ handleChange, handleSubmit, isSubmitting, setFieldValue, values }) => (
        <Form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%"
          }}
        >
          <Box sx={{ display: "flex", my: 3, px: 3, py: 1 }}>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Fit</FormLabel>
                <RadioGroup name="fit" value={values.fit} onChange={handleChange}>
                  <FormControlLabel value="none" control={<Radio />} label="None" />
                  <FormControlLabel value="contain" control={<Radio />} label="Contain" />
                  <FormControlLabel value="cover" control={<Radio />} label="Cover" />
                  <FormControlLabel value="fill" control={<Radio />} label="Fill" />
                  <FormControlLabel value="scale-down" control={<Radio />} label="Scale down" />
                </RadioGroup>
              </FormControl>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexGrow: 1
              }}
            >
              <Demo values={values} setFieldValue={setFieldValue} />
            </Box>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end", m: 2 }}>
            <Button
              disabled={isSubmitting}
              variant="contained"
              color="primary"
              type="submit"
            >
              Save
            </Button>
          </Box>
        </Form>
      )}
    </Formik>
  );
}

export default LayoutForm;
