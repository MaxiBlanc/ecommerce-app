import { useEffect, useState } from 'react';
import { auth } from '../firebase/firebaseconfig';
import { onAuthStateChanged } from 'firebase/auth';
import { Navigate } from 'react-router-dom';

const adminEmail = "lachispa8mb@gmail.com";

export default function RequireAdmin({ children }) {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, u => setUser(u));
    return () => unsubscribe();
  }, []);

  if (user === undefined) return null; // Esperando sesión
  if (!user || user.email !== adminEmail) return <Navigate to="/" />;

  return children;
}
