// src/components/ProductDetail.js
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [tallaSeleccionada, setTallaSeleccionada] = useState('');

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
    navigate('/');
  };

  if (!producto) return <p>Cargando producto...</p>;

  return (
    <div style={{ maxWidth: 600, margin: 'auto' }}>
      <h2>{producto.name}</h2>
      <p>Precio: ${producto.price}</p>
      <p>Tipo: {producto.type}</p>
      <p>Descripción: {producto.description}</p>

      {producto.imageUrls?.[0] && (
        <img src={producto.imageUrls[0]} alt={producto.name} style={{ width: '100%', maxWidth: 300 }} />
      )}

      <h4>Tallas disponibles</h4>
      <select value={tallaSeleccionada} onChange={e => setTallaSeleccionada(e.target.value)}>
        <option value="">Seleccioná una talla</option>
        {producto.sizes.map(s => (
          <option key={s.talla} value={s.talla} disabled={s.stock < 1}>
            {s.talla} - {s.stock > 0 ? `Stock: ${s.stock}` : 'Sin stock'}
          </option>
        ))}
      </select>

      <br /><br />
      <button onClick={agregarAlCarrito}>Agregar al carrito</button>
    </div>
  );
}
