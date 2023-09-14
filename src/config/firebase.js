import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/database';
import 'firebase/messaging';
import 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB-Iv08ra8cU21__MfzLV40NYgsgi0qQTA",
  authDomain: "ecotaskreward-f1a4f.firebaseapp.com",
  projectId: "ecotaskreward-f1a4f",
  storageBucket: "ecotaskreward-f1a4f.appspot.com",
  messagingSenderId: "238602413554",
  appId: "1:238602413554:web:f47a1315ae7670ac09776b"
};

firebase.initializeApp(firebaseConfig);

export const storage = firebase.storage();
export const firestore = firebase.firestore();
export const auth =firebase.auth();
export const database = firebase.database();
export const messaging = firebase.messaging();

export default firebase;

