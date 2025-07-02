// src/components/LogoutButton.js
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseconfig';

export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert('Sesión cerrada correctamente');
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  };

  return <button onClick={handleLogout}>Cerrar sesión</button>;
}
