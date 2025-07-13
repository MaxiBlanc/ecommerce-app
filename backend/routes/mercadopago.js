const express = require('express');
const router = express.Router();
const mercadopago = require('mercadopago');
const { db } = require('../firebase');

// Configurar access token
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

// Crear preferencia de pago
router.post('/create_preference', async (req, res) => {
  try {
    const { items, customerEmail, customerName } = req.body;
    console.log('✅ Preferencia recibida:', JSON.stringify(req.body));

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'items es requerido y debe ser un array con al menos un producto' });
    }

    const preference = {
      items,
      back_urls: {
        success: "https://ecommerce-app-f.netlify.app/",
        failure: "https://ecommerce-app-f.netlify.app/failure",
        pending: "https://ecommerce-app-f.netlify.app/pending"
      },
      auto_return: "approved",
      notification_url: "https://ecommerce-app-0bh1.onrender.com/mercadopago/webhook",
      metadata: {
        items,
        customerEmail,
        customerName
      }
    };

    const response = await mercadopago.preferences.create(preference);
    res.json({ init_point: response.body.init_point });
  } catch (error) {
    console.error("❌ Error creando preferencia:", error);
    res.status(500).json({
      message: 'Error creando preferencia de pago',
      error: error.message,
      stack: error.stack
    });
  }
});

// Webhook para recibir notificaciones de pago
router.post('/webhook', async (req, res) => {
  try {
    console.log('✅ Webhook recibido:', JSON.stringify(req.body));

    const topic = req.query.topic || req.query.type;
    const paymentId = req.body.data?.id;

    if (topic === 'payment' && paymentId) {
      const payment = await mercadopago.payment.findById(paymentId);
      console.log('🔍 Payment encontrado:', payment.body);

      if (payment.body.status === 'approved') {
        const metadata = payment.body.metadata || {};

        const customerEmail = metadata.customerEmail || '';
        const customerName = metadata.customerName || '';
        const products = metadata.items || [];

        console.log('📩 Datos de cliente:', customerEmail, customerName);

        // Verificar si la orden ya existe
        const existingOrders = await db.collection('orders')
          .where('paymentId', '==', paymentId)
          .get();

        if (!existingOrders.empty) {
          console.log('⚠️ Orden ya existente, no se duplica');
          return res.sendStatus(200);
        }

        // Crear nueva orden
        const newOrder = {
          paymentId,
          buyer: payment.body.payer?.email || '',
          customerEmail,
          customerName,
          products,
          amount: payment.body.transaction_amount,
          status: 'approved',
          createdAt: new Date()
        };

        await db.collection('orders').add(newOrder);
        console.log('✅ Orden guardada en Firestore:', newOrder);

        // 🔄 Actualizar stock de cada producto y talla
        for (const item of products) {
          console.log("📦 Procesando producto:", item);

          if (!item.productId || !item.talla || !item.quantity) {
            console.log("❌ Faltan datos para actualizar stock");
            continue;
          }

          const productRef = db.collection('products').doc(item.productId);
          const productSnap = await productRef.get();

          if (productSnap.exists) {
            const productData = productSnap.data();

            const updatedSizes = productData.sizes.map(size => {
              if (size.talla === item.talla) {
                return {
                  ...size,
                  stock: Math.max(0, size.stock - item.quantity)
                };
              }
              return size;
            });

            await productRef.update({ sizes: updatedSizes });
            console.log(`🔄 Stock actualizado para ${item.name}, talla ${item.talla}`);
          } else {
            console.log(`❌ Producto no encontrado: ${item.productId}`);
          }
        }
      }
    } else {
      console.log('❌ Webhook sin paymentId válido:', req.body);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('❌ Error en webhook:', error);
    res.sendStatus(500);
  }
});

module.exports = router;
