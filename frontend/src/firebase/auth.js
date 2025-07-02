import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "./firebaseConfig";

// Registrar usuario
export const register = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// Iniciar sesión
export const login = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};y

// Cerrar sesión
export const logout = () => {
  return signOut(auth);
};
//----------------------------------------------------------------
import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebaseConfig"; // Firestore

// Guardar perfil en Firestore después del registro
export const saveUserProfile = async (user, name = "Sin nombre") => {
  try {
    await setDoc(doc(db, "clients", user.uid), {
      email: user.email,
      name,
      createdAt: new Date()
    });
  } catch (error) {
    console.error("Error guardando perfil:", error);
  }
};
