// src/components/UserInfo.js
import { useEffect, useState } from 'react';
import { auth } from '../firebase/firebaseconfig';

export default function UserInfo() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  if (!user) return <p>No estás logueado.</p>;

  return (
    <div>
      <p><strong>Nombre:</strong> {user.displayName || 'Sin nombre'}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Email verificado:</strong> {user.emailVerified ? 'Sí' : 'No'}</p>
    </div>
  );
}
