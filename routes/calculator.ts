import express, { Request, Response } from 'express';
const router = express.Router();

// Define the structure of a staff category
interface StaffCategory {
  name: string;
  hourlyRate: number;
  count: number;
}

interface StaffInput {
  name: string;
  count: number;
}

// Define the structure of the request body for the /calculate endpoint
interface CalculateRequestBody {
  startTime: string;
  endTime: string;
  repeats: number;
  staff: StaffInput[];
  otherCosts?: string;
}

// Staff categories - add/remove freely
let staffCategories: StaffCategory[] = [
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
router.get('/staff-categories', (req: Request, res: Response) => {
  res.json(staffCategories);
});

export default router;
