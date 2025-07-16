// src/components/ProductDetail.js
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function ProductDetail() {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [tallaSeleccionada, setTallaSeleccionada] = useState('');
  const [imagenActual, setImagenActual] = useState(0);

  useEffect(() => {
    axios.get(`https://ecommerce-app-0bh1.onrender.com/products/${id}`)
      .then(res => setProducto(res.data))
      .catch(() => alert('Error al cargar el producto'));
  }, [id]);

  const agregarAlCarrito = () => {
    if (!tallaSeleccionada) return alert('Seleccioná una talla');

    const tallaObj = producto.sizes.find(t => t.talla === tallaSeleccionada);
    if (!tallaObj || tallaObj.stock < 1) return alert('Talla sin stock');

    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const existente = carrito.find(
      p => p.id === producto.id && p.size.talla === tallaSeleccionada
    );

    if (existente) {
      existente.cantidad += 1;
    } else {
      carrito.push({
        id: producto.id,
        name: producto.name,
        price: producto.price,
        imageUrls: producto.imageUrls,
        size: tallaObj,
        cantidad: 1
      });
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    alert('Producto agregado al carrito');
    // No redirige más
  };

  const cambiarImagen = (direccion) => {
    const total = producto.imageUrls.length;
    setImagenActual((prev) => (prev + direccion + total) % total);
  };

  if (!producto) return <p>Cargando producto...</p>;

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '2rem',
      maxWidth: 1000,
      margin: 'auto',
      padding: '2rem'
    }}>
      {/* Columna izquierda: Carrusel de imágenes */}
      <div style={{ flex: 1, textAlign: 'center' }}>
        {producto.imageUrls?.length > 0 && (
          <div>
            <img
              src={producto.imageUrls[imagenActual]}
              alt={`img-${imagenActual}`}
              style={{ maxWidth: '100%', maxHeight: 350, borderRadius: '10px' }}
            />
            {producto.imageUrls.length > 1 && (
              <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center', gap: 10 }}>
                <button onClick={() => cambiarImagen(-1)}>⬅️</button>
                <button onClick={() => cambiarImagen(1)}>➡️</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Columna derecha: Detalles */}
      <div style={{ flex: 1, minWidth: 300 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10
        }}>
          <h2 style={{ margin: 0 }}>{producto.name}</h2>
          <strong style={{ fontSize: '1.2rem' }}>${producto.price}</strong>
        </div>

        <p style={{ marginBottom: 20 }}>{producto.description}</p>

        <label><strong>Tallas disponibles:</strong></label>
        <select
          value={tallaSeleccionada}
          onChange={e => setTallaSeleccionada(e.target.value)}
          style={{ display: 'block', marginTop: 5, padding: 6, fontSize: 16 }}
        >
          <option value="">Seleccioná una talla</option>
          {producto.sizes.map(s => (
            <option key={s.talla} value={s.talla} disabled={s.stock < 1}>
              {s.talla} - {s.stock > 0 ? `Stock: ${s.stock}` : 'Sin stock'}
            </option>
          ))}
        </select>

        <button
          onClick={agregarAlCarrito}
          style={{
            marginTop: 20,
            padding: '0.6rem 1.2rem',
            backgroundColor: '#343a40',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 16
          }}
        >
          Agregar al carrito
        </button>
      </div>
    </div>
  );
}
