const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

// Registro de usuario general (paciente o admin si se desea)
router.post('/register', async (req, res) => {
  try {
    const { name, specialty, username, password, role } = req.body;

    const userExists = await User.findOne({ username });
    if (userExists) return res.status(400).json({ error: 'Usuario ya existe' });

    // Cifrar la contraseña antes de guardar
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear nuevo usuario con los datos recibidos, asignando role por defecto 'paciente'
    const user = new User({
      name,
      specialty,
      username,
      password: hashedPassword,
      role: role || 'paciente'
    });

    await user.save();
    res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar el usuario' });
  }
});

// Inicio de sesión
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign(
      {
        _id: user._id,
        username: user.username,
        name: user.name,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // ✅ Devuelve también el rol
    res.json({ token, role: user.role });

  } catch (err) {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

module.exports = router;