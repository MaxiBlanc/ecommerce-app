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
  {/* Visible para todos */}
  <Link to="/" style={{ marginRight: 10 }}>Inicio</Link>
  <Link to="/carrito" style={{ marginRight: 10 }}>🛒 Ir al carrito</Link>

  {/* Si NO está logueado */}
  {!user && (
    <>
      <Link to="/register" style={{ marginRight: 10 }}>Registro</Link>
      <Link to="/login" style={{ marginRight: 10 }}>Login</Link>
    </>
  )}

  {/* Si está logueado */}
  {user && (
    <>
      <Link to="/mis-pedidos" style={{ marginRight: 10 }}>Mis Pedidos</Link>
      <Link to="/info" style={{ marginRight: 10 }}>Info Cuenta</Link>
      <button onClick={handleLogout} style={{ marginLeft: 10 }}>
        Cerrar sesión
      </button>
    </>
  )}

  {/* Si es admin */}
  {user?.email === 'maxiblanc240801@gmail.com' && (
    <>
      <Link to="/Product" style={{ marginLeft: 10 }}>Producto</Link>
      <Link to="/admin/pedidos" style={{ marginLeft: 10 }}>Ver todos los pedidos</Link>
    </>
  )}
</nav>

  );
}
