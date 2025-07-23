import { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminSucursales.css';

export default function AdminSucursales() {
  const [provincias, setProvincias] = useState([]);
  const [sucursales, setSucursales] = useState([]);

  const [provinciaNombre, setProvinciaNombre] = useState('');
  const [sucursalProvinciaId, setSucursalProvinciaId] = useState('');
  const [sucursalNombre, setSucursalNombre] = useState('');
  const [sucursalPrecio, setSucursalPrecio] = useState('');

  const [editProvinciaId, setEditProvinciaId] = useState(null);
  const [editSucursalId, setEditSucursalId] = useState(null);

  useEffect(() => {
    fetchProvincias();
    fetchSucursales();
  }, []);

  const fetchProvincias = async () => {
    try {
      const res = await axios.get('https://ecommerce-app-0bh1.onrender.com/api/provincias');
      setProvincias(res.data);
    } catch {
      alert('Error al cargar provincias');
    }
  };

  const fetchSucursales = async () => {
    try {
      const res = await axios.get('https://ecommerce-app-0bh1.onrender.com/api/sucursales');
      setSucursales(res.data);
    } catch {
      alert('Error al cargar sucursales');
    }
  };

  const crearProvincia = async (e) => {
    e.preventDefault();
    if (!provinciaNombre.trim()) return alert('Ingresá nombre de provincia');
    try {
      if (editProvinciaId) {
        await axios.put(`https://ecommerce-app-0bh1.onrender.com/api/provincias/${editProvinciaId}`, { name: provinciaNombre });
        setEditProvinciaId(null);
      } else {
        await axios.post('https://ecommerce-app-0bh1.onrender.com/api/provincias', { name: provinciaNombre });
      }
      setProvinciaNombre('');
      fetchProvincias();
    } catch {
      alert('Error creando/actualizando provincia');
    }
  };

  const crearSucursal = async (e) => {
    e.preventDefault();
    if (!sucursalProvinciaId || !sucursalNombre.trim() || !sucursalPrecio) return alert('Datos incompletos');
    try {
      if (editSucursalId) {
        await axios.put(`https://ecommerce-app-0bh1.onrender.com/api/sucursales/${editSucursalId}`, {
          provinciaId: sucursalProvinciaId,
          name: sucursalNombre,
          price: Number(sucursalPrecio),
        });
        setEditSucursalId(null);
      } else {
        await axios.post('https://ecommerce-app-0bh1.onrender.com/api/sucursales', {
          provinciaId: sucursalProvinciaId,
          name: sucursalNombre,
          price: Number(sucursalPrecio),
        });
      }
      setSucursalNombre('');
      setSucursalPrecio('');
      setSucursalProvinciaId('');
      fetchSucursales();
    } catch {
      alert('Error creando/actualizando sucursal');
    }
  };

  const handleEditProvincia = (provincia) => {
    setProvinciaNombre(provincia.name);
    setEditProvinciaId(provincia.id);
  };

  const handleDeleteProvincia = async (id) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm('¿Eliminar provincia?')) {
      await axios.delete(`https://ecommerce-app-0bh1.onrender.com/api/provincias/${id}`);
      fetchProvincias();
    }
  };

  const handleEditSucursal = (sucursal) => {
    setSucursalNombre(sucursal.name);
    setSucursalPrecio(sucursal.price);
    setSucursalProvinciaId(sucursal.provincia.id);
    setEditSucursalId(sucursal.id);
  };

  const handleDeleteSucursal = async (id) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm('¿Eliminar sucursal?')) {
      await axios.delete(`https://ecommerce-app-0bh1.onrender.com/api/sucursales/${id}`);
      fetchSucursales();
    }
  };

  return (
    <div className="admin-sucursales-container">
      <h2>Administrar Provincias y Sucursales</h2>

      <form onSubmit={crearProvincia} className="admin-sucursales-form">
        <h3>{editProvinciaId ? 'Editar Provincia' : 'Crear Provincia'}</h3>
        <input
          type="text"
          placeholder="Nombre provincia"
          value={provinciaNombre}
          onChange={e => setProvinciaNombre(e.target.value)}
        />
        <button type="submit">{editProvinciaId ? 'Actualizar' : 'Crear'}</button>
      </form>

      <form onSubmit={crearSucursal} className="admin-sucursales-form">
        <h3>{editSucursalId ? 'Editar Sucursal' : 'Crear Sucursal'}</h3>
        <select
          value={sucursalProvinciaId}
          onChange={e => setSucursalProvinciaId(e.target.value)}
        >
          <option value="">Seleccioná una provincia</option>
          {provincias.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Nombre sucursal"
          value={sucursalNombre}
          onChange={e => setSucursalNombre(e.target.value)}
        />
        <input
          type="number"
          placeholder="Precio"
          value={sucursalPrecio}
          onChange={e => setSucursalPrecio(e.target.value)}
        />
        <button type="submit">{editSucursalId ? 'Actualizar' : 'Crear'}</button>
      </form>

      <h3>Provincias Existentes</h3>
      <ul className="admin-sucursales-list">
        {provincias.map(p => (
          <li key={p.id}>
            {p.name}
            <button className="btn-admin btn-admin-edit" onClick={() => handleEditProvincia(p)}>Editar</button>
            <button className="btn-admin btn-admin-delete" onClick={() => handleDeleteProvincia(p.id)}>Eliminar</button>
          </li>
        ))}
      </ul>

      <h3>Sucursales Existentes</h3>  
      <ul className="admin-sucursales-list">
        {sucursales.map(s => (
          <li key={s.id}>
            {s.name} - Provincia: {provincias.find(p => p.id === s.provincia.id)?.name || 'N/A'} - Precio: ${s.price}
            <button className="btn-admin btn-admin-edit" onClick={() => handleEditSucursal(s)}>Editar</button>
            <button className="btn-admin btn-admin-delete" onClick={() => handleDeleteSucursal(s.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
