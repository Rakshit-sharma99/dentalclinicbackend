const express = require('express');
const router = express.Router();
const Appointment = require('../Model/AppointmentModel');
const sendMail = require('../utils/sendMail');
const auth = require("../middleware/auth");
const { body, validationResult } = require('express-validator');

// ⭐ Admin Middleware
const admin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }
  next();
};

// ⭐ BOOK APPOINTMENT (User must be logged in)
router.post(
  '/appointment',
  [auth],
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("phone").isLength({ min: 10, max: 10 }).withMessage("Enter valid phone number"),
    body("email").isEmail().withMessage("Enter a valid email"),
    body("date").notEmpty().withMessage("Date is required"),
    body("time").notEmpty().withMessage("Time is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const appointment = new Appointment({
        userId: req.user.id, 
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        date: req.body.date,
        time: req.body.time,
        message: req.body.message
      });

      await appointment.save();
      res.status(201).json({ message: "Appointment Booked Successfully!" });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// ⭐ VIEW ALL APPOINTMENTS (Admin Only)
router.get("/view", auth, admin, async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.json(appointments);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching appointments" });
  }
});

// ⭐ ACCEPT APPOINTMENT (Admin Only)
router.put("/accept/:id", auth, admin, async (req, res) => {
  try {
    const id = req.params.id;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status: "accepted" },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    await sendMail(
      appointment.email,
      "Appointment Accepted",
      `Hello ${appointment.name}, your appointment on ${appointment.date} at ${appointment.time} has been accepted!`
    );

    res.json({ message: "Appointment Accepted!", appointment });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error accepting appointment" });
  }
});

// ⭐ DECLINE APPOINTMENT (Admin Only)
router.put("/decline/:id", auth, admin, async (req, res) => {
  try {
    const id = req.params.id;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status: "declined" },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    await sendMail(
      appointment.email,
      "Appointment Declined",
      `Hello ${appointment.name}, your appointment on ${appointment.date} at ${appointment.time} was declined.`
    );

    res.json({ message: "Appointment Declined!", appointment });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error declining appointment" });
  }
});

// ⭐ DELETE APPOINTMENT (Admin Only)
router.delete("/delete/:id", auth, admin, async (req, res) => {
  try {
    const id = req.params.id;

    const deleted = await Appointment.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while deleting appointment" });
  }
});

// ⭐ MY APPOINTMENTS (Logged-in user)
router.get("/myAppointments", auth, async (req, res) => {
  try {
    const apps = await Appointment.find({ userId: req.user.id });
    res.json(apps);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching appointments" });
  }
});

module.exports = router;
