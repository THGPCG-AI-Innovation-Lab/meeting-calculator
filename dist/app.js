"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const calculator_1 = __importDefault(require("./routes/calculator"));
const app = (0, express_1.default)();
const port = parseInt('3000', 10);
// Middleware to serve static files from public folder
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.use(express_1.default.json()); // To parse JSON bodies
// Import routes
app.use('/api/calculator', calculator_1.default);
// Serve the main frontend page
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'public', 'index.html'));
});
// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
