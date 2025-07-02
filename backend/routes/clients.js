const express = require('express');
const router = express.Router();
const { db } = require('../firebase');

// Crear cliente
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Nombre es obligatorio' });

    const newClient = { name, createdAt: new Date() };
    const docRef = await db.collection('clients').add(newClient);
    res.status(201).json({ id: docRef.id, ...newClient });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear cliente' });
  }
});

// Listar clientes
router.get('/', async (req, res) => {
  try {
    const clientsSnapshot = await db.collection('clients').orderBy('createdAt', 'desc').get();
    const clients = clientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(clients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener clientes' });
  }
});

module.exports = router;
