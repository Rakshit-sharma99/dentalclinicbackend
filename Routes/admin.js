const express = require('express');
const router = express.Router();
const Appointment = require("../Model/AppointmentModel");
router.get("/appointments" , async(req, res)=>{
    try{
        const allAppointments = await Appointment.find();
        res.json(allAppointments);
    }catch(error){
        res.status(500).json({message: "Server error"});
    }
});
module.exports = router;