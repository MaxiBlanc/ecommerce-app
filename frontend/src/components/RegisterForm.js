import { useState } from 'react';
import { auth } from '../firebase/firebaseconfig';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';


export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Actualizar nombre del usuario
      await updateProfile(userCredential.user, { displayName: name });

      // Enviar correo de verificación
      await sendEmailVerification(userCredential.user);


      setSuccess('Registro exitoso. Verificá tu correo electrónico antes de iniciar sesión.');
      setEmail('');
      setPassword('');
      setName('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 300, margin: 'auto' }}>
      <h2>Registro</h2>
      <input 
        type="text" 
        placeholder="Nombre" 
        value={name} 
        onChange={e => setName(e.target.value)} 
        required 
      />
      <input 
        type="email" 
        placeholder="Email" 
        value={email} 
        onChange={e => setEmail(e.target.value)} 
        required 
      />
      <input 
        type="password" 
        placeholder="Contraseña" 
        value={password} 
        onChange={e => setPassword(e.target.value)} 
        required 
      />
      <button type="submit">Registrarse</button>
      {error && <p style={{color: 'red'}}>{error}</p>}
      {success && <p style={{color: 'green'}}>{success}</p>}
    </form>
  );
}
