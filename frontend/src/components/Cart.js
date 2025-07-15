import { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../firebase/firebaseconfig';
import './cart.css'

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
  <div className="container cart-container my-5">
    <h2 className="cart-title mb-4">
      🛒 Carrito de compras
    </h2>

    {carrito.length === 0 ? (
      <p className="text-muted fs-5 text-center">No hay productos en el carrito</p>
    ) : (
      <div className="cart-items-wrapper">
        {carrito.map(item => (
          <div
            key={`${item.id}-${item.size?.talla || 'default'}`}
            className="cart-item"
          >
            {item.imageUrls?.[0] && (
              <img
                src={item.imageUrls[0]}
                alt={item.name}
                className="cart-item-image"
              />
            )}
            <div className="cart-item-details">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h5 className="mb-0">{item.name}</h5>
                <button
                  onClick={() => eliminarProducto(item.id, item.size?.talla)}
                  className="cart-delete-btn"
                  aria-label="Eliminar"
                >
                  🗑️
                </button>
              </div>
              <p className="mb-1 product-size">
                Talle: {item.size?.talla || 'N/A'}
              </p>
              <div className="d-flex align-items-center mb-2 cart-quantity">
                <button
                  className="quantity-btn"
                  onClick={() =>
                    actualizarCantidad(
                      item.id,
                      item.size?.talla,
                      Math.max(item.cantidad - 1, 1)
                    )
                  }
                >
                  −
                </button>
                <span className="quantity-value">{item.cantidad}</span>
                <button
                  className="quantity-btn"
                  onClick={() =>
                    actualizarCantidad(
                      item.id,
                      item.size?.talla,
                      Math.min(item.cantidad + 1, item.size?.stock || 1)
                    )
                  }
                >
                  +
                </button>
              </div>
              <div className="cart-price">
                ${item.price}
              </div>
            </div>
          </div>
        ))}
      </div>
    )}

    {carrito.length > 0 && (
      <div className="cart-summary">
        <div className="d-flex justify-content-between mb-3">
          <h4 className="fw-bold">Total</h4>
          <h4 className="text-success fw-bold">${total}</h4>
        </div>
        <button
          onClick={handleCheckout}
          className="btn-checkout"
        >
          💳 Finalizar Compra
        </button>
      </div>
    )}
  </div>
);
}
