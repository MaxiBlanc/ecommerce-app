import { useEffect, useState } from 'react';
import { auth } from '../firebase/firebaseconfig';
import './UserInfo.css';

export default function UserInfo() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  if (!user) {
    return (
      <div className="user-card">
        <p>No estás logueado.</p>
      </div>
    );
  }

  return (
    <div className="user-card">
      <h2>Mi Cuenta</h2>
      <p><strong>Nombre:</strong> {user.displayName || 'Sin nombre'}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Email verificado:</strong> {user.emailVerified ? 'Sí' : 'No'}</p>
    </div>
  );
}
