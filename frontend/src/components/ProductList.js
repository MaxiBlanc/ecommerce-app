import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [orden, setOrden] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [imageIndices, setImageIndices] = useState({});

  useEffect(() => {
    fetchProductos();
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
    else if (orden === 'fechaAsc') ordenados.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    else if (orden === 'fechaDesc') ordenados.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
    <div style={{ maxWidth: 800, margin: 'auto' }}>
      <h2>Productos</h2>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <select onChange={e => setOrden(e.target.value)} defaultValue="">
          <option value="">Ordenar por...</option>
          <option value="precioAsc">Precio: Menor a mayor</option>
          <option value="precioDesc">Precio: Mayor a menor</option>
          <option value="fechaDesc">Más nuevos</option>
        </select>

        <select onChange={e => setTipoFiltro(e.target.value)} defaultValue="">
          <option value="">Filtrar por tipo...</option>
          <option value="alimento">Alimento</option>
          <option value="bebida">Bebida</option>
          <option value="electro">Electro</option>
        </select>
      </div>

      {productosAMostrar.length === 0 ? (
        <p>No hay productos para mostrar</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {productosAMostrar.map(p => {
            const imgIndex = imageIndices[p.id] || 0;
            const hasImages = Array.isArray(p.imageUrls) && p.imageUrls.length > 0;
            const currentImg = hasImages ? p.imageUrls[imgIndex] : null;

            return (
              <li key={p.id} style={{ marginBottom: 30, borderBottom: '1px solid #ccc', paddingBottom: 20 }}>
                <h3>{p.name}</h3>
                <p><strong>Precio:</strong> ${p.price}</p>
                <p><strong>Tipo:</strong> {p.type}</p>

                {currentImg ? (
                  <div>
                    <img src={currentImg} alt={p.name} style={{ maxWidth: 200, height: 'auto' }} />
                    {p.imageUrls.length > 1 && (
                      <div style={{ marginTop: 10 }}>
                        <button onClick={() => handleImageChange(p.id, 'prev', p.imageUrls.length)}>◀️</button>
                        <button onClick={() => handleImageChange(p.id, 'next', p.imageUrls.length)}>▶️</button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p>Sin imagen</p>
                )}

                <Link
                  to={`/producto/${p.id}`}
                  style={{
                    display: 'inline-block',
                    marginTop: 10,
                    backgroundColor: '#007bff',
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: 4,
                    textDecoration: 'none'
                  }}
                >
                  Ver detalle
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
