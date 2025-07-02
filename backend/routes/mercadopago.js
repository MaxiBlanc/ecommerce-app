const express = require('express');
const router = express.Router();
const mercadopago = require('mercadopago');

// Configurar access token
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

console.log("MP Access Token:", process.env.MERCADOPAGO_ACCESS_TOKEN);

router.post('/create_preference', async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'items es requerido y debe ser un array con al menos un producto' });
    }

    const preference = {
      items, // 🔥 ¡Esto es lo que faltaba!
      back_urls: {
        success: "https://ecommerce-app-f.netlify.app//success",
        failure: "https://ecommerce-app-f.netlify.app//failure",
        pending: "https://ecommerce-app-f.netlify.app//pending"
      },
      auto_return: "approved"
    };

    console.log("Preference:", preference);

    const response = await mercadopago.preferences.create(preference);

    res.json({ id: response.body.id });
  } catch (error) {
    console.error("Error creando preferencia:", error);
    res.status(500).json({
      message: 'Error creando preferencia de pago',
      error: error.message,
      stack: error.stack
    });
  }
});

module.exports = router;
