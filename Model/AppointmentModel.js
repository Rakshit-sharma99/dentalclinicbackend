const mongoose = require('mongoose');

const AppointmentSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  message: { type: String },
  status: { type: String, default: "pending", enum: ["pending", "accepted", "declined"] }
}, {
  timestamps: true  // Automatically adds createdAt and updatedAt
});

// Create model of schema
const Appointment = mongoose.model('Appointment', AppointmentSchema);
module.exports = Appointment;