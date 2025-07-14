import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProductList from './components/ProductList';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import TodosLosPedidos from './components/TodosLosPedidos';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import UserInfo from './components/UserInfo';
import MisPedidos from './components/MisPedidos';
import ProductAdmin from './components/ProductAdmin';
import RequireAuth from './components/RequireAuth';
import RequireAdmin from './components/RequireAdmin';

function App() {
  return (
    <Router>
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
      </Routes>
    </Router>
  );
}

export default App;
