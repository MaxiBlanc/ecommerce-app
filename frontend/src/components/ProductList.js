import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../firebase/firebaseconfig';
import './ProductList.css';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [orden, setOrden] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [imageIndices, setImageIndices] = useState({});
  const [tipos, setTipos] = useState([]);

  useEffect(() => {
    fetchProductos();
  }, []);

  useEffect(() => {
    const obtenerTipos = async () => {
      try {
        const res = await getDocs(collection(db, 'products'));
        const tiposSet = new Set();
        res.forEach(doc => {
          const data = doc.data();
          if (data.type) tiposSet.add(data.type);
        });
        setTipos([...tiposSet]);
      } catch (error) {
        console.error('Error obteniendo tipos:', error);
      }
    };
    obtenerTipos();
  }, []);

  const fetchProductos = async () => {
    try {
      const res = await axios.get('https://ecommerce-app-0bh1.onrender.com/products');
      setProducts(res.data);
    } catch (error) {
      console.error('Error al obtener productos', error);
    }
  };

  const ordenarProductos = (productos) => {
    let ordenados = [...productos];
    if (orden === 'precioAsc') ordenados.sort((a, b) => a.price - b.price);
    else if (orden === 'precioDesc') ordenados.sort((a, b) => b.price - a.price);
    else if (orden === 'fechaDesc') ordenados.sort((a, b) => (b.createdAt?._seconds || 0) - (a.createdAt?._seconds || 0));
    return ordenados;
  };

  const filtrarPorTipo = (productos) => {
    if (!tipoFiltro) return productos;
    return productos.filter(p => p.type === tipoFiltro);
  };

  const handleImageChange = (productId, direction, totalImages) => {
    setImageIndices(prev => {
      const current = prev[productId] || 0;
      let newIndex = direction === 'next' ? current + 1 : current - 1;
      if (newIndex < 0) newIndex = totalImages - 1;
      if (newIndex >= totalImages) newIndex = 0;
      return { ...prev, [productId]: newIndex };
    });
  };

  const productosAMostrar = ordenarProductos(filtrarPorTipo(products));

  return (
    <div className="product-list-container">
      <h2>Productos</h2>

      <div className="filters">
        <select onChange={e => setOrden(e.target.value)} defaultValue="">
          <option value="">Ordenar por...</option>
          <option value="precioAsc">Precio: Menor a mayor</option>
          <option value="precioDesc">Precio: Mayor a menor</option>
          <option value="fechaDesc">Más nuevos</option>
        </select>

        <select onChange={e => setTipoFiltro(e.target.value)} defaultValue="">
          <option value="">Filtrar por tipo...</option>
          {tipos.map(tipo => (
            <option key={tipo} value={tipo}>{tipo}</option>
          ))}
        </select>
      </div>

      {productosAMostrar.length === 0 ? (
        <p>No hay productos para mostrar</p>
      ) : (
        <div className="product-grid">
          {productosAMostrar.map(p => {
            const imgIndex = imageIndices[p.id] || 0;
            const currentImg = p.imageUrls?.[imgIndex];

            return (
              <div key={p.id} className="product-card">
                <div className="image-wrapper">
                  {currentImg && (
                    <>
                      <img src={currentImg} alt={p.name} />
                      {p.imageUrls.length > 1 && (
                        <>
                          <button className="arrow left" onClick={() => handleImageChange(p.id, 'prev', p.imageUrls.length)}>◀</button>
                          <button className="arrow right" onClick={() => handleImageChange(p.id, 'next', p.imageUrls.length)}>▶</button>
                        </>
                      )}
                    </>
                  )}
                </div>
                <div className="info">
                  <h3>{p.name}</h3>
                  <p className="price">${p.price}</p>
                  <Link to={`/producto/${p.id}`}>Ver detalle</Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
