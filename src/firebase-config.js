// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA24DEwBO00it5ithDt6sb2kMrtTEpHJfk",
  authDomain: "students-fa45f.firebaseapp.com",
  projectId: "students-fa45f",
  storageBucket: "students-fa45f.appspot.com",
  messagingSenderId: "562301762938",
  appId: "1:562301762938:web:91d44c3a08b61459d9aac3",
  measurementId: "G-6NYRRW33DK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);