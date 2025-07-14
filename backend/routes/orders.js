const express = require('express');
const router = express.Router();
const { db } = require('../firebase');

// Crear pedido sin autenticación
router.post('/', async (req, res) => {
  try {
    const { products, totalAmount, customerName, customerEmail } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'El pedido debe tener productos' });
    }
    if (!customerName || !customerEmail) {
      return res.status(400).json({ message: 'Faltan nombre o email del cliente' });
    }
    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ message: 'Monto total inválido' });
    }

    const batch = db.batch();

    for (const item of products) {
      if (!item.productId || !item.talla || !item.quantity) {
        return res.status(400).json({ message: 'Faltan datos del producto (productId, talla o quantity)' });
      }

      const productRef = db.collection('products').doc(item.productId);
      const productDoc = await productRef.get();

      if (!productDoc.exists) {
        return res.status(404).json({ message: `Producto no encontrado: ${item.productId}` });
      }

      const productData = productDoc.data();
      const tallaIndex = productData.sizes.findIndex(s => s.talla === item.talla);

      if (tallaIndex === -1) {
        return res.status(400).json({ message: `Talla ${item.talla} no encontrada para el producto ${productData.name}` });
      }

      if (item.quantity > productData.sizes[tallaIndex].stock) {
        return res.status(400).json({ message: `Stock insuficiente para ${productData.name} - Talla ${item.talla}` });
      }

      productData.sizes[tallaIndex].stock -= item.quantity;
      batch.update(productRef, { sizes: productData.sizes });
    }

    const newOrder = {
      products,
      totalAmount,
      customerName,
      customerEmail,
      status: 'pendiente',
      createdAt: new Date()
    };

    const orderRef = db.collection('orders').doc();
    batch.set(orderRef, newOrder);

    // Si querés vaciar un carrito, usá el email como ID del doc
    const cartRef = db.collection('carts').doc(customerEmail);
    batch.set(cartRef, { products: [] });

    await batch.commit();

    res.status(201).json({ id: orderRef.id, ...newOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear pedido' });
  }
});

// Obtener todos los pedidos
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('orders').orderBy('createdAt', 'desc').get();
    const pedidos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(pedidos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener pedidos' });
  }
});

// Obtener pedidos por email
// Obtener pedidos por email (sin autenticación)
router.get('/by-email/:email', async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);

    const ordersSnapshot = await db.collection('orders')
      .where('customerEmail', '==', email)
      //.orderBy('createdAt', 'desc')
      .get();

    const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(orders);
  } catch (error) {
    console.error('Error al obtener pedidos por email:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});


// Cambiar estado de pedido
router.patch('/:id/status', async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'El estado es obligatorio' });
    }

    const orderRef = db.collection('orders').doc(orderId);
    await orderRef.update({ status });

    res.json({ message: 'Estado actualizado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar estado del pedido' });
  }
});


// Cambiar estado de pedido
router.put('/update-status/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Estado requerido' });
  }

  try {
    const orderRef = db.collection('orders').doc(id);
    await orderRef.update({ status });
    res.send({ message: 'Estado actualizado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error actualizando estado del pedido' });
  }
});



module.exports = router;
