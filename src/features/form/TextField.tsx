import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput, { OutlinedInputProps } from '@mui/material/OutlinedInput';
import { useField } from 'formik';
import React from 'react';

interface TextFieldProps extends OutlinedInputProps {
  label: string;
}

export function TextField({ label, ...props }: TextFieldProps) {
  const [field, meta] = useField(props as any);

  return (
    <FormControl error={meta.touched && meta.error !== undefined}>
      <InputLabel htmlFor={props.id || props.name}>
        {label}
      </InputLabel>
      <OutlinedInput
        inputProps={{...field}}
        {...props}
      />
      {meta.touched && meta.error ? (
        <FormHelperText color="error">
          {meta.error}
        </FormHelperText>
      ) : null}
    </FormControl>
  );
}

export default TextField;
