import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../components/ProductAdmin.css';

export default function ProductAdmin() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [sizes, setSizes] = useState([]);
  const [newSize, setNewSize] = useState('');
  const [newStock, setNewStock] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [products, setProducts] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'https://ecommerce-app-0bh1.onrender.com/';

  const fetchProducts = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}products`);
      setProducts(res.data);
    } catch (error) {
      console.error('Error al obtener productos', error);
      alert('Error al obtener productos');
    }
  }, [API_URL]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleImageFilesChange = (e) => {
    setImageFiles(Array.from(e.target.files));
  };

  const handleUploadImages = async () => {
    setUploading(true);
    try {
      const uploadedUrls = [];
      for (const file of imageFiles) {
        const formData = new FormData();
        formData.append('image', file);
        const res = await axios.post(`${API_URL}upload`, formData, {
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

  const handleAddSize = () => {
    if (!newSize || !newStock || isNaN(newStock) || parseInt(newStock) < 0) return;
    setSizes([...sizes, { talla: newSize, stock: parseInt(newStock) }]);
    setNewSize('');
    setNewStock('');
  };

  const handleDeleteSize = (index) => {
    const updated = [...sizes];
    updated.splice(index, 1);
    setSizes(updated);
  };

  const handleAddOrUpdateProduct = async (e) => {
    e.preventDefault();
    if (uploading) return alert('Esperá a que terminen de cargar las imágenes');

    try {
      const product = {
        name,
        price: parseFloat(price),
        type,
        description,
        imageUrls,
        sizes
      };

      if (editingId) {
        await axios.patch(`${API_URL}products/${editingId}`, product);
        setEditingId(null);
      } else {
        await axios.post(`${API_URL}products`, product);
      }

      // Reset form
      setName('');
      setPrice('');
      setType('');
      setDescription('');
      setSizes([]);
      setNewSize('');
      setNewStock('');
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
    setSizes(product.sizes || []);
    setImageUrls(product.imageUrls || []);
    setImageFiles([]);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro que querés eliminar este producto?')) return;
    try {
      await axios.delete(`${API_URL}products/${id}`);
      fetchProducts();
    } catch (error) {
      console.error('Error al eliminar producto', error);
      alert('Error al eliminar producto');
    }
  };

return (
  <div className="product-admin-container">
    <h2 className="product-admin-title">
      {editingId ? 'Editar Producto' : 'Agregar Producto'}
    </h2>
    <form onSubmit={handleAddOrUpdateProduct} className="product-admin-form">
      <input
        placeholder="Nombre"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <input
        placeholder="Precio"
        type="number"
        value={price}
        onChange={e => setPrice(e.target.value)}
        required
      />
      <input
        placeholder="Tipo"
        value={type}
        onChange={e => setType(e.target.value)}
        required
      />
      <input
        placeholder="Descripción"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />

      <div>
        <strong>Tallas:</strong>
        <div className="product-admin-sizes">
          {sizes.map((s, i) => (
            <div key={i} className="product-admin-size-item">
              <span>
                {s.talla} - Stock: {s.stock}
              </span>
              <button type="button" onClick={() => handleDeleteSize(i)}>❌</button>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              placeholder="Talla"
              value={newSize}
              onChange={e => setNewSize(e.target.value)}
            />
            <input
              placeholder="Stock"
              type="number"
              value={newStock}
              onChange={e => setNewStock(e.target.value)}
            />
            <button type="button" onClick={handleAddSize}>➕</button>
          </div>
        </div>
      </div>

      <label>Seleccionar imágenes (múltiples):</label>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageFilesChange}
      />

      <button
        type="button"
        onClick={handleUploadImages}
        disabled={uploading || imageFiles.length === 0}
      >
        {uploading ? 'Cargando...' : 'Cargar imágenes'}
      </button>

      {imageUrls.length > 0 && (
        <div className="product-admin-images">
          {imageUrls.map((url, i) => (
            <img key={i} src={url} alt={`imagen ${i + 1}`} />
          ))}
        </div>
      )}

      <button type="submit" disabled={uploading}>
        {editingId ? 'Guardar cambios' : 'Agregar producto'}
      </button>
      {editingId && (
        <button
          type="button"
          onClick={() => {
            setEditingId(null);
            setName('');
            setPrice('');
            setType('');
            setDescription('');
            setSizes([]);
            setNewSize('');
            setNewStock('');
            setImageUrls([]);
            setImageFiles([]);
          }}
        >
          Cancelar edición
        </button>
      )}
    </form>

    <hr />

    <h3>Productos existentes</h3>
    <ul className="product-admin-products">
      {products.map(p => (
        <li key={p.id} className="product-admin-product-item">
          <strong>{p.name}</strong>  ${p.price}
          <div>
            <button onClick={() => handleEdit(p)} style={{ marginRight: 10 }}>✏️</button>
            <button onClick={() => handleDelete(p.id)}>🗑️</button>
          </div>
        </li>
      ))}
    </ul>
  </div>
);
}
