// paulscleaningcrews/server.js
const express = require('express');
const multer = require("multer");
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv')

// Load environment variables from .env
dotenv.config();
const app = express();
const upload = multer({ dest: "uploads/" });
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // For parsing application/json request bodies
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the 'public' directory

app.post("/upload", upload.single("file"), (req, res) => {
    // You can save file info to MongoDB here
    console.log(req.file);
    res.json({ message: "File uploaded successfully!" });
});

// MongoDB Connection
// IMPORTANT: Replace 'mongodb://localhost:27017/pauls_cleaning_crews' with your actual MongoDB connection string if it's hosted elsewhere or requires authentication.
const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Mongoose Schemas
const appointmentSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  contactNumber: { type: String, required: true },
  service: { type: String, required: true },
  date: { type: String, required: true }, // Storing as string for simplicity with HTML date input
  time: { type: String, required: true }, // Storing as string for simplicity with HTML time input
  notes: { type: String }
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps

const complaintReportSchema = new mongoose.Schema({
  senderName: { type: String, required: true },
  senderEmail: { type: String },
  senderPhone: { type: String },
  message: { type: String, required: true },
  type: { type: String, enum: ['complaint', 'report'], required: true } // 'complaint' or 'report'
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);
const ComplaintReport = mongoose.model('ComplaintReport', complaintReportSchema);

// Admin Credentials (FOR DEMONSTRATION PURPOSES ONLY - In a real app, use hashed passwords and JWTs/sessions)
const ADMIN_USERNAME = 'AdminPauls';
const ADMIN_PASSWORD = 'Adminpaul7685';

// API Routes

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Middleware to simulate admin authentication (for this demo, it just passes through)
// In a real application, this would verify a session token or JWT.
const isAdminAuthenticated = (req, res, next) => {
    // For this demo, we rely on the client-side admin.js to only send requests
    // if the user has successfully "logged in". A real app needs server-side session/token validation.
    next();
};

// Create Appointment (Admin only)
app.post('/api/appointments', isAdminAuthenticated, async (req, res) => {
  try {
    const newAppointment = new Appointment(req.body);
    await newAppointment.save();
    res.status(201).json(newAppointment);
  } catch (error) {
    res.status(400).json({ message: 'Error creating appointment', error: error.message });
  }
});

// Get All Appointments (Public and Admin)
app.get('/api/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ date: 1, time: 1 }); // Sort by date and time
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments', error: error.message });
  }
});

// Delete Appointment (Admin only)
app.delete('/api/appointments/:id', isAdminAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Appointment.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting appointment', error: error.message });
  }
});

// Submit Complaint/Report (Public)
app.post('/api/complaints', async (req, res) => {
  try {
    const newComplaintReport = new ComplaintReport(req.body);
    await newComplaintReport.save();
    res.status(201).json(newComplaintReport);
  } catch (error) {
    res.status(400).json({ message: 'Error submitting complaint/report', error: error.message });
  }
});

// Get All Complaints/Reports (Admin only)
app.get('/api/complaints', isAdminAuthenticated, async (req, res) => {
  try {
    const complaints = await ComplaintReport.find().sort({ createdAt: -1 }); // Sort by newest first
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching complaints/reports', error: error.message });
  }
});

// NEW: Delete Complaint/Report (Admin only)
app.delete('/api/complaints/:id', isAdminAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await ComplaintReport.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ message: 'Report/Complaint not found' });
    }
    res.json({ message: 'Report/Complaint deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting report/complaint', error: error.message });
  }
});

// Serve admin.html for the /admin route
app.get('/*admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});