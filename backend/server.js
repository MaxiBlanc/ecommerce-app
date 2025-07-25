const express = require('express');
require('dotenv').config();

const { db } = require('./firebase');

const app = express();
const PORT = process.env.PORT || 5000;
const uploadRouter = require('./routes/upload');
const cors = require('cors');

const corsOptions = {
  origin: 'https://ecommerce-app-f.netlify.app', // o '*' para permitir todos
};

app.use(cors(corsOptions));
app.use(express.json());


const mercadoPagoRoutes = require('./routes/mercadopago');
app.use('/mercadopago', mercadoPagoRoutes);

const productsRoutes = require('./routes/products');
app.use('/products', productsRoutes);   

const provinciasSucursalesRouter = require('./routes/provinciasSucursales');

app.use('/api', provinciasSucursalesRouter);

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


