import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Cart() {
  const [carrito, setCarrito] = useState([]);

  const handleCheckout = async () => {
    if (carrito.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    const items = carrito.map(product => ({
      title: `${product.name} - Talle: ${product.size?.talla || 'N/A'}`,
      unit_price: Number(product.price),
      quantity: Number(product.cantidad),
      currency_id: 'ARS'
    }));

    console.log('Items para Mercado Pago:', items);

    try {
      const res = await axios.post('https://ecommerce-app-0bh1.onrender.com/mercadopago/create_preference', { items });
      window.location.href = res.data.init_point;
    } catch (error) {
      console.error('Error en checkout:', error);
      alert('Error al iniciar pago');
    }
  };

  useEffect(() => {
    const datos = JSON.parse(localStorage.getItem('carrito')) || [];
    setCarrito(datos);
  }, []);

  const actualizarCantidad = (id, talla, nuevaCantidad) => {
    if (nuevaCantidad < 1 || isNaN(nuevaCantidad)) return;
    const actualizado = carrito.map(item =>
      item.id === id && item.size?.talla === talla
        ? { ...item, cantidad: nuevaCantidad }
        : item
    );
    setCarrito(actualizado);
    localStorage.setItem('carrito', JSON.stringify(actualizado));
  };

  const eliminarProducto = (id, talla) => {
    const filtrado = carrito.filter(item => !(item.id === id && item.size?.talla === talla));
    setCarrito(filtrado);
    localStorage.setItem('carrito', JSON.stringify(filtrado));
  };

  const total = carrito.reduce((acc, item) => acc + item.price * item.cantidad, 0);

  return (
    <div style={{ maxWidth: 800, margin: 'auto' }}>
      <h2>🛒 Carrito de compras</h2>

      {carrito.length === 0 ? (
        <p>No hay productos en el carrito</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {carrito.map(item => (
            <li
              key={`${item.id}-${item.size?.talla || 'default'}`}
              style={{ borderBottom: '1px solid #ccc', padding: 10, display: 'flex', alignItems: 'center', gap: 20 }}
            >
              {item.imageUrls?.[0] && (
                <img
                  src={item.imageUrls[0]}
                  alt={item.name}
                  style={{ width: 100, height: 'auto', borderRadius: 8 }}
                />
              )}
              <div style={{ flex: 1 }}>
                <h3>{item.name}</h3>
                <p><strong>Talle:</strong> {item.size?.talla || 'N/A'}</p>
                <p>Precio: ${item.price}</p>
                <p>
                  Cantidad:
                  <input
                    type="number"
                    value={item.cantidad}
                    min={1}
                    style={{ width: 60, marginLeft: 5 }}
                    onChange={e => actualizarCantidad(item.id, item.size?.talla, parseInt(e.target.value))}
                  />
                </p>
                <button
                  onClick={() => eliminarProducto(item.id, item.size?.talla)}
                  style={{ background: 'crimson', color: 'white', border: 'none', padding: '5px 10px' }}
                >
                  🗑️ Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {carrito.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3>Total: ${total}</h3>
          <button onClick={handleCheckout}>Pagar con Mercado Pago</button>
        </div>
      )}
    </div>
  );
}
