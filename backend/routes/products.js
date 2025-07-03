const express = require('express');
const router = express.Router();
const { db } = require('../firebase');

// Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const productsSnapshot = await db.collection('products').get();
    const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
});

// Crear un producto nuevo
router.post('/', async (req, res) => {
  try {
    const { name, price, description, type, imageUrls, sizes } = req.body;

    if (!name || !price || !type) {
      return res.status(400).json({ message: 'Faltan campos obligatorios (name, price, type)' });
    }

    if (sizes && !Array.isArray(sizes)) {
      return res.status(400).json({ message: 'sizes debe ser un array de objetos { talla, stock }' });
    }

    const validSizes = (sizes || []).map(s => ({
      talla: String(s.talla),
      stock: Number(s.stock) || 0
    }));

    const newProduct = {
      name,
      price,
      type,
      description: description || '',
      imageUrls: Array.isArray(imageUrls) ? imageUrls : [],
      sizes: validSizes,
      createdAt: new Date()
    };

    const docRef = await db.collection('products').add(newProduct);
    res.status(201).json({ id: docRef.id, ...newProduct });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear producto' });
  }
});

// Eliminar un producto por ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('products').doc(id).delete();
    res.status(200).json({ message: 'Producto eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar producto' });
  }
});

// Actualizar producto
router.patch('/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, price, description, type, imageUrls, sizes } = req.body;

    const productRef = db.collection('products').doc(productId);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const updatedData = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ message: 'Nombre inválido' });
      }
      updatedData.name = name;
    }

    if (price !== undefined) {
      const parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({ message: 'Precio inválido' });
      }
      updatedData.price = parsedPrice;
    }

    if (type !== undefined) {
      if (typeof type !== 'string' || type.trim() === '') {
        return res.status(400).json({ message: 'Tipo inválido' });
      }
      updatedData.type = type;
    }

    if (description !== undefined) {
      if (typeof description !== 'string') {
        return res.status(400).json({ message: 'Descripción inválida' });
      }
      updatedData.description = description;
    }


    if (imageUrls !== undefined) {
      if (!Array.isArray(imageUrls)) {
        return res.status(400).json({ message: 'imageUrls debe ser un array' });
      }
      updatedData.imageUrls = imageUrls;
    }

    if (sizes !== undefined) {
      if (!Array.isArray(sizes)) {
        return res.status(400).json({ message: 'sizes debe ser un array' });
      }
      updatedData.sizes = sizes.map(s => ({
        talla: String(s.talla),
        stock: Number(s.stock)
      }));
    }

    await productRef.update(updatedData);
    const updatedProduct = await productRef.get();
    res.json({ id: updatedProduct.id, ...updatedProduct.data() });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar producto' });
  }
});

module.exports = router;
