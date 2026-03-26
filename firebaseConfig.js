import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Platform } from "react-native";
import { 
  initializeAuth, 
  getAuth,
  getReactNativePersistence 
} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDmmhxaJ9ENwn5mdEiK8ri5B27cy6OVUjs",
  authDomain: "eecs-497---3rd-n-place.firebaseapp.com",
  projectId: "eecs-497---3rd-n-place",
  storageBucket: "eecs-497---3rd-n-place.firebasestorage.app",
  messagingSenderId: "26333742393",
  appId: "1:26333742393:web:44e88900958b42d89714e8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Auth with Persistence
// export const auth = initializeAuth(app, {
//   persistence: getReactNativePersistence(ReactNativeAsyncStorage)
// });

export const auth =
  Platform.OS === "web"
    ? getAuth(app)
    : initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage),
      });