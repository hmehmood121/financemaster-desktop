import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyC39Qm05v8C5IDfzJ_iuf4VPu-u6vsaigs",
  authDomain: "finance-masters-3a79f.firebaseapp.com",
  databaseURL: "https://finance-masters-3a79f-default-rtdb.firebaseio.com",
  projectId: "finance-masters-3a79f",
  storageBucket: "finance-masters-3a79f.appspot.com",
  messagingSenderId: "175007513604",
  appId: "1:175007513604:web:4fbbcb7340518492c3c951",
  measurementId: "G-7M7XXVK4Y8"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

