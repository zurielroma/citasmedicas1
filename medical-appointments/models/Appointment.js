const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientName: String,
  doctor: String,
  date: String,
  time: String,
  reason: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Appointment', appointmentSchema);