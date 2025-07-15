import { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../firebase/firebaseconfig';

export default function Cart() {
  const [carrito, setCarrito] = useState([]);

  const handleCheckout = async () => {
    if (carrito.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    const user = auth.currentUser;

    if (!user || !user.email || !user.displayName) {
      alert('Debe iniciar sesión para realizar el pago');
      return;
    }

    const items = carrito.map(product => ({
      title: `${product.name}`,
      unit_price: Number(product.price),
      quantity: Number(product.cantidad),
      currency_id: 'ARS',
      productId: product.id,
      talla: product.size?.talla || 'N/A',
      name: product.name,
      price: product.price
    }));

    const payload = {
      items,
      customerName: user.displayName,
      customerEmail: user.email
    };

    try {
      const res = await axios.post(
        'https://ecommerce-app-0bh1.onrender.com/mercadopago/create_preference',
        payload
      );
      localStorage.removeItem('carrito');
    setCarrito([]); // Limpia el estado local también
      window.location.href = res.data.init_point;
    } catch (error) {
      console.error('Error en checkout:', error);
      alert('Error al iniciar pago');
    }
  };

 useEffect(() => {
  const sincronizarCarritoConStock = async () => {
    const datos = JSON.parse(localStorage.getItem('carrito')) || [];

    const carritoActualizado = await Promise.all(
      datos.map(async (item) => {
        try {
          const res = await fetch(`https://firestore.googleapis.com/v1/projects/ecommerce-app-3f900/databases/(default)/documents/products/${item.id}`);
          const data = await res.json();

          const sizes = data.fields?.sizes?.arrayValue?.values || [];
          const tallaEncontrada = sizes.find(s =>
            s.mapValue.fields.talla.stringValue === item.size?.talla
          );

          const stockActual = tallaEncontrada?.mapValue.fields.stock.integerValue || item.size?.stock || 1;

          return {
            ...item,
            size: {
              ...item.size,
              stock: Number(stockActual),
            }
          };
        } catch (error) {
          console.error('❌ Error sincronizando stock del producto', item.id);
          return item; // Devolver original si falla
        }
      })
    );

    setCarrito(carritoActualizado);
    localStorage.setItem('carrito', JSON.stringify(carritoActualizado));
  };

  sincronizarCarritoConStock();
}, []);


  const actualizarCantidad = (id, talla, nuevaCantidad) => {
    const producto = carrito.find(p => p.id === id && p.size?.talla === talla);
if (!producto || isNaN(nuevaCantidad) || nuevaCantidad < 1 || nuevaCantidad > producto.size?.stock) return;
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
  <div className="container my-4">
    <h2 className="mb-4">
      🛒 Carrito de compras
    </h2>

    {carrito.length === 0 ? (
      <p className="text-muted">No hay productos en el carrito</p>
    ) : (
      <ul className="list-unstyled">
        {carrito.map(item => (
          <li
            key={`${item.id}-${item.size?.talla || 'default'}`}
            className="d-flex flex-column flex-md-row align-items-center gap-3 py-3 border-bottom"
          >
            {item.imageUrls?.[0] && (
              <img
                src={item.imageUrls[0]}
                alt={item.name}
                className="img-fluid rounded"
                style={{ maxWidth: 120 }}
              />
            )}
            <div className="flex-fill">
              <h5 className="mb-1">{item.name}</h5>
              <p className="mb-1">
                <strong>Talle:</strong> {item.size?.talla || 'N/A'}
              </p>
              <p className="mb-1">
                Precio: <span className="fw-semibold text-primary">${item.price}</span>
              </p>
              <div className="d-flex align-items-center mb-2">
                <label className="me-2 mb-0">Cantidad:</label>
                <input
                  type="number"
                  value={item.cantidad}
                  min={1}
                  max={item.size?.stock || 1}
                  className="form-control form-control-sm"
                  style={{ width: 80 }}
                  onChange={e => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value <= (item.size?.stock || 1)) {
                      actualizarCantidad(item.id, item.size?.talla, value);
                    }
                  }}
                />
              </div>
              <button
                onClick={() => eliminarProducto(item.id, item.size?.talla)}
                className="btn btn-sm btn-danger"
              >
                🗑️ Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    )}

    {carrito.length > 0 && (
      <div className="mt-4 text-end">
        <h4 className="fw-bold">
          Total: <span className="text-success">${total}</span>
        </h4>
        <button
          onClick={handleCheckout}
          className="btn btn-primary btn-lg mt-2"
        >
          💳 Pagar con Mercado Pago
        </button>
      </div>
    )}
  </div>
);
}
