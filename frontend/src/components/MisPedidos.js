// src/components/MisPedidos.js
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function MisPedidos() {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    axios.get('https://ecommerce-app-0bh1.onrender.com/orders') // o /orders?cliente=id
      .then(res => setPedidos(res.data))
      .catch(err => alert('Error cargando pedidos'));
  }, []);

  return (
    <div style={{ maxWidth: 800, margin: 'auto' }}>
      <h2>📦 Mis pedidos</h2>
      {pedidos.length === 0 ? (
        <p>No hay pedidos aún.</p>
      ) : (
        pedidos.map(p => (
          <div key={p.id} style={{ border: '1px solid #ccc', marginBottom: 20, padding: 10 }}>
            <p><strong>Fecha:</strong> {new Date(p.fecha.seconds * 1000).toLocaleDateString()}</p>
            <p><strong>Total:</strong> ${p.total}</p>
            <p><strong>Estado:</strong> {p.estado}</p>
            <ul>
              {p.productos.map((prod, i) => (
                <li key={i}>
                  {prod.nombre} - Talle: {prod.talla} - Cant: {prod.cantidad} - ${prod.precio}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
