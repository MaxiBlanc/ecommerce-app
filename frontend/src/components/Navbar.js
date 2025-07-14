// src/components/Navbar.js
import { Link } from 'react-router-dom';
import { auth } from '../firebase/firebaseconfig';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(currentUser => {
      setUser(currentUser);
    });

    return () => unsub();
  }, []);

  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <nav style={{ marginBottom: '20px' }}>
      <Link to="/" style={{ marginRight: 10 }}>Inicio</Link>
      {!user && <Link to="/register" style={{ marginRight: 10 }}>Registro</Link>}
      {!user && <Link to="/login" style={{ marginRight: 10 }}>Login</Link>}
      <Link to="/carrito">🛒 Ir al carrito</Link>
      <Link to="/Product">Producto</Link>
      <Link to="/mis-pedidos">Mis Pedidos</Link>
      <br></br>
      <Link to="/admin/pedidos">Ver todos los pedidos</Link>
      {user && (
        <button onClick={handleLogout} style={{ marginLeft: 10 }}>
          Cerrar sesión
        </button>
      )}
    </nav>
  );
}
