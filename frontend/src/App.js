// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import UserInfo from './components/UserInfo';
import LogoutButton from './components/LogoutButton';
import Navbar from './components/Navbar';
import ProductList from './components/ProductList';
import ProductAdmin from './components/ProductAdmin';
import Cart from './components/Cart';
import Success from './pages/success';
import Failure from './pages/Failure';
import Pending from './pages/Pending';
import ProductDetail from './components/ProductDetail';


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
          <Route path="/logout" element={<LogoutButton />} />
          <Route path="/Product" element={<ProductAdmin />} />
          <Route path="/producto/:id" element={<ProductDetail />} />
          <Route path="/carrito" element={<Cart />} />
          <Route path="/success" element={<Success />} />
        <Route path="/failure" element={<Failure />} />
        <Route path="/pending" element={<Pending />} />
        </Routes>
      </div>
    </Router>
  );
}


export default App;
