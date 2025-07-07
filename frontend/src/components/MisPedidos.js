// src/components/MisPedidos.js
import { useEffect, useState } from 'react';
import axios from 'axios';
import { auth } from '../firebase/firebaseconfig';

export default function MisPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPedidos = async () => {
      const user = auth.currentUser;

      if (!user || !user.email) {
        alert('Iniciá sesión primero.');
        return;
      }

      try {
        const res = await axios.get(
          `https://ecommerce-app-0bh1.onrender.com/orders/by-email/${encodeURIComponent(user.email)}`
        );
        setPedidos(res.data);
      } catch (err) {
        console.error(err);
        alert('Error cargando pedidos');
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
  }, []);

  return (
    <div style={{ maxWidth: 800, margin: 'auto', padding: 20 }}>
      <h2>📦 Mis pedidos</h2>
      {loading ? (
        <p>Cargando...</p>
      ) : pedidos.length === 0 ? (
        <p>No hay pedidos aún.</p>
      ) : (
        pedidos.map((p) => (
          <div
            key={p.id}
            style={{
              border: '1px solid #ccc',
              marginBottom: 20,
              padding: 10,
              borderRadius: 8,
            }}
          >
            <p><strong>Fecha:</strong> {p.createdAt}</p>
            <p><strong>Total:</strong> ${p.amount}</p>
            <p><strong>Estado:</strong> {p.status}</p>
            <ul>
              {p.products.map((prod, i) => (
                <li key={i}>
                  {prod.title} - Cant: {prod.quantity} - ${prod.unit_price}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
