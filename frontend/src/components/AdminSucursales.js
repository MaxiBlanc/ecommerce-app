import { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminSucursales.css';

export default function AdminSucursales() {
  const [provincias, setProvincias] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  
  // Formularios
  const [provinciaNombre, setProvinciaNombre] = useState('');
  const [sucursalProvinciaId, setSucursalProvinciaId] = useState('');
  const [sucursalNombre, setSucursalNombre] = useState('');
  const [sucursalPrecio, setSucursalPrecio] = useState('');

  // Cargar provincias y sucursales
  useEffect(() => {
    fetchProvincias();
    fetchSucursales();
  }, []);

  const fetchProvincias = async () => {
    try {
      const res = await axios.get('https://ecommerce-app-0bh1.onrender.com/api/provincias');
      setProvincias(res.data);
    } catch (error) {
      alert('Error al cargar provincias');
    }
  };

  const fetchSucursales = async () => {
    try {
      const res = await axios.get('https://ecommerce-app-0bh1.onrender.com/api/sucursales');
      console.log('Sucursales recibidas:', res.data); // <-- ACA ESTÁ EL CONSOLE.LOG
      setSucursales(res.data);
    } catch (error) {
      alert('Error al cargar sucursales');
    }
  };

  const crearProvincia = async (e) => {
    e.preventDefault();
    if (!provinciaNombre.trim()) return alert('Ingresá nombre de provincia');
    try {
      await axios.post('https://ecommerce-app-0bh1.onrender.com/api/provincias', { name: provinciaNombre });
      setProvinciaNombre('');
      fetchProvincias();
      alert('Provincia creada');
    } catch {
      alert('Error creando provincia');
    }
  };

  const crearSucursal = async (e) => {
    e.preventDefault();
    if (!sucursalProvinciaId) return alert('Seleccioná una provincia');
    if (!sucursalNombre.trim()) return alert('Ingresá nombre de sucursal');
    if (!sucursalPrecio || isNaN(Number(sucursalPrecio))) return alert('Ingresá un precio válido');

    try {
      await axios.post('https://ecommerce-app-0bh1.onrender.com/api/sucursales', {
        provinciaId: sucursalProvinciaId,
        name: sucursalNombre,
        price: Number(sucursalPrecio),
      });
      setSucursalNombre('');
      setSucursalPrecio('');
      setSucursalProvinciaId('');
      fetchSucursales();
      alert('Sucursal creada');
    } catch {
      alert('Error creando sucursal');
    }
  };

  return (
    <div className="admin-sucursales-container">
      <h2>Administrar Provincias y Sucursales</h2>

      <form onSubmit={crearProvincia} className="admin-sucursales-form">
        <h3>Crear Provincia</h3>
        <input
          type="text"
          placeholder="Nombre provincia"
          value={provinciaNombre}
          onChange={e => setProvinciaNombre(e.target.value)}
        />
        <button type="submit">Crear Provincia</button>
      </form>

      <form onSubmit={crearSucursal} className="admin-sucursales-form">
        <h3>Crear Sucursal</h3>
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
        <button type="submit">Crear Sucursal</button>
      </form>

      <h3>Provincias Existentes</h3>
      <ul className="admin-sucursales-list">
        {provincias.map(p => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>

      <h3>Sucursales Existentes</h3>  
      <ul className="admin-sucursales-list">
        {sucursales.map(s => (
          <li key={s.id}>
            {s.name} - Provincia: {provincias.find(p => p.id === s.provincia.id)?.name || 'N/A'} - Precio: ${s.price}
          </li>
        ))}
      </ul>
    </div>
  );
}
