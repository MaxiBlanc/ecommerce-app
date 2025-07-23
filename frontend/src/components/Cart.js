import { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../firebase/firebaseconfig';
import './cart.css'

export default function Cart() {
  const [carrito, setCarrito] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState('');
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState(null);

  useEffect(() => {
    // Cargar provincias (reemplaza URL con tu fuente real)
    fetch('https://ecommerce-app-0bh1.onrender.com/api/provincias')
      .then(res => res.json())
      .then(data => setProvincias(data))
      .catch(console.error);

    // Cargar todas las sucursales
    fetch('https://ecommerce-app-0bh1.onrender.com/api/sucursales')
      .then(res => res.json())
      .then(data => setSucursales(data))
      .catch(console.error);
      console.log('Todas las sucursales:', sucursales); // <--- Acá ves todo lo que trae
  },  [sucursales]);

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
            return item;
          }
        })
      );

      setCarrito(carritoActualizado);
      localStorage.setItem('carrito', JSON.stringify(carritoActualizado));
    };

    sincronizarCarritoConStock();
  }, []);

  const sucursalesFiltradas = sucursales.filter(
    s => s.provincia.id === provinciaSeleccionada
  );
  // Filtrar sucursales según provincia seleccionada

  const precioSucursal = sucursalSeleccionada ? sucursalSeleccionada.price : 0;

  const total = carrito.reduce((acc, item) => acc + item.price * item.cantidad, 0);
  const totalConEnvio = total + precioSucursal;

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

  const handleCheckout = async () => {
    if (carrito.length === 0) {
      alert('El carrito está vacío');
      return;
    }
    if (!provinciaSeleccionada) {
      alert('Debe seleccionar una provincia');
      return;
    }
    if (!sucursalSeleccionada) {
      alert('Debe seleccionar una sucursal');
      return;
    }

    const user = auth.currentUser;

    if (!user || !user.email || !user.displayName) {
      alert('Debe iniciar sesión para realizar el pago');
      return;
    }

    const provinciaObj = provincias.find(p => p.id === provinciaSeleccionada)?.name;


const items = [
  ...carrito.map(product => ({
    title: product.name,
    unit_price: Number(product.price),
    quantity: Number(product.cantidad),
    currency_id: 'ARS',
    productId: product.id,
    talla: product.size?.talla || 'N/A',
    name: product.name,
    price: product.price
  })),
  {
    title: "Costo de envío a " + sucursalSeleccionada.name + ", " + provinciaObj,
    unit_price: sucursalSeleccionada.price,
    quantity: 1,
    currency_id: "ARS"
  }
];


    const payload = {
      items,
      customerName: user.displayName,
      customerEmail: user.email,
      provincia: provincias.find(p => p.id === provinciaSeleccionada)?.name || '',
      sucursal: sucursalSeleccionada.name,
      precioSucursal,
      totalAmount: totalConEnvio
    };

    try {
      const res = await axios.post(
        'https://ecommerce-app-0bh1.onrender.com/mercadopago/create_preference',
        payload
      );
      localStorage.removeItem('carrito');
      setCarrito([]);
      window.location.href = res.data.init_point;
    } catch (error) {
      console.error('Error en checkout:', error);
      alert('Error al iniciar pago');
    }
  };

  return (
    <div className="container cart-container my-5">
      <h2 className="cart-title mb-4">🛒 Carrito de compras</h2>

      {carrito.length === 0 ? (
        <p className="text-muted fs-5 text-center">No hay productos en el carrito</p>
      ) : (
        <div className="cart-items-wrapper">
          {carrito.map(item => (
            <div
              key={`${item.id}-${item.size?.talla || 'default'}`}
              className="cart-item"
            >
              <button
                onClick={() => eliminarProducto(item.id, item.size?.talla)}
                className="cart-delete-btn"
                aria-label="Eliminar"
              >
                🗑️
              </button>
              {item.imageUrls?.[0] && (
                <img
                  src={item.imageUrls[0]}
                  alt={item.name}
                  className="cart-item-image"
                />
              )}
              <div className="cart-item-details">
                <h5>{item.name}</h5>
                <div className="cart-info">
                  <span>Talle: {item.size?.talla || 'N/A'}</span>
                  <span>Precio: ${item.price}</span>
                </div>
                <div className="cart-quantity">
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
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Select provincia */}
      <div style={{ marginTop: '1rem' }}>
        <label>
          Provincia:{' '}
          <select
            value={provinciaSeleccionada}
            onChange={(e) => {
              setProvinciaSeleccionada(e.target.value);
              setSucursalSeleccionada(null);
            }} 
          >
            <option value="">Selecciona provincia</option>
            {provincias.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Select sucursal */}
      <div style={{ marginTop: '1rem' }}>
        <label>
          Sucursal:{' '}
          <select
            value={sucursalSeleccionada ? sucursalSeleccionada.id : ''}
            onChange={(e) => {
              const suc = sucursalesFiltradas.find(s => s.id === e.target.value);
              setSucursalSeleccionada(suc || null);
            }}
            disabled={!provinciaSeleccionada}
          >
            <option value="">Selecciona sucursal</option>
            {sucursalesFiltradas.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} - Precio: ${s.price}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Total con precio sucursal */}
      <div style={{ marginTop: '1rem', fontWeight: 'bold' }}>
        TOTAL + envío: ${totalConEnvio}
      </div>

      {carrito.length > 0 && (
        <button
          onClick={handleCheckout}
          className="btn-checkout"
          style={{ marginTop: '1rem' }}
        >
          💳 Finalizar Compra
        </button>
      )}
    </div>
  );
}
