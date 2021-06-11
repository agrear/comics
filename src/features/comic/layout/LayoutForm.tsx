import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import ImageIcon from '@material-ui/icons/ImageSharp';
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

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    form: {
      display: "flex",
      flexDirection: "column",
      height: "100%"
    },
    content: {
      display: "flex",
      margin: theme.spacing(3, 0),
      padding: theme.spacing(1, 3)
    },
    fields: {
      display: "flex",
      flexDirection: "column"
    },
    demo: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexGrow: 1
    },
    actions: {
      display: "flex",
      justifyContent: "flex-end",
      margin: theme.spacing(2)
    },
    mockContainer: {
      position: "relative",
      display: "flex",
      border: "2px solid white"
    },
    mockImage: {
      display: "flex",
      width: "100%",
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
      opacity: 0.5,
      border: "1px solid white",
      zIndex: theme.zIndex.tooltip,
      pointerEvents: "none"
    },
    imageIcon: {
      minWidth: "initial"
    },
    positionPoint: {
      position: "absolute",
      width: 16,
      height: 16,
      borderRadius: "50%"
    }
  })
);

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
  const classes = useStyles();

  const container = { width: 180, height: 140 };
  const image = { width: 80, height: 100 };
  const size = fitObjectSize(values.fit, container, image);

  return (
    <div
      style={{
        ...container,
        alignItems: getVerticalAlignment(values.position),
        justifyContent: getHorizontalAlignment(values.position)
      }}
      className={classes.mockContainer}
    >
      <motion.div layout style={size} className={classes.mockImage}>
        <ImageIcon />
      </motion.div>
      {positionPoints.map(({ position, style }) => (
        <motion.div
          key={position}
          style={{
            ...style,
            backgroundColor: position === values.position ? 'red' : 'white'
          }}
          whileHover={{ scale: 1.2 }}
          onClick={() => setFieldValue('position', position)}
          className={classes.positionPoint}
        />
      ))}
    </div>
  );
}

interface LayoutFormProps {
  comicId: EntityId;
  layout: Layout;
  onSubmit: () => void;
}

export function LayoutForm({ comicId, layout, onSubmit }: LayoutFormProps) {
  const classes = useStyles();
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
        <Form onSubmit={handleSubmit} className={classes.form}>
          <div className={classes.content}>
            <div className={classes.fields}>
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
            </div>
            <div className={classes.demo}>
              <Demo values={values} setFieldValue={setFieldValue} />
            </div>
          </div>

          <div className={classes.actions}>
            <Button
              disabled={isSubmitting}
              variant="contained"
              color="primary"
              type="submit"
            >
              Save
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}

export default LayoutForm;
