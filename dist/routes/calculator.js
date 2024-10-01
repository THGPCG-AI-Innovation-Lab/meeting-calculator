"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// Staff categories - add/remove freely
let staffCategories = [
    { name: 'Administrator', hourlyRate: 16.45, count: 0 },
    { name: 'Allied Health Professional', hourlyRate: 34.21, count: 0 },
    { name: 'Assistant Director', hourlyRate: 51.32, count: 0 },
    { name: 'Executive Director', hourlyRate: 78.95, count: 0 },
    { name: 'Manager', hourlyRate: 27.63, count: 0 },
    { name: 'Practice Nurse', hourlyRate: 107.9, count: 0 },
    { name: 'Clinical Pharmacist', hourlyRate: 36.19, count: 0 },
    { name: 'Practice Manager', hourlyRate: 36.19, count: 0 },
    { name: 'Senior Manager', hourlyRate: 39.48, count: 0 },
    { name: 'GP', hourlyRate: 170.79, count: 0 }
];
// Sort staff categories by name
staffCategories.sort((a, b) => a.name.localeCompare(b.name));
// Return staff categories to client
router.get('/staff-categories', (req, res) => {
    res.json(staffCategories);
});
exports.default = router;
