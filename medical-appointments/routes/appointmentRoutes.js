const express = require('express');
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');
const router = express.Router();

// Crear cita médica
router.post('/', auth, async (req, res) => {
  try {
    const appointment = new Appointment({ ...req.body, user: req.user._id });
    await appointment.save();
    res.json({ message: 'Cita guardada', appointment });
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar la cita' });
  }
});

// Obtener citas del usuario
router.get('/', auth, async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user._id });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener citas' });
  }
});

// Editar cita médica
router.put('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!appointment) return res.status(404).json({ error: 'Cita no encontrada' });
    res.json({ message: 'Cita actualizada', appointment });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar la cita' });
  }
});

// Eliminar cita médica
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await Appointment.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!result) return res.status(404).json({ error: 'Cita no encontrada' });
    res.json({ message: 'Cita eliminada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar la cita' });
  }
});

module.exports = router;