import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import RouteManager from './routeManager.js';
import editorRoutes from './routes/editorRoutes.js';
import exportRoutes from './routes/exportRoutes.js';

import { PORT } from '../config.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectManager = new RouteManager(); // Create an instance

// Middleware for static files
app.use(express.static(path.join(__dirname, '../'), { index: '/client/html/homePage.html' }));
app.use(express.json());

// Routes
app.use('/', editorRoutes(projectManager));
app.use('/', exportRoutes(projectManager));

// Handle images (static)
app.get('/images', (req, res) => {
  const imagesDir = path.join(__dirname, '../public/imgs');
  fs.readdir(imagesDir, (err, files) => {
    if (err) {
      return res.status(500).send('Unable to scan directory: ' + err);
    }
    res.json(files);
  });
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/html/about.html'));
});

app.listen(PORT, async() => {
  console.log(`Server running at ${PORT}/`);
  await projectManager.connectToDatabase();
});