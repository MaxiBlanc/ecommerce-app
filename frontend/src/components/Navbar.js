// src/components/Navbar.js
import { Link } from 'react-router-dom';
import { auth } from '../firebase/firebaseconfig';
import { useEffect, useState } from 'react';
import './Navbar.css'

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(currentUser => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  const handleLogout = () => {
    auth.signOut();
  };

  const toggleUserMenu = () => setUserMenuOpen(!userMenuOpen);
  const toggleAdminMenu = () => setAdminMenuOpen(!adminMenuOpen);

  const isAdmin = user?.email === 'maxiblanc240801@gmail.com';

  return (
    <nav className="navbar">
      <Link to="/">Inicio</Link>
      <Link to="/carrito">🛒 Ir al carrito</Link>

      {!user && (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Registrarse</Link>
        </>
      )}

      {user && (
        <>
          {isAdmin ? (
            <div className="navbar-dropdown">
              <button onClick={toggleAdminMenu}>Admin ▼</button>
              {adminMenuOpen && (
                <div className="dropdown-menu">
                  <Link to="/mis-pedidos">Mis pedidos</Link>
                  <Link to="/admin/pedidos">Ver todos los pedidos</Link>
                  <Link to="/Product">Producto</Link>
                  <Link to="/admin/sucursales">Sucursales</Link>
                </div>
              )}
            </div>
          ) : (
            <Link to="/mis-pedidos">Mis pedidos</Link>
          )}

          <div className="navbar-dropdown">
            <button onClick={toggleUserMenu}>Cuenta ▼</button>
            {userMenuOpen && (
              <div className="dropdown-menu">
                <Link to="/info">Info cuenta</Link>
                <button onClick={handleLogout}>Cerrar sesión</button>
              </div>
            )}
          </div>
        </>
      )}
    </nav>
  );
}
