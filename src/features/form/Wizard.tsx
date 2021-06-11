import Button from '@material-ui/core/Button';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Stepper from '@material-ui/core/Stepper';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Form, Formik, FormikHelpers } from 'formik';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    stepper: {
      padding: 0,
      marginBottom: theme.spacing(2)
    },
    fields: {
      display: "flex",
      flexDirection: "column",
      position: "relative",
      margin: theme.spacing(2),
      height: theme.spacing(52),
      overflow: "hidden"
    },
    page: {
      flexGrow: 1
    },
    buttons: {
      display: "flex",
      justifyContent: "flex-end",
      margin: theme.spacing(2)
    },
    backButton: {
      width: 80,
      marginRight: theme.spacing(1)
    },
    nextButton: {
      width: 80
    }
  })
);

const variants = {
  hidden: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%"
  }),
  enter: {
    x: 0,
    transition: {
      type: "tween",
      ease: "easeOut",
      duration: 0.3
    }
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-100%" : "100%",
    transition: {
      type: "tween",
      ease: "easeIn",
      duration: 0.15
    }
  })
};

interface WizardProps<T> {
  initialValues: T;
  steps: {
    label: string;
    validationSchema?: any;
  }[];
  onSubmit: (values: T, actions: FormikHelpers<T>) => void;
  children: React.ReactNode;
}

export function Wizard<T extends object>({ initialValues, steps, onSubmit, children }: WizardProps<T>) {
  const classes = useStyles();
  const [page, setPage] = React.useState(0);
  const [direction, setDirection] = React.useState(0);
  const [values, setValues] = React.useState(initialValues);

  const activePage = React.useMemo(() => (
    React.Children.toArray(children)[page]
  ), [children, page]);

  const isLastPage = React.useMemo(() => (
    page === React.Children.count(children) - 1
  ), [children, page]);

  const step = React.useMemo(() => steps[page], [page, steps]);

  const goToNextPage = (values: T) => {
    setValues(values);
    setDirection(1);
    setPage(prevPage => Math.min(prevPage + 1, React.Children.count(children) - 1));
  };

  const goToPreviousPage = () => {
    setDirection(-1);
    setPage(prevPage => Math.max(prevPage - 1, 0));
  };

  const handleSubmit = (values: T, bag: FormikHelpers<T>) => {
    if (isLastPage) {
      return onSubmit(values, bag);
    }

    bag.setTouched({});
    bag.setSubmitting(false);
    goToNextPage(values);
  };

  return (
    <Formik
      initialValues={values}
      enableReinitialize={false}
      validationSchema={step.validationSchema}
      onSubmit={handleSubmit}
    >
      {({ handleSubmit, isSubmitting, values }) => (
        <Form onSubmit={handleSubmit}>
          <Stepper
            activeStep={page}
            alternativeLabel
            className={classes.stepper}
          >
            {steps.map(({ label }) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <div className={classes.fields}>
            <AnimatePresence exitBeforeEnter custom={direction}>
              <motion.div
                key={page}
                initial="hidden"
                animate="enter"
                exit="exit"
                custom={direction}
                variants={variants}
                className={classes.page}
              >
                {activePage}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className={classes.buttons}>
            <Button
              disabled={page === 0}
              onClick={goToPreviousPage}
              className={classes.backButton}
            >
              Back
            </Button>
            <Button
              disabled={isSubmitting}
              variant="contained"
              color="primary"
              type="submit"
              className={classes.nextButton}
            >
              {isLastPage ? 'Finish' : 'Next'}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}

export default Wizard;
