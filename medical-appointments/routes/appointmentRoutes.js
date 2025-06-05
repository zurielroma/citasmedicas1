const express = require('express');
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');
const router = express.Router();

// Obtener citas del día para el doctor autenticado
router.get('/doctor/appointments/week', auth, async (req, res) => {
  try {
    if (!req.user) {
      console.error('⚠️ req.user es undefined o nulo');
      return res.status(400).json({ error: 'Usuario no autenticado o token inválido' });
    }

    const doctorId = req.user._id;
    console.log("🔐 req.user =", req.user);
    console.log("📅 doctorId =", doctorId);

    if (!doctorId) {
      return res.status(400).json({ error: 'No se pudo identificar al doctor desde el token' });
    }

    // Rango de semana
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + diffToMonday);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      doctor: doctorId,
      date: { $gte: weekStart, $lte: weekEnd }
    }).populate('doctor', 'name specialty');

    console.log("📋 Citas encontradas:", appointments);

    res.json(appointments.map(a => ({
      _id: a._id,
      patientName: a.patientName || 'Paciente',
      date: a.date,
      time: a.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reason: a.reason
    })));
  } catch (error) {
    console.error("❌ Error al obtener citas:", error);
    res.status(500).json({ error: 'Error del servidor al obtener citas del doctor' });
  }
});

// Crear cita médica
router.post('/', auth, async (req, res) => {
  console.log('Datos recibidos para crear cita:', req.body);

  try {
    let { fecha, tiempo, patientName, doctor, reason } = req.body;

    if (!fecha || !tiempo || !patientName || !doctor) {
      return res.status(400).json({ error: 'Todos los campos requeridos deben estar completos.' });
    }

    // Normalizar fecha: si viene en formato DD/MM/YYYY cambiar a YYYY-MM-DD
    if (fecha.includes('/')) {
      const partes = fecha.split('/');
      if (partes.length === 3) {
        const [dd, mm, yyyy] = partes;
        fecha = `${yyyy}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}`;
      }
    }

    // Validar formato fecha YYYY-MM-DD con regex
    const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!fechaRegex.test(fecha)) {
      return res.status(400).json({ error: 'La fecha debe tener formato YYYY-MM-DD' });
    }

    // Validar formato tiempo HH:mm con regex 24h
    const tiempoRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!tiempoRegex.test(tiempo)) {
      return res.status(400).json({ error: 'La hora debe tener formato HH:mm en 24 horas' });
    }

    const combinedDateTime = new Date(`${fecha}T${tiempo}`);

    if (isNaN(combinedDateTime.getTime())) {
      return res.status(400).json({ error: 'La fecha y hora no tienen un formato válido.' });
    }

    const appointment = new Appointment({
      patientName,
      doctor,
      reason,
      date: combinedDateTime,
      user: req.user._id
    });

    await appointment.save();
    res.json({ message: 'Cita guardada', appointment });

  } catch (err) {
    console.error('❌ Error al guardar la cita:', err);
    res.status(500).json({ error: 'Error al guardar la cita' });
  }
});

// Obtener citas del usuario
router.get('/', auth, async (req, res) => {
  try {
    const query = Appointment.find({ user: req.user._id });
    if (req.query.populateDoctorName === 'true') {
      query.populate('doctor', 'name');
    }
    const appointments = await query.exec();
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
    const result = await Appointment.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: 'Cita no encontrada' });
    res.json({ message: 'Cita eliminada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar la cita' });
  }
});

module.exports = router;