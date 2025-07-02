import axios from 'axios';
import { auth } from '../firebase/firebaseConfig';

// Crear un pedido autenticado
export const crearPedido = async (dataPedido) => {
  const token = await auth.currentUser.getIdToken();

  return axios.post('http://localhost:5000/orders', dataPedido, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};
