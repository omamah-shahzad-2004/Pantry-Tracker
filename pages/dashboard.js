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
 import Head from 'next/head';
 import { useRouter } from 'next/router';
 import { Alert, Button, CircularProgress, Container, Dialog, DialogContent, DialogActions, Divider, IconButton, Snackbar, Stack, Typography } from '@mui/material';
 import AddIcon from '@mui/icons-material/Add';
 import NavBar from '../components/navbar';
 import ItemRow from '../components/itemRow';
 import PantryDialog from '../components/pantryDialog';
 import { useAuth } from '../firebase/auth';
 import { deletePantryItem, getPantryItems, updatePantryItem } from '../firebase/firestore';
 import { deleteImage } from '../firebase/storage';
 import styles from '../styles/dashboard.module.scss';

const ADD_SUCCESS = "Pantry Item was successfully added!";
const ADD_ERROR = "Pantry Item was not successfully added!";
const EDIT_SUCCESS = "Pantry Item was successfully updated!";
const EDIT_ERROR = "Pantry Item was not successfully updated!";
const DELETE_SUCCESS = "Pantry Item successfully deleted!";
const DELETE_ERROR = "Pantry Item not successfully deleted!";

// Enum to represent different states of pantry items
export const PANTRY_ITEM_ENUM = Object.freeze({
  none: 0,
  add: 1,
  edit: 2,
  delete: 3,
});

const SUCCESS_MAP = {
  [PANTRY_ITEM_ENUM.add]: ADD_SUCCESS,
  [PANTRY_ITEM_ENUM.edit]: EDIT_SUCCESS,
  [PANTRY_ITEM_ENUM.delete]: DELETE_SUCCESS
}

const ERROR_MAP = {
  [PANTRY_ITEM_ENUM.add]: ADD_ERROR,
  [PANTRY_ITEM_ENUM.edit]: EDIT_ERROR,
  [PANTRY_ITEM_ENUM.delete]: DELETE_ERROR
}

export default function Dashboard() {
  const { authUser, isLoading } = useAuth();
  const router = useRouter();
  const [action, setAction] = useState(PANTRY_ITEM_ENUM.none);
  
  // State involved in loading, setting, deleting, and updating pantry items
  const [isLoadingPantry, setIsLoadingPantry] = useState(true);
  const [deleteItemId, setDeleteItemId] = useState("");
  const [deleteItemImageBucket, setDeleteItemImageBucket] = useState("");
  const [items, setItems] = useState([]);
  const [updatePantryItem, setUpdatePantryItem] = useState({});

  // State involved in snackbar
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [showSuccessSnackbar, setSuccessSnackbar] = useState(false);
  const [showErrorSnackbar, setErrorSnackbar] = useState(false);

  // Sets appropriate snackbar message on whether @isSuccess and updates shown pantry items if necessary
  const onResult = async (pantryItemEnum, isSuccess) => {
    setSnackbarMessage(isSuccess ? SUCCESS_MAP[pantryItemEnum] : ERROR_MAP[pantryItemEnum]);
    isSuccess ? setSuccessSnackbar(true) : setErrorSnackbar(true);
    setAction(PANTRY_ITEM_ENUM.none);  
  }

  // Listen to changes for loading and authUser, redirect if needed
  useEffect(() => {
    if(!isLoading && !authUser) {
      router.push('/');
    }
  }, [authUser, isLoading]);

  //Get items once user is logged in 
  useEffect(async() => {
    if(authUser) {
      const unsubscribe = await getPantryItems(authUser.uid, setItems, setIsLoadingPantry);
      return () => unsubscribe();
    }
  }, [authUser]);

  // For all of the onClick functions, update the action and fields for updating

  const onClickAdd = () => {
    setAction(PANTRY_ITEM_ENUM.add);
    setUpdatePantryItem({});
  }

  const onUpdate = (item) => {
    setAction(PANTRY_ITEM_ENUM.edit);
    setUpdatePantryItem(item);
  }

  const onClickDelete = (id, imageBucket) => {
    setAction(PANTRY_ITEM_ENUM.delete);
    setDeleteItemId(id);
    setDeleteItemImageBucket(imageBucket);
  }

  const resetDelete = () => {
    setAction(PANTRY_ITEM_ENUM.none);
    setDeleteItemId("");
  }

  const onDelete = async() => {
    let isSucceed = true;
    try {
      await deletePantryItem(deleteItemId);
      await deleteImage(deleteItemImageBucket);
    } catch(error) {
      isSucceed = false;
    }
    resetDelete();
    onResult(PANTRY_ITEM_ENUM.delete, isSucceed);
  }

  return (
    <div>
      <Head>
        <title>Pantry Tracker</title>
      </Head>

      <NavBar />
      <Container>
        <Snackbar open={showSuccessSnackbar} autoHideDuration={1500} onClose={() => setSuccessSnackbar(false)}
                  anchorOrigin={{ horizontal: 'center', vertical: 'top' }}>
          <Alert onClose={() => setSuccessSnackbar(false)} severity="success">{snackbarMessage}</Alert>
        </Snackbar>
        <Snackbar open={showErrorSnackbar} autoHideDuration={1500} onClose={() => setErrorSnackbar(false)}
                  anchorOrigin={{ horizontal: 'center', vertical: 'top' }}>
          <Alert onClose={() => setErrorSnackbar(false)} severity="error">{snackbarMessage}</Alert>
        </Snackbar>
        <Stack direction="row" sx={{ paddingTop: "1.5em" }}>
          <Typography variant="h4" sx={{ lineHeight: 2, paddingRight: "0.5em" }}>
            Pantry Items
          </Typography>
          <IconButton aria-label="edit" color="secondary" onClick={onClickAdd} className={styles.addButton}>
            <AddIcon />
          </IconButton>
        </Stack>
        {items.map((item) => (
          <div key={items.id}>
            <Divider light />
            <ItemRow item={item}
                     onEdit={() => onUpdate(item)}
                     onDelete={() => onClickDelete(item.id, item.imageBucket)}/>
          </div>)
        )}
      </Container>
      <PantryDialog edit={updatePantryItem}
                     showDialog={action === PANTRY_ITEM_ENUM.add || action === PANTRY_ITEM_ENUM.edit}
                     onError={(pantryItemEnum) => onResult(pantryItemEnum, false)}
                     onSuccess={(pantryItemEnum) => onResult(pantryItemEnum, true)}
                     onCloseDialog={() => setAction(PANTRY_ITEM_ENUM.none)}>
      </PantryDialog>
      <Dialog open={action === PANTRY_ITEM_ENUM.delete} onClose={resetDelete}>
        <Typography variant="h4" className={styles.title}>DELETE PANTRY ITEM</Typography>
        <DialogContent>
            <Alert severity="error">This will permanently delete your pantry item!</Alert>
        </DialogContent>
        <DialogActions sx={{ padding: '0 24px 24px'}}>
          <Button color="secondary" variant="outlined" onClick={resetDelete}>
              Cancel
          </Button>
          <Button color="secondary" variant="contained" autoFocus onClick={onDelete}>
              Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}