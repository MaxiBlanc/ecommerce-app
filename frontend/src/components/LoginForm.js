import { useState, useEffect } from 'react';
import { auth, onAuthStateChanged  } from '../firebase/firebaseconfig';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';


export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
const navigate = useNavigate();


useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      signOut(auth)
        .then(() => console.log('Sesión cerrada'))
        .catch((err) => console.error('Error cerrando sesión:', err));
    }
  });

  return () => unsubscribe(); // Limpia el listener al desmontar
}, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        return setError('Debes verificar tu correo antes de iniciar sesión.');
      }

      const token = await user.getIdToken(); // 👈 Obtener el token
      localStorage.setItem('token', token); // 👈 Guardarlo

      setSuccess(`Bienvenido, ${user.displayName || user.email}`);
      setEmail('');
      setPassword('');
navigate('/');

      // Redireccionar si querés
      // window.location.href = '/mis-pedidos';
    } catch (err) {
      setError('Email o contraseña incorrectos');
    }
  };

  return (
    <form onSubmit={handleLogin} style={{ maxWidth: 300, margin: 'auto' }}>
      <h2>Iniciar sesión</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Entrar</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </form>
  );
}
