const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

router.post('/', async (req, res) => {
  try {
    const { name, specialty, username, password, role } = req.body;

    console.log("📥 Datos recibidos:", req.body);

    const existing = await User.findOne({ username });
    if (existing) {
      console.log("⚠️ Usuario ya existe");
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      specialty,
      username,
      password: hashedPassword,
      role: role || 'doctor'
    });

    await newUser.save();
    console.log("✅ Usuario guardado en MongoDB");
    res.status(201).json({ message: "Usuario registrado correctamente." });

  } catch (error) {
    console.error("❌ Error al guardar:", error.message);
    res.status(500).json({ error: "Error al guardar el usuario" });
  }
});

// Obtener lista de doctores
router.get('/', async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }, 'name username specialty');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener doctores' });
  }
});

module.exports = router;