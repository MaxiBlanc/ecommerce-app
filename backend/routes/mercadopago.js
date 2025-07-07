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
    const { items } = req.body;

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
      notification_url: "https://ecommerce-app-0bh1.onrender.com/mercadopago/webhook", // 🔔 Asegurate que esta URL sea pública
      metadata: {
        items
      }
    };

    const response = await mercadopago.preferences.create(preference);
    res.json({ init_point: response.body.init_point });
  } catch (error) {
    console.error("Error creando preferencia:", error);
    res.status(500).json({
      message: 'Error creando preferencia de pago',
      error: error.message,
      stack: error.stack
    });
  }
});

// Webhook que guarda orden si el pago es aprobado
router.post('/webhook', async (req, res) => {
  try {
    const paymentId = req.body.data?.id;

    if (!paymentId) return res.status(400).send('Falta payment ID');

    const payment = await mercadopago.payment.findById(paymentId);

    if (payment.body.status === 'approved') {
      const metadata = payment.body.metadata;

      const newOrder = {
        buyer: payment.body.payer.email,
        products: metadata.items || [],
        amount: payment.body.transaction_amount,
        status: 'approved',
        createdAt: new Date()
      };

      await db.collection('orders').add(newOrder);
      console.log('✅ Orden guardada en Firestore');
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('❌ Error en webhook:', error);
    res.sendStatus(500);
  }
});

module.exports = router;
