import express, { Request, Response } from 'express';
import path from 'path';
import calculatorRoutes from './routes/calculator';
import { config } from 'dotenv';

config(); // Load environment variables

const app = express();
const port: number = parseInt(process.env.PORT || '3000', 10);

// Middleware to serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // To parse JSON bodies

// Import routes
app.use('/api/calculator', calculatorRoutes);

// Serve the main frontend page
app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
