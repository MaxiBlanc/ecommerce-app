// src/components/TodosLosPedidos.js
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

export default function TodosLosPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [searchId, setSearchId] = useState('');

  // ✅ fetchPedidos sí se usa
  const fetchPedidos = async () => {
    try {
      const res = await axios.get('https://ecommerce-app-0bh1.onrender.com/orders');
      const ordenados = res.data.sort(
        (a, b) => (b.createdAt?._seconds || 0) - (a.createdAt?._seconds || 0)
      );
      setPedidos(ordenados);
    } catch (error) {
      console.error('Error al traer pedidos', error);
    }
  };

  // ✅ aplicarFiltros en useCallback para evitar warning de dependencia
  const aplicarFiltros = useCallback(() => {
    return pedidos
      .filter((p) =>
        filtroStatus ? p.status === filtroStatus : true
      )
      .filter((p) =>
        searchId ? p.id?.toLowerCase().includes(searchId.toLowerCase()) : true
      );
  }, [pedidos, filtroStatus, searchId]);

  useEffect(() => {
    fetchPedidos();
  }, []);

  // ✅ función para actualizar estado del pedido en Firestore
  const actualizarEstado = async (id, nuevoEstado) => {
    try {
      await axios.put(`https://ecommerce-app-0bh1.onrender.com/orders/update-status/${id}`, {
        status: nuevoEstado
      });
      fetchPedidos(); // recargar
    } catch (error) {
      console.error('Error al actualizar estado', error);
    }
  };

  const pedidosFiltrados = aplicarFiltros();

  return (
    <div style={{ maxWidth: 900, margin: 'auto', padding: 20 }}>
      <h2>📋 Todos los pedidos</h2>

      <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
        <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
          <option value="">Filtrar por estado</option>
          <option value="approved">Aprobado</option>
          <option value="dispatched">Despachado</option>
          <option value="successfully delivered">Entregado</option>
        </select>

        <input
          type="text"
          placeholder="Buscar por ID de pedido..."
          value={searchId}
          onChange={e => setSearchId(e.target.value)}
        />
      </div>

      {pedidosFiltrados.map((p) => (
        <div
          key={p.id}
          style={{
            border: '1px solid #ccc',
            borderRadius: 8,
            padding: 10,
            marginBottom: 20
          }}
        >
          <p><strong>ID:</strong> {p.id}</p>
          <p><strong>Cliente:</strong> {p.customerName} ({p.customerEmail})</p>
          <p><strong>Fecha:</strong> {
            p.createdAt?._seconds
              ? new Date(p.createdAt._seconds * 1000).toLocaleString('es-AR')
              : 'Fecha no disponible'
          }</p>
          <p><strong>Total:</strong> ${p.amount}</p>
          <p>
            <strong>Estado:</strong>{' '}
            <select
              value={p.status}
              onChange={e => actualizarEstado(p.id, e.target.value)}
            >
              <option value="approved">Aprobado</option>
              <option value="dispatched">Despachado</option>
              <option value="successfully delivered">Entregado</option>
            </select>
          </p>
          <ul>
            {p.products.map((prod, i) => (
              <li key={i}>
                {prod.title} - Talla: {prod.talla} - Cant: {prod.quantity} - ${prod.unit_price}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
