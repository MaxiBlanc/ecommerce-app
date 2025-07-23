const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Asumo que admin ya está inicializado en tu backend

const db = admin.firestore();

// Crear provincia
router.post('/provincias', async (req, res) => {
    console.log('Body recibido:', req.body);
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'El nombre es obligatorio' });

    // Verificar si ya existe alguna provincia con ese nombre
    const provinciaQuery = await db.collection('provincias').where('name', '==', name).get();
    if (!provinciaQuery.empty) {
      return res.status(400).json({ error: 'La provincia ya existe' });
    }

    const docRef = await db.collection('provincias').add({ name });
    const provinciaCreada = await docRef.get();

    res.status(201).json({ id: docRef.id, ...provinciaCreada.data() });
  } catch (error) {
    console.error('Error creando provincia:', error);
    res.status(500).json({ error: 'Error creando la provincia' });
  }
});

// Listar provincias
router.get('/provincias', async (req, res) => {
     console.log('GET /provincias llamada');
  try {
    const snapshot = await db.collection('provincias').get();
    const provincias = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(provincias);
  } catch (error) {
    console.error('Error obteniendo provincias:', error);
    res.status(500).json({ error: 'Error obteniendo provincias' });
  }
});

// Crear sucursal
router.post('/sucursales', async (req, res) => {
  try {
    const { name, price, provinciaId } = req.body;
    if (!name || price === undefined || !provinciaId) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    // Verificar que la provincia exista
    const provinciaDoc = await db.collection('provincias').doc(provinciaId).get();
    if (!provinciaDoc.exists) {
      return res.status(400).json({ error: 'Provincia no existe' });
    }

    const sucursalData = { name, price, provinciaId };
    const docRef = await db.collection('sucursales').add(sucursalData);
    const sucursalCreada = await docRef.get();

    res.status(201).json({ id: docRef.id, ...sucursalCreada.data() });
  } catch (error) {
    console.error('Error creando sucursal:', error);
    res.status(500).json({ error: 'Error creando la sucursal' });
  }
});

// Listar sucursales con la info de la provincia incluida
router.get('/sucursales', async (req, res) => {
  try {
    const sucursalesSnapshot = await db.collection('sucursales').get();
    const sucursales = [];

    for (const doc of sucursalesSnapshot.docs) {
      const data = doc.data();
      const provinciaDoc = await db.collection('provincias').doc(data.provinciaId).get();
      const provinciaData = provinciaDoc.exists ? provinciaDoc.data() : null;

      sucursales.push({
        id: doc.id,
        name: data.name,
        price: data.price,
        provincia: provinciaData ? { id: provinciaDoc.id, ...provinciaData } : null
      });
    }

    res.json(sucursales);
  } catch (error) {
    console.error('Error obteniendo sucursales:', error);
    res.status(500).json({ error: 'Error obteniendo sucursales' });
  }
});


router.delete('/provincias/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('provincias').doc(id).delete();
    res.status(200).json({ message: 'Provincia eliminada' });
  } catch (error) {
    console.error('Error eliminando provincia:', error);
    res.status(500).json({ error: 'Error eliminando provincia' });
  }
});
router.put('/provincias/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'El nombre es obligatorio' });

    await db.collection('provincias').doc(id).update({ name });
    res.status(200).json({ message: 'Provincia actualizada' });
  } catch (error) {
    console.error('Error actualizando provincia:', error);
    res.status(500).json({ error: 'Error actualizando provincia' });
  }
});
router.delete('/sucursales/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('sucursales').doc(id).delete();
    res.status(200).json({ message: 'Sucursal eliminada' });
  } catch (error) {
    console.error('Error eliminando sucursal:', error);
    res.status(500).json({ error: 'Error eliminando sucursal' });
  }
});
router.put('/sucursales/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, provinciaId } = req.body;
    if (!name || price === undefined || !provinciaId) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    await db.collection('sucursales').doc(id).update({ name, price, provinciaId });
    res.status(200).json({ message: 'Sucursal actualizada' });
  } catch (error) {
    console.error('Error actualizando sucursal:', error);
    res.status(500).json({ error: 'Error actualizando sucursal' });
  }
});

module.exports = router;
