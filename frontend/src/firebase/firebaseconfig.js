// Importa lo que necesites de Firebase
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Pega aquí la configuración que copiaste de Firebase Console
const firebaseConfig = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID,
};

// Inicializa la app Firebase con la config
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export { db };
// Exporta la autenticación para usar en tu app
export const auth = getAuth(app);

export default app;
