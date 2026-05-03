import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCThX7JVHJfubFe3WAU9hxp61tlqnW-Cqo",
  authDomain: "team-task-manager-c0729.firebaseapp.com",
  projectId: "team-task-manager-c0729",
  storageBucket: "team-task-manager-c0729.firebasestorage.app",
  messagingSenderId: "59597524821",
  appId: "1:59597524821:web:a4cbc26c310e2b66ff69dc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
