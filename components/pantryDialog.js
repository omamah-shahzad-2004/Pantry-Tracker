/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useState, useEffect } from 'react';
import { Avatar, Button, Dialog, DialogActions, DialogContent, Stack, TextField, Typography } from '@mui/material';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import DatePicker from '@mui/lab/DatePicker';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import { useAuth } from '../firebase/auth';
import { addPantryItem, updatePantryItem } from '../firebase/firestore';
import { replaceImage, uploadImage } from '../firebase/storage';
import { PANTRY_ITEM_ENUM } from '../pages/dashboard';
import styles from '../styles/expenseDialog.module.scss';

const DEFAULT_FILE_NAME = "No file selected";

// Default form state for the dialog
const DEFAULT_FORM_STATE = {
  fileName: DEFAULT_FILE_NAME,
  file: null,
  date: null,
  ItemName: "",
  quantity: "",
};

/* 
 Dialog to input pantry item information
 
 props:
  - edit is the pantry item to edit
  - showDialog boolean for whether to show this dialog
  - onError emits to notify error occurred
  - onSuccess emits to notify successfully saving receipt
  - onCloseDialog emits to close dialog
 */
export default function PantryDialog(props) {
  const {authUser} = useAuth();
  const isEdit = Object.keys(props.edit).length > 0;
  const [formFields, setFormFields] = useState(isEdit ? props.edit : DEFAULT_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If the pantry item to edit or whether to close or open the dialog ever changes, reset the form fields
  useEffect(() => {
    if (props.showDialog) {
      setFormFields(isEdit ? props.edit : DEFAULT_FORM_STATE);
    }
  }, [props.edit, props.showDialog])

  // Check whether any of the form fields are unedited
  const isDisabled = () => formFields.fileName === DEFAULT_FILE_NAME || !formFields.date || formFields.ItemName.length === 0 
                     formFields.quantity.length === 0;

  // Update given field in the form
  const updateFormField = (event, field) => {
    setFormFields(prevState => ({...prevState, [field]: event.target.value}))
  }

  // Set the relevant fields for pantry item image
  const setFileData = (target) => {
    const file = target.files[0];
    setFormFields(prevState => ({...prevState, fileName: file.name}));
    setFormFields(prevState => ({...prevState, file}));
  }

  const closeDialog = () => {
    setIsSubmitting(false);
    props.onCloseDialog();
  }

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      if(isEdit) {
        if(formFields.fileName) {
          await replaceImage(formFields.file, formFields.imageBucket);
        }
        await updatePantryItem(formFields.id, authUser.uid, formFields.date, formFields.ItemName, formFields.quantity, formFields.imageBucket);
      }
      else {
        const bucket = await uploadImage(formFields.file, authUser.uid);
        await addPantryItem(authUser.uid, formFields.date, formFields.ItemName, formFields.quantity, bucket);
      }
      props.onSuccess(isEdit? PANTRY_ITEM_ENUM.edit : PANTRY_ITEM_ENUM.add);
    } catch(error) {
      props.onError(isEdit? PANTRY_ITEM_ENUM.edit : PANTRY_ITEM_ENUM.add);
    }

    closeDialog();
  }

  return (
    <Dialog classes={{paper: styles.dialog}}
      onClose={() => closeDialog()}
      open={props.showDialog}
      component="form">
      <Typography variant="h4" className={styles.title}>
        {isEdit ? "EDIT" : "ADD"} ITEM
      </Typography>
      <DialogContent className={styles.fields}>
        <Stack direction="row" spacing={2} className={styles.receiptImage}>
          {(isEdit && !formFields.fileName) && <Avatar alt="item image" src={formFields.imageUrl} sx={{ marginRight: '1em' }}/> }
          <Button variant="outlined" component="label" color="secondary">
            Upload Image
            <input type="file" hidden onInput={(event) => {setFileData(event.target)}} />
          </Button>
          <Typography>{formFields.fileName}</Typography>
        </Stack>
        <Stack>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
              label="Date"
              value={formFields.date}
              onChange={(newDate) => {
                setFormFields(prevState => ({...prevState, date: newDate}));
              }}
              maxDate={new Date()}
              renderInput={(params) => <TextField color="tertiary" {...params} />}
            />
          </LocalizationProvider>
        </Stack>
        <TextField color="tertiary" label="Item name" variant="standard" value={formFields.ItemName} onChange={(event) => updateFormField(event, 'ItemName')} />
        <TextField color="tertiary" label="Quantity" variant="standard" value={formFields.quantity} onChange={(event) => updateFormField(event, 'quantity')} />
      </DialogContent>
      <DialogActions>
        {isSubmitting ? 
          <Button color="secondary" variant="contained" disabled={true}>
            Submitting...
          </Button> :
          <Button color="secondary" variant="contained" disabled={isDisabled()} onClick={handleSubmit}>
            Submit
          </Button>}
      </DialogActions>
    </Dialog>
  )
}