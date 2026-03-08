const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Import routers
const tutorialModulesRoute = require('./routes/tutorialModules.js');

// Auth Route Endpoint
app.post('/api/auth/google', (req, res) => {
  // TODO: Verify Google token and create session
  res.json({ message: "Google auth endpoint hit" });
});

// Home Page Data Endpoint
app.get('/api/home', (req, res) => {
  res.json({ message: "Welcome to the home dashboard data!" });
});

// Feature Routes
app.use('/api/tutorial-modules', tutorialModulesRoute);

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
