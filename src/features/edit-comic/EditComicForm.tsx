import Box from '@mui/material/Box';
import { EntityId } from '@reduxjs/toolkit';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';

import ImagePicker from './ImagePicker';
import { comicEditFormSubmitted, selectComic } from '../comic/comicSlice';
import TextField from '../form/TextField';
import Wizard from '../form/Wizard';
import { identity } from 'utils';

const steps = [
  {
    label: 'Add comic info',
    validationSchema: Yup.object({
      title: Yup.string()
        .max(64, 'Must be 64 characters or less.')
        .required('Please enter a title.'),
      author: Yup.string()
        .required('Please enter an author.'),
      url: Yup.string()
        .url('Please enter a valid URL.')
        .required('Please enter a URL.')
      })
  },
  { label: 'Add meta info' },
  {
    label: 'Pick a cover',
    validationSchema: Yup.object({
      cover: Yup.object()
        .required('Please add an image.')
        .nullable()
    })
  }
];

interface FormValues {
  url: string;
  author: string;
  title: string;
  synopsis: string;
  tags: string;
  cover: { url: string } | null;
}

interface EditComicFormProps {
  comicId?: EntityId;
}

export function EditComicForm({ comicId }: EditComicFormProps) {
  const dispatch = useDispatch();
  const comic = useSelector(selectComic(comicId));

  return (
    <Wizard
      initialValues={identity<FormValues>({
        title: comic?.title ?? '',
        author: comic?.author ?? '',
        url: comic?.url ?? '',
        synopsis: comic?.synopsis ?? '',
        tags: comic?.tags.join(', ') ?? '',
        cover: (comic?.cover && { url: comic.cover.url }) ?? null
      })}
      steps={steps}
      onSubmit={(values, actions) => {
        const { synopsis, tags, cover, ...meta } = values;

        dispatch(comicEditFormSubmitted({
          id: comicId,
          ...meta,
          synopsis: synopsis.trim() === '' ? null : synopsis,
          tags: Array.from(new Set(
            tags.split(',').map(t => t.trim()).filter(t => t !== '')
          )),
          cover: cover!
        }));
      }}
    >
      <>
        <TextField name="title" label="Title" type="text" />
        <TextField name="author" label="Author" type="text" />
        <TextField
          name="url"
          label="Website"
          type="url"
          placeholder="http://example.com/"
        />
      </>
      <>
        <TextField
          name="synopsis"
          label="Synopsis"
          type="text"
          multiline
          rows={5}
        />
        <TextField
          name="tags"
          label="Tags"
          type="text"
          placeholder="Tag 1, Tag 2, ..."
        />
      </>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%'
        }}
      >
        <ImagePicker label="Cover" name="cover" />
      </Box>
    </Wizard>
  );
}

export default EditComicForm;
