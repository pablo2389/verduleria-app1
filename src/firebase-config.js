import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";  // Importar la funcionalidad de autenticación

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

// Obtener la base de datos de Firestore
const db = getFirestore(app);

// Obtener la autenticación
const auth = getAuth(app);  // Configurar autenticación

// Exportar ambos
export { db, auth };
