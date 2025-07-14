// src/components/TodosLosPedidos.js
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function TodosLosPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [buscarId, setBuscarId] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPedidos = async () => {
    try {
      const res = await axios.get('https://ecommerce-app-0bh1.onrender.com/orders/all');
      const pedidosOrdenados = res.data.sort(
        (a, b) => (b.createdAt?._seconds || 0) - (a.createdAt?._seconds || 0)
      );
      setPedidos(pedidosOrdenados);
      setFiltered(pedidosOrdenados);
    } catch (err) {
      console.error(err);
      alert('Error cargando pedidos');
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  aplicarFiltros();
}, [aplicarFiltros]);

  const handleStatusChange = async (id, nuevoEstado) => {
    try {
      await axios.put(`https://ecommerce-app-0bh1.onrender.com/orders/${id}/update-status`, {
        status: nuevoEstado,
      });
      const actualizados = pedidos.map((p) =>
        p.id === id ? { ...p, status: nuevoEstado } : p
      );
      setPedidos(actualizados);
      aplicarFiltros(actualizados);
    } catch (error) {
      console.error('Error actualizando estado:', error);
      alert('No se pudo actualizar el estado');
    }
  };

  const aplicarFiltros = (listaOriginal = pedidos) => {
    let filtrados = [...listaOriginal];

    if (estadoFiltro) {
      filtrados = filtrados.filter((p) => p.status === estadoFiltro);
    }

    if (buscarId.trim()) {
      filtrados = filtrados.filter((p) =>
        p.id.toLowerCase().includes(buscarId.toLowerCase())
      );
    }

    setFiltered(filtrados);
  };

  useEffect(() => {
    aplicarFiltros();
  }, [estadoFiltro, buscarId]);

  return (
    <div style={{ maxWidth: 1000, margin: 'auto', padding: 20 }}>
      <h2>📋 Todos los pedidos</h2>

      <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
        <select
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="approved">approved</option>
          <option value="dispatched">dispatched</option>
          <option value="successfully delivered">successfully delivered</option>
        </select>

        <input
          type="text"
          placeholder="Buscar por ID de pedido"
          value={buscarId}
          onChange={(e) => setBuscarId(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : filtered.length === 0 ? (
        <p>No hay pedidos.</p>
      ) : (
        filtered.map((p) => (
          <div
            key={p.id}
            style={{
              border: '1px solid #ccc',
              marginBottom: 20,
              padding: 10,
              borderRadius: 8,
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

            <label>
              <strong>Estado:</strong>{' '}
              <select
                value={p.status}
                onChange={(e) => handleStatusChange(p.id, e.target.value)}
              >
                <option value="approved">approved</option>
                <option value="dispatched">dispatched</option>
                <option value="successfully delivered">successfully delivered</option>
              </select>
            </label>

            <ul style={{ marginTop: 10 }}>
              {p.products?.map((prod, i) => (
                <li key={i}>
                  {prod.title} - Talla: {prod.talla} - Cant: {prod.quantity} - ${prod.unit_price}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
