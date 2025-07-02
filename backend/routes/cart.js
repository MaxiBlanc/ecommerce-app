// const express = require('express');
// const router = express.Router();
// const { db } = require('../firebase');

// const CART_ID = 'default-cart';

// // // Obtener carrito
// // router.get('/', async (req, res) => {
// //   try {
// //     const cartDoc = await db.collection('carts').doc(CART_ID).get();
// //     if (!cartDoc.exists) return res.json({ products: [] });
// //     res.json(cartDoc.data());
// //   } catch (error) {
// //     console.error(error);
// //     res.status(500).json({ message: 'Error al obtener carrito' });
// //   }
// // });

// // // Agregar producto al carrito (con validación de stock)
// // router.post('/add', async (req, res) => {
// //   try {
// //     const { productId, quantity } = req.body;
// //     if (!productId || !quantity) {
// //       return res.status(400).json({ message: 'Faltan campos' });
// //     }

// //     // Obtener producto para validar stock
// //     const productRef = db.collection('products').doc(productId);
// //     const productDoc = await productRef.get();

// //     if (!productDoc.exists) {
// //       return res.status(404).json({ message: 'Producto no encontrado' });
// //     }

// //     const productData = productDoc.data();

// //     const cartRef = db.collection('carts').doc(CART_ID);
// //     const cartDoc = await cartRef.get();
// //     let cart = cartDoc.exists ? cartDoc.data() : { products: [] };

// //     // Verificar si ya está en el carrito
// //     const index = cart.products.findIndex(p => p.productId === productId);
// //     const currentQuantity = index >= 0 ? cart.products[index].quantity : 0;
// //     const newTotal = currentQuantity + quantity;

// //     if (newTotal > productData.stock) {
// //       return res.status(400).json({ message: `Stock insuficiente. Solo quedan ${productData.stock} unidades.` });
// //     }

// //     if (index >= 0) {
// //       cart.products[index].quantity = newTotal;
// //     } else {
// //       cart.products.push({ productId, quantity });
// //     }

// //     await cartRef.set(cart);
// //     res.json(cart);
// //   } catch (error) {
// //     console.error(error);
// //     res.status(500).json({ message: 'Error al agregar al carrito' });
// //   }
// // });

// // // Actualizar cantidad en carrito (con validación de stock)
// // router.patch('/update', async (req, res) => {
// //   try {
// //     const { productId, quantity } = req.body;
// //     if (!productId || quantity == null) {
// //       return res.status(400).json({ message: 'Faltan campos' });
// //     }

// //     // Obtener producto para validar stock
// //     const productRef = db.collection('products').doc(productId);
// //     const productDoc = await productRef.get();

// //     if (!productDoc.exists) {
// //       return res.status(404).json({ message: 'Producto no encontrado' });
// //     }

// //     const productData = productDoc.data();

// //     if (quantity > productData.stock) {
// //       return res.status(400).json({ message: `Stock insuficiente. Solo quedan ${productData.stock} unidades.` });
// //     }

// //     const cartRef = db.collection('carts').doc(CART_ID);
// //     const cartDoc = await cartRef.get();
// //     if (!cartDoc.exists) return res.status(404).json({ message: 'Carrito vacío' });

// //     let cart = cartDoc.data();
// //     const index = cart.products.findIndex(p => p.productId === productId);

// //     if (index < 0) {
// //       return res.status(404).json({ message: 'Producto no encontrado en carrito' });
// //     }

// //     if (quantity <= 0) {
// //       cart.products.splice(index, 1);
// //     } else {
// //       cart.products[index].quantity = quantity;
// //     }

// //     await cartRef.set(cart);
// //     res.json(cart);
// //   } catch (error) {
// //     console.error(error);
// //     res.status(500).json({ message: 'Error al actualizar carrito' });
// //   }
// // });

// // // Eliminar producto del carrito
// // router.delete('/remove/:productId', async (req, res) => {
// //   try {
// //     const { productId } = req.params;

// //     const cartRef = db.collection('carts').doc(CART_ID);
// //     const cartDoc = await cartRef.get();

// //     if (!cartDoc.exists) return res.status(404).json({ message: 'Carrito vacío' });

// //     let cart = cartDoc.data();
// //     cart.products = cart.products.filter(p => p.productId !== productId);

// //     await cartRef.set(cart);
// //     res.json(cart);
// //   } catch (error) {
// //     console.error(error);
// //     res.status(500).json({ message: 'Error al eliminar producto del carrito' });
// //   }
// // });

// module.exports = router;
