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


function App() {
  return (
    <Router>
      <div style={{ padding: '20px' }}>
        <h1>Mi App</h1>
        <Navbar />
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/Info" element={<UserInfo />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/admin/pedidos" element={<TodosLosPedidos />} />
          <Route path="/mis-pedidos" element={<MisPedidos />} />
          <Route path="/Product" element={<ProductAdmin />} />
          <Route path="/producto/:id" element={<ProductDetail />} />
          <Route path="/carrito" element={<Cart />} />
        </Routes>
      </div>
    </Router>
  );
}


export default App;
