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

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD89oiyJ7Mbkzmv0uwO7tNqxVvSCPLGHk0",
  authDomain: "pantry-tracker-7461e.firebaseapp.com",
  projectId: "pantry-tracker-7461e",
  storageBucket: "pantry-tracker-7461e.appspot.com",
  messagingSenderId: "145153684432",
  appId: "1:145153684432:web:2c24585c19c91f46f33fd5",
  measurementId: "G-KVHQ8PEJVS"
};

initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage();