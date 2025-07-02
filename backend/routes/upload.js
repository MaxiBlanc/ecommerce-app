// backend/routes/upload.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const streamifier = require('streamifier');

// Configurá cloudinary con tus credenciales en .env y este archivo:
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer(); // multer sin almacenamiento en disco, para procesar en memoria

router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No se recibió imagen' });

  const streamUpload = (req) => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'productos' }, // opcional, para organizar en cloudinary
        (error, result) => {
          if (result) resolve(result);
          else reject(error);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
  };

  streamUpload(req)
    .then(result => {
      res.json({ url: result.secure_url });
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ message: 'Error al subir imagen a Cloudinary' });
    });
});

module.exports = router;
