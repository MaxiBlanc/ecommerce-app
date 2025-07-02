import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ProductAdmin() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState('');
  const [imageFiles, setImageFiles] = useState([]); // archivos seleccionados
  const [imageUrls, setImageUrls] = useState([]);   // URLs subidas
  const [products, setProducts] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null); // para saber si estamos editando

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/products`);
      setProducts(res.data);
    } catch (error) {
      console.error('Error al obtener productos', error);
      alert('Error al obtener productos');
    }
  };

  const handleImageFilesChange = (e) => {
    setImageFiles(Array.from(e.target.files)); // múltiple selección
  };

  const handleUploadImages = async () => {
    setUploading(true);
    try {
      const uploadedUrls = [];
      for (const file of imageFiles) {
        const formData = new FormData();
        formData.append('image', file);
        const res = await axios.post(`${API_URL}/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploadedUrls.push(res.data.url);
      }
      setImageUrls(uploadedUrls);
      alert('Imágenes cargadas correctamente');
    } catch (error) {
      console.error('Error al cargar imágenes', error);
      alert('Error al cargar imágenes');
    }
    setUploading(false);
  };

  const handleAddOrUpdateProduct = async (e) => {
    e.preventDefault();

    if (uploading) {
      alert('Espera a que terminen de cargar las imágenes');
      return;
    }

    try {
      const product = {
        name,
        price: parseFloat(price),
        type,
        description,
        stock: parseInt(stock) || 0,
        imageUrls,
      };

      if (editingId) {
        // Editar producto existente
        await axios.patch(`${API_URL}/products/${editingId}`, product);
        setEditingId(null);
      } else {
        // Agregar producto nuevo
        await axios.post(`${API_URL}/products`, product);
      }

      // Limpiar formulario
      setName('');
      setPrice('');
      setType('');
      setDescription('');
      setStock('');
      setImageFiles([]);
      setImageUrls([]);
      fetchProducts();
    } catch (error) {
      console.error('Error al guardar producto', error);
      alert('Error al guardar producto');
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setName(product.name);
    setPrice(product.price);
    setType(product.type);
    setDescription(product.description || '');
    setStock(product.stock || '');
    setImageUrls(product.imageUrls || []);
    setImageFiles([]); // si quieres que pueda subir más imágenes, queda listo
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro que querés eliminar este producto?')) return;
    try {
      await axios.delete(`${API_URL}/products/${id}`);
      fetchProducts();
    } catch (error) {
      console.error('Error al eliminar producto', error);
      alert('Error al eliminar producto');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto' }}>
      <h2>{editingId ? 'Editar Producto' : 'Agregar Producto'}</h2>
      <form onSubmit={handleAddOrUpdateProduct} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} required />
        <input placeholder="Precio" type="number" value={price} onChange={e => setPrice(e.target.value)} required />
        <input placeholder="Tipo" value={type} onChange={e => setType(e.target.value)} required />
        <input placeholder="Descripción" value={description} onChange={e => setDescription(e.target.value)} />
        <input placeholder="Stock" type="number" value={stock} onChange={e => setStock(e.target.value)} />

        <label>Seleccionar imágenes (múltiples):</label>
        <input type="file" multiple accept="image/*" onChange={handleImageFilesChange} />

        <button type="button" onClick={handleUploadImages} disabled={uploading || imageFiles.length === 0}>
          {uploading ? 'Cargando...' : 'Cargar imágenes'}
        </button>

        {imageUrls.length > 0 && (
          <div>
            <p>Imágenes subidas:</p>
            {imageUrls.map((url, i) => (
              <img key={i} src={url} alt={`imagen ${i + 1}`} style={{ width: 100, marginRight: 10 }} />
            ))}
          </div>
        )}

        <button type="submit" disabled={uploading}>{editingId ? 'Guardar cambios' : 'Agregar producto'}</button>
        {editingId && (
          <button type="button" onClick={() => {
            setEditingId(null);
            setName('');
            setPrice('');
            setType('');
            setDescription('');
            setStock('');
            setImageUrls([]);
            setImageFiles([]);
          }}>Cancelar edición</button>
        )}
      </form>

      <hr />

      <h3>Productos existentes</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {products.map(p => (
          <li key={p.id} style={{ borderBottom: '1px solid #ccc', padding: 10 }}>
            <strong>{p.name}</strong> - ${p.price}
            <div>
              <button onClick={() => handleEdit(p)} style={{ marginRight: 10 }}>✏️ Editar</button>
              <button onClick={() => handleDelete(p.id)}>🗑️ Eliminar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
