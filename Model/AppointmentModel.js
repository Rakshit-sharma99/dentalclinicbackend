const mongoose=require('mongoose');
const AppointmentSchema = mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  message: { type: String },
  status: { type: String, default: "pending" }
});
//Create model of schema
const Appointment=mongoose.model('Appointment',AppointmentSchema);
module.exports=Appointment;