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

import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { EmailAuthProvider, GoogleAuthProvider, TwitterAuthProvider } from 'firebase/auth';
import { Button, CircularProgress, Container, Dialog, Typography } from '@mui/material';
import { auth } from '../firebase/firebase';
import styles from '../styles/landing.module.scss';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import { useAuth } from '../firebase/auth';
import { FacebookAuthProvider } from 'firebase/auth/web-extension';

const REDIRECT_PAGE = '/dashboard';

//Configure FirebaseUI
const uiConfig = {
  signInFlow: 'popup', //singIn flow with popup rather than redirect flow
  signInSuccessUrl: REDIRECT_PAGE,
  signInOptions: [
    //can be Google, Facebook, Twitter, Github, email/password, e.t.c.
    EmailAuthProvider.PROVIDER_ID,
    GoogleAuthProvider.PROVIDER_ID,
    FacebookAuthProvider.PROVIDER_ID,
    TwitterAuthProvider.PROVIDER_ID,
  ]
}

export default function Home() {
  const {authUser, isLoading} = useAuth();
  const router = useRouter();
  const [login, setLogin] = useState(false);

  //Redirect if finished loading and there's an existing user (user is logged in)
  useEffect(() => {
    if(!isLoading && authUser) {
      router.push('/dashboard');
    }
  }, [authUser, isLoading]);

  return (
    <div>
      <Head>
        <title>Pantry Tracker</title>
      </Head>

      <main>
        <Container className={styles.container}>
          <Typography variant="h1">Welcome to Pantry Tracker!</Typography>
          <Typography variant="h2">Add, view, edit, and delete pantry items</Typography>
          <div className={styles.buttons}>
            <Button variant="contained" color="secondary" onClick={() => setLogin(true)}>
              Login / Register
            </Button>
          </div>
          <Dialog open={login} onClose={() => setLogin(false)}>
            <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth}></StyledFirebaseAuth>
          </Dialog>
        </Container>
      </main>
    </div>);
}