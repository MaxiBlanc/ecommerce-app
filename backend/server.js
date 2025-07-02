const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { db } = require('./firebase');

const app = express();
const PORT = process.env.PORT || 5000;
const uploadRouter = require('./routes/upload');

app.use(express.json());


app.use(cors());
app.use(express.json());

const mercadoPagoRoutes = require('./routes/mercadopago');
app.use('/mercadopago', mercadoPagoRoutes);

const productsRoutes = require('./routes/products');
app.use('/products', productsRoutes);

// const cartRoutes = require('./routes/cart');
// app.use('/cart', cartRoutes);

const ordersRoutes = require('./routes/orders');
app.use('/orders', ordersRoutes);

const clientsRoutes = require('./routes/clients');
app.use('/clients', clientsRoutes);


app.get('/', (req, res) => {
  res.send('Servidor funcionando 👌');
});

// Ruta para probar Firestore
app.get('/test-firestore', async (req, res) => {
  try {
    const snapshot = await db.collection('test').get();
    const docs = snapshot.docs.map(doc => doc.data());
    res.json(docs);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error conectando a Firestore');
  }
});

app.use('/upload', uploadRouter);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});


