require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/authRoutes'); // autenticación
const appointmentRoutes = require('./routes/appointmentRoutes'); // rutas de citas (corregido)

const app = express();

// Middleware para parsear JSON
app.use(bodyParser.json()); // También podrías usar app.use(express.json());

// Servir archivos estáticos desde "public"
app.use(express.static(path.join(__dirname, 'public')));

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);

// Ruta raíz - redirige a index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Middleware para manejar rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(err => {
  console.error('❌ Error de conexión a MongoDB:', err.message);
  process.exit(1); // Finaliza si no se puede conectar
});

// Levantar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});