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

import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, orderBy, query, setDoc, where } from 'firebase/firestore'; 
import { db } from './firebase';
import { getDownloadURL } from './storage';

const ITEMS_COLLECTION = 'items';

export function addPantryItem(uid, date, ItemName, quantity, imageBucket) {
    addDoc(collection(db, ITEMS_COLLECTION), {uid, date, ItemName, quantity, imageBucket})
}

export async function getPantryItems(uid, setItems, setIsLoadingPantry) {
    const itemsQuery = query(collection(db, ITEMS_COLLECTION), where("uid", "==", uid), orderBy("date", "desc"));

    const unsubscribe = onSnapshot(itemsQuery, async(snapshot) => {
        let allItems = [];
        for (const documentSnapshot of snapshot.docs) {
            const item = documentSnapshot.data();
            const imageUrl = await getDownloadURL(item['imageBucket']); // Await the getDownloadURL call
            await allItems.push({
                ...item,
                date: item['date'].toDate(),
                id: documentSnapshot.id,
                imageUrl
            });
        }
        setItems(allItems);
        setIsLoadingPantry(false);
    })
    return unsubscribe;
}

export function updatePantryItem(docId, uid, date, ItemName, quantity, imageBucket) {
    setDoc(doc(db, ITEMS_COLLECTION, docId), {uid, date, ItemName, quantity, imageBucket});
}

export function deletePantryItem(id) {
    deleteDoc(doc(db, ITEMS_COLLECTION, id));
}