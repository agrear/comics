import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import { Form, Formik, FormikHelpers } from 'formik';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

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

export function Wizard<T extends object>({
  initialValues,
  steps,
  onSubmit,
  children
}: WizardProps<T>) {
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
            sx={{ p: 0, mb: 2 }}
          >
            {steps.map(({ label }) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              m: 2,
              height: theme => theme.spacing(52),
              overflow: 'hidden'
            }}
          >
            <AnimatePresence exitBeforeEnter custom={direction}>
              <motion.div
                key={page}
                initial="hidden"
                animate="enter"
                exit="exit"
                custom={direction}
                variants={variants}
                style={{ flexGrow: 1 }}
              >
                {activePage}
              </motion.div>
            </AnimatePresence>
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 2,
              m: 2
            }}
          >
            <Button
              disabled={page === 0}
              onClick={goToPreviousPage}
              sx={{ width: 80 }}
            >
              Back
            </Button>

            <Button
              disabled={isSubmitting}
              variant="contained"
              color="secondary"
              type="submit"
              sx={{ width: 80, mr: 1 }}
            >
              {isLastPage ? 'Finish' : 'Next'}
            </Button>
          </Box>
        </Form>
      )}
    </Formik>
  );
}

export default Wizard;
