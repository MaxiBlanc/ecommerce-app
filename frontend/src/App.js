// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import UserInfo from './components/UserInfo';
import Navbar from './components/Navbar';
import ProductList from './components/ProductList';
import ProductAdmin from './components/ProductAdmin';
import Cart from './components/Cart';
import ProductDetail from './components/ProductDetail';
import MisPedidos from './components/MisPedidos';
import TodosLosPedidos from './components/TodosLosPedidos';
import RequireAuth from './components/RequireAuth';
import RequireAdmin from './components/RequireAdmin';
import AdminSucursales from './components/AdminSucursales';


function App() {
  return (
    <Router>
      <div className="app-container">
        <h1>Mi App</h1>
        <h6>Funciones de Admin: lachispa8mb@gmail.com - contraseña: Chispa12</h6>
        <Navbar />
        <Routes>
          {/* TODOS */}
        <Route path="/" element={<ProductList />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/producto/:id" element={<ProductDetail />} />
        <Route path="/carrito" element={<Cart />} />

        {/* SOLO LOGUEADOS */}
        <Route path="/Info" element={
          <RequireAuth><UserInfo /></RequireAuth>
        } />
        <Route path="/mis-pedidos" element={
          <RequireAuth><MisPedidos /></RequireAuth>
        } />

        {/* SOLO ADMIN */}
        <Route path="/admin/pedidos" element={
          <RequireAdmin><TodosLosPedidos /></RequireAdmin>
        } />
        <Route path="/Product" element={
          <RequireAdmin><ProductAdmin /></RequireAdmin>
        } />
        <Route path="/admin/sucursales" element={
          <RequireAdmin><AdminSucursales /></RequireAdmin>
        } />
        </Routes>
      </div>
    </Router>
  );
}


export default App;
