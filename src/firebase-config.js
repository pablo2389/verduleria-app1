import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Importar la funcionalidad de autenticación
import { getFirestore } from "firebase/firestore";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBxuqAM5n_dVCuQMvayFX7ZezA96sCIBNE",
  authDomain: "verduleria-app-94aa2.firebaseapp.com",
  projectId: "verduleria-app-94aa2",
  storageBucket: "verduleria-app-94aa2.appspot.com",
  messagingSenderId: "546750039898",
  appId: "1:546750039898:web:8a869a8cc991a580825563",
  measurementId: "G-6FSBVTNPP3"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);  // Configurar autenticación

// Exportar ambos
export { auth, db };

