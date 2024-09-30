const express = require('express');
const router = express.Router();

// Staff categories - add/remove freely
let staffCategories = [
  { name: 'Administrator', hourlyRate: 16.45 },
  { name: 'Allied Health Professional', hourlyRate: 34.21 },
  { name: 'Assistant Director', hourlyRate: 51.32 },
  { name: 'Executive Director', hourlyRate: 78.95 },
  { name: 'Manager', hourlyRate: 27.63 },
  { name: 'Practice Nurse', hourlyRate: 107.9 },
  { name: 'Clinical Pharmacist', hourlyRate: 36.19 },
  { name: 'Practice Manager', hourlyRate: 36.19 },
  { name: 'Senior Manager', hourlyRate: 39.48 },
  { name: 'GP', hourlyRate: 170.79 }
];

// Sort staff categories by name
staffCategories.sort((a, b) => a.name.localeCompare(b.name));

// Return staff categories to client
router.get('/staff-categories', (req, res) => {
  res.json(staffCategories);
});

// Helper function to calculate the meeting cost
const calculateMeetingCost = (startTime, endTime, repeats, staff) => {
  const start = new Date(`2024-09-01T${startTime}:00Z`);
  const end = new Date(`2024-09-01T${endTime}:00Z`);

  let meetingDuration;

  // Check if the start time is after the end time (crossing day boundary)
  if (end < start) {
    // End time is on the next day, so add 24 hours (1 day) to end time
    meetingDuration = ((end - start) + 24 * 60 * 60 * 1000) / (1000 * 60 * 60); // in hours
  } else {
    // Regular calculation
    meetingDuration = (end - start) / (1000 * 60 * 60); // in hours
  }

  let totalCost = 0;

  staff.forEach(category => {
    const staffMember = staffCategories.find(c => c.name === category.name);
    if (staffMember) {
      totalCost += staffMember.hourlyRate * meetingDuration * category.count;
    }
  });

  return totalCost * repeats;
};

// Route to calculate meeting cost
router.post('/calculate', (req, res) => {
  const { startTime, endTime, repeats, staff, otherCosts } = req.body;

  if (!startTime || !endTime || !staff) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Calculate the total meeting cost based on startTime, endTime, repeats, and staff
  let totalCost = calculateMeetingCost(startTime, endTime, repeats, staff);

  // Add the other costs to the total cost
  const additionalCosts = parseFloat(otherCosts) || 0; // Ensure that otherCosts is a valid number or default to 0
  totalCost += additionalCosts;

  // Return the total cost
  res.json({ totalCost });
});

module.exports = router;
