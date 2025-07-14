import { useEffect, useState } from 'react';
import { auth } from '../firebase/firebaseconfig';
import { onAuthStateChanged } from 'firebase/auth';
import { Navigate } from 'react-router-dom';

export default function RequireAuth({ children }) {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, u => setUser(u));
    return () => unsubscribe();
  }, []);

  if (user === undefined) return null; // Esperando sesión
  if (!user) return <Navigate to="/login" />;

  return children;
}
