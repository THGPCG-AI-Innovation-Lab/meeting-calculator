const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // To parse JSON bodies

// Import routes
const calculatorRoutes = require('./routes/calculator');
app.use('/api/calculator', calculatorRoutes);

// Serve the main frontend page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
