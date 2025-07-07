const express = require('express');
const router = express.Router();
const { db } = require('../firebase');
const authenticate = require('../middleware/authenticate');

// Crear un pedido (protegida)
router.post('/', authenticate, async (req, res) => {
  try {
    const { products, totalAmount } = req.body;
    const customerId = req.user.uid;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'El pedido debe tener productos' });
    }
    if (!customerId) {
      return res.status(400).json({ message: 'El ID del cliente es obligatorio' });
    }
    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ message: 'Monto total inválido' });
    }

    // Validar que el cliente exista
    const clientRef = db.collection('clients').doc(customerId);
    const clientDoc = await clientRef.get();
    if (!clientDoc.exists) {
      return res.status(400).json({ message: 'Cliente no encontrado' });
    }

    // Validar stock por talla y preparar batch
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

      // Restar stock
      productData.sizes[tallaIndex].stock -= item.quantity;
      batch.update(productRef, { sizes: productData.sizes });
    }

    // Crear pedido
    const newOrder = {
      products, // [{ productId, talla, quantity, name, price }]
      totalAmount,
      customerId,
      customerName: clientDoc.data().name,
      status: 'pendiente',
      createdAt: new Date()
    };

    const orderRef = db.collection('orders').doc();
    batch.set(orderRef, newOrder);

    // Vaciar carrito
    const cartRef = db.collection('carts').doc(customerId);
    batch.set(cartRef, { products: [] });

    await batch.commit();

    res.status(201).json({ id: orderRef.id, ...newOrder });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear pedido' });
  }
});

// Listar todos los pedidos (protegida)
router.get('/', authenticate, async (req, res) => {
  try {
    const ordersSnapshot = await db.collection('orders').orderBy('createdAt', 'desc').get();
    const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener pedidos' });
  }
});

// Actualizar estado pedido (protegida)
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'El estado es obligatorio' });
    }

    const orderRef = db.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    await orderRef.update({ status });

    res.json({ message: 'Estado actualizado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar estado' });
  }
});

// Listar pedidos por cliente (protegida)
router.get('/by-client/:clientId', authenticate, async (req, res) => {
  try {
    const { clientId } = req.params;

    if (clientId !== req.user.uid) {
      return res.status(403).json({ message: 'No autorizado para ver estos pedidos' });
    }

    const ordersSnapshot = await db.collection('orders')
      .where('customerId', '==', clientId)
      .orderBy('createdAt', 'desc')
      .get();

    const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(orders);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener pedidos por cliente' });
  }
});

module.exports = router;
