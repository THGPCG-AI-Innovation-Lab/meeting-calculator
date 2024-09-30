const express = require('express');
const path = require('path');

const app = express();

const port = process.env.PORT || 3000;

// Static file serving
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(port, () => {
    console.log(`Running on http://localhost:${port}`);
});