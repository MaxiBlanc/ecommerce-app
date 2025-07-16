// src/components/ProductDetail.js
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../components/ProductDetail.css';


export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
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
        
        console.log("agregar carrito", tallaObj);
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
  };

  if (!producto) return <p>Cargando producto...</p>;

  const cambiarImagen = (direccion) => {
  const total = producto.imageUrls.length;
  setImagenActual((prev) => (prev + direccion + total) % total);
};

return (
  <div className="product-detail-container">
    <div className="product-detail-images">
      <div className="carousel">
  <img
    src={producto.imageUrls[imagenActual]}
    alt={`Imagen ${imagenActual + 1}`}
    className="carousel-image"
  />
  {producto.imageUrls.length > 1 && (
    <div className="carousel-buttons">
      <button onClick={() => cambiarImagen(-1)}>⬅️</button>
      <button onClick={() => cambiarImagen(1)}>➡️</button>
    </div>
  )}
</div>
    </div>

    <div className="product-detail-info">
      <h2>{producto.name}</h2>
      <h3>${producto.price}</h3>
      <p className="product-detail-description">{producto.description}</p>

      <div className="product-detail-sizes">
        <label htmlFor="size-select">Talla:</label>
        <select
          id="size-select"
          value={tallaSeleccionada}
          onChange={e => setTallaSeleccionada(e.target.value)}
        >
          <option value="">Selecciona una talla</option>
          {producto.sizes.map(s => (
            <option key={s.talla} value={s.talla} disabled={s.stock < 1}>
              {s.talla} - {s.stock > 0 ? `Stock: ${s.stock}` : 'Sin stock'}
            </option>
          ))}
        </select>
      </div>

      <button onClick={agregarAlCarrito}>Agregar al carrito</button>
    </div>
  </div>
);

}
