import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import messaging from '@react-native-firebase/messaging';
import auth from '@react-native-firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDUNiGpnsKm-gXP00Lyu_YBpCFZlIGpL3c",
  projectId: "blog-95350",
  storageBucket: "blog-95350.firebasestorage.app",
  appId: "1:545333506409:android:5c00c6472fd16427ec4df8",
  messagingSenderId: "545333506409",
  databaseURL: "https://blog-95350.firebaseio.com"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const db = firestore();
export const storageInstance = storage();
export const messagingInstance = messaging();
export const authInstance = auth();

export { firestore };

export const getFcmToken = async () => {
  try {
    await messagingInstance.registerDeviceForRemoteMessages();
    const token = await messagingInstance.getToken();
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

