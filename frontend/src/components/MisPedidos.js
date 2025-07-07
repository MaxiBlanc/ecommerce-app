// src/components/MisPedidos.js
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function MisPedidos() {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No se encontró el token. Iniciá sesión primero.');
      return;
    }

    axios.get('https://ecommerce-app-0bh1.onrender.com/orders', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => setPedidos(res.data))
    .catch(err => {
      console.error(err);
      alert('Error cargando pedidos');
    });
  }, []);

  return (
    <div style={{ maxWidth: 800, margin: 'auto', padding: 20 }}>
      <h2>📦 Mis pedidos</h2>
      {pedidos.length === 0 ? (
        <p>No hay pedidos aún.</p>
      ) : (
        pedidos.map(p => (
          <div key={p.id} style={{ border: '1px solid #ccc', marginBottom: 20, padding: 10 }}>
            <p><strong>Fecha:</strong> {new Date(p.createdAt).toLocaleDateString()}</p>
            <p><strong>Total:</strong> ${p.amount}</p>
            <p><strong>Estado:</strong> {p.status}</p>
            <ul>
              {p.products.map((prod, i) => (
                <li key={i}>
                  {prod.title} - Cant: {prod.quantity} - ${prod.unit-price}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
