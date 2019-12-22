require('dotenv').config();

const express = require('express');
const next = require('next');
const cors = require('cors');
const gitApi = require('@tinacms/api-git');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const cloudinary = require('cloudinary');
const formData = require('express-form-data');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.prepare().then(() => {
  const server = express();

  server.use(cors());
  server.use(formData.parse());
  server.use(
    '/___tina',
    gitApi.router({
      pushOnCommit: false,
    }),
  );

  server.get('/ping', (req, res) => res.json({ ping: 'pong' }));
  server.post('/image-upload', (req, res) => {
    const values = Object.values(req.files);
    const promises = values.map((image) => cloudinary.uploader
      .upload(image.path, { quality: 50 }));

    Promise
      .all(promises)
      .then((results) => res.json(results));
  });


  server.all('*', (req, res) => handle(req, res));

  server.listen(port, (err) => {
    if (err) throw err;
    // eslint-disable-next-line no-console
    console.log(`> Ready on http://localhost:${port}`);
  });

  server.use('/tmp', express.static('tmp'));
});
