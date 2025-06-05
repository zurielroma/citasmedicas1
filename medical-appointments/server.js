require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/authRoutes'); // Rutas de autenticación
const appointmentRoutes = require('./routes/appointmentRoutes'); // Rutas de citas
console.log('✅ appointmentRoutes cargado');
const doctorRoutes = require('./routes/doctor'); // Rutas de doctores

const app = express();

// Middleware para parsear JSON
app.use(bodyParser.json()); // También podrías usar app.use(express.json());

// Servir archivos estáticos desde "public"
app.use(express.static(path.join(__dirname, 'public')));

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/doctor', doctorRoutes); // Aquí se añadió la ruta para doctores

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
  process.exit(1);
});



const bcrypt = require('bcryptjs');

async function crearAdminInicial() {
  const existente = await User.findOne({ username: 'admin', role: 'admin' });
  if (!existente) {
    const hashedPassword = await bcrypt.hash('2004', 10);

    const admin = new User({
      name: 'admin',
      specialty: 'admin',
      username: 'admin',
      password: hashedPassword, // ✅ Encriptado correctamente
      role: 'admin'
    });

    await admin.save();
    console.log('✅ Usuario admin creado con éxito (usuario: admin, contraseña: 2004)');
  } else {
    console.log('ℹ️ El usuario admin ya existe');
  }
}

// Levantar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});