import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import OutlinedInput, { OutlinedInputProps } from '@material-ui/core/OutlinedInput';
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
