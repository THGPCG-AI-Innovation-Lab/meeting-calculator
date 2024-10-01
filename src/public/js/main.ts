// Initialise tooltips
$(function () {
  $('[data-toggle="tooltip"]').tooltip();
});

// Function to format numbers as currency (£#,###.00)
function formatCurrency(value: number | string): string {
  if (value === "" || isNaN(Number(value))) return "";
  return '£' + parseFloat(value.toString()).toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Snap start-time and end-time
function roundTimeToNearestQuarterHour(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  const roundedMinutes = Math.round(totalMinutes / 15) * 15;
  const roundedHours = Math.floor(roundedMinutes / 60);
  const remainderMinutes = roundedMinutes % 60;

  const roundedHoursStr = String(roundedHours).padStart(2, '0');
  const remainderMinutesStr = String(remainderMinutes).padStart(2, '0');
  return `${roundedHoursStr}:${remainderMinutesStr}`;
}
document.addEventListener('DOMContentLoaded', function () {
  const startTimeInput = document.getElementById('start-time') as HTMLInputElement;

  if (startTimeInput) {

    // Snap to 15-minute intervals when the user changes the time
    startTimeInput.addEventListener('change', function () {
      startTimeInput.value = roundTimeToNearestQuarterHour(startTimeInput.value);
    });
  }
});
document.addEventListener('DOMContentLoaded', function () {
  const endTimeInput = document.getElementById('end-time') as HTMLInputElement;

  if (endTimeInput) {

    // Snap to 15-minute intervals when the user changes the time
    endTimeInput.addEventListener('change', function () {
      endTimeInput.value = roundTimeToNearestQuarterHour(endTimeInput.value);
    });
  }
});

// Currency formatting for other costs
document.addEventListener('DOMContentLoaded', function () {
  const otherCostsDisplayInput = document.getElementById('other_costs_display') as HTMLInputElement;
  const otherCostsHiddenInput = document.getElementById('other_costs') as HTMLInputElement;

  if (otherCostsDisplayInput && otherCostsHiddenInput) {
    // Event listener to format input when user leaves the field (on blur)
    otherCostsDisplayInput.addEventListener('blur', function () {
      const rawValue = parseFloat(otherCostsDisplayInput.value.replace(/[£,]/g, "")) || 0;
      const formattedValue = formatCurrency(rawValue);

      otherCostsDisplayInput.value = formattedValue; // Display formatted value in text input
      otherCostsHiddenInput.value = rawValue.toString(); // Store raw number in hidden input
      calculateTotal(); // Trigger recalculation when other costs change
    });

    // Remove formatting on focus to allow easy editing
    otherCostsDisplayInput.addEventListener('focus', function () {
      const rawValue = otherCostsHiddenInput.value;
      otherCostsDisplayInput.value = rawValue; // Show raw number for editing
    });
  }
});

// Update time messages for start and end time
document.addEventListener('DOMContentLoaded', function () {
  const startTimeInput = document.getElementById('start-time') as HTMLInputElement;
  const endTimeInput = document.getElementById('end-time') as HTMLInputElement;
  const startTimeHelp = document.getElementById('start-time-help') as HTMLElement;
  const endTimeHelp = document.getElementById('end-time-help') as HTMLElement;

  function validateTime() {
    const startTime = startTimeInput.value;
    const endTime = endTimeInput.value;

    if (!startTime) {
      startTimeHelp.textContent = "Enter a meeting start time";
    } else {
      startTimeHelp.textContent = ""; // Clear help text if valid
    }

    if (startTime && !endTime) {
      endTimeHelp.textContent = "Please enter a meeting end time";
    } else {
      endTimeHelp.textContent = ""; // Clear help text if valid
    }
  }
  startTimeInput?.addEventListener('input', validateTime);
  endTimeInput?.addEventListener('input', validateTime);
});

// Staff Categories
interface StaffCategory {
  name: string;
  hourlyRate: number;
  count: number;
}
let staffCategories: StaffCategory[] = [];

// Temporary data structure to hold staff state
let tempStaffState: { name: string; hourlyRate: number; count: number }[] = [];

function captureCurrentStaffState() {
  tempStaffState = staffCategories.map((category: StaffCategory) => {
    const staffInput = document.getElementById(`staff-${category.name}`) as HTMLInputElement;
    return {
      name: category.name,
      hourlyRate: category.hourlyRate,
      count: parseInt(staffInput?.value || '0', 10), // Capture current count value
    };
  });
}

// Function to display the change staff form
function showChangeStaffForm() {
  const staffInputsContainer = document.getElementById('staff-inputs') as HTMLElement;

  // Capture the current state of staff inputs
  captureCurrentStaffState();
  staffCategories = tempStaffState;

  // Clear the current staff list
  staffInputsContainer.innerHTML = '';

  // Create form for editing staff categories
  const form = document.createElement('div');
  form.classList.add('mt-3');
  form.setAttribute('id', 'change-staff-form');

  // Add header row for the form
  form.innerHTML = `
    <div class="form-row mb-2">
      <div class="col-md-6"><strong>Staff Category</strong></div>
      <div class="col-md-3"><strong>£/hour</strong></div>
    </div>
  `;

  // Generate form rows for each staff category
  tempStaffState.forEach((staff, index) => {
    const formRow = document.createElement('div');
    formRow.classList.add('form-row', 'mb-2');

    formRow.innerHTML = `
      <div class="col-md-6">
        <input type="text" id="edit-name-${index}" class="form-control" value="${staff.name}">
      </div>
      <div class="col-md-3">
        <input type="number" id="edit-rate-${index}" class="form-control" value="${staff.hourlyRate}">
      </div>
    `;

    form.appendChild(formRow);
  });

  // Add Confirm and Cancel buttons
  form.innerHTML += `
    <button type="button" id="confirm-change-staff" class="btn btn-success">Confirm</button>
    <button type="button" id="cancel-change-staff" class="btn btn-warning">Cancel</button>
  `;

  // Append the form to the container
  staffInputsContainer.appendChild(form);

  // Handle Confirm button click
  document.getElementById('confirm-change-staff')?.addEventListener('click', confirmStaffChanges);

  // Handle Cancel button click
  document.getElementById('cancel-change-staff')?.addEventListener('click', cancelStaffChanges);
}

// Function to confirm staff changes
function confirmStaffChanges() {
  tempStaffState.forEach((staff, index) => {
    const newName = (document.getElementById(`edit-name-${index}`) as HTMLInputElement).value;
    const newRate = parseFloat((document.getElementById(`edit-rate-${index}`) as HTMLInputElement).value);

    // Update staffCategories with new values
    staffCategories[index].name = newName;
    staffCategories[index].hourlyRate = newRate;
  });

  // Clear the form and regenerate the staff input fields
  regenerateStaffList();
}

// Function to cancel staff changes (restore original staff list)
function cancelStaffChanges() {
  // Simply regenerate the original staff input fields without changes
  regenerateStaffList();
}

// Function to regenerate the staff list
function regenerateStaffList() {
  const staffInputsContainer = document.getElementById('staff-inputs') as HTMLElement;
  staffInputsContainer.innerHTML = ''; // Clear previous inputs

  // Rebuild the staff input fields with the updated staffCategories
  staffCategories.forEach((category: StaffCategory) => {
    appendStaffInput(category); // Append each staff input
  });
  calculateTotal();
}

// Function to append a new staff input (instead of clearing the whole container)
function appendStaffInput(category: StaffCategory) {
  const staffInputsContainer = document.getElementById('staff-inputs') as HTMLElement;

  // Create a new row for the staff input
  const row = document.createElement('div');
  row.classList.add('form-row', 'mt-2', 'd-flex', 'align-items-center');

  const label = document.createElement('label');
  label.textContent = category.name.length > 20 ? category.name.slice(0, 20) + '…' : category.name;
  label.classList.add('col-md-6', 'col-form-label', 'text-right');

  const inputDiv = document.createElement('div');
  inputDiv.classList.add('col-md-6');

  const input = document.createElement('input');
  input.setAttribute('type', 'number');
  input.setAttribute('id', `staff-${category.name}`);
  input.setAttribute('name', `staff-${category.name}`);
  input.setAttribute('value', `${category.count}`);
  input.classList.add('form-control');
  input.style.maxWidth = '80px';

  // Attach event listener to recalculate total on change
  input.addEventListener('change', calculateTotal);

  inputDiv.appendChild(input);
  row.appendChild(label);
  row.appendChild(inputDiv);

  // Append the new row to the container
  staffInputsContainer.appendChild(row);
}

// Function to display the add staff form
function showAddStaffForm() {
  const buttonContainer = document.querySelector('.d-flex.align-items-start') as HTMLElement;

  // Check if form already exists to prevent multiple form creations
  if (document.getElementById('add-staff-form')) return;

  // Create form elements
  const form = document.createElement('div');
  form.classList.add('mt-3');
  form.setAttribute('id', 'add-staff-form');

  form.innerHTML = `
    <div class="form-row mb-2">
      <div class="col-md-6">
        <label for="staff-name">Category Name</label>
        <input type="text" id="staff-name" class="form-control" required>
      </div>
    </div>
    <div class="form-row mb-2">
      <div class="col-md-6">
        <label for="staff-rate">£/hour</label>
        <input type="number" id="staff-rate" class="form-control" required>
      </div>
    </div>
    <button type="button" id="confirm-add-staff" class="btn btn-success">Confirm</button>
    <button type="button" id="cancel-add-staff" class="btn btn-warning">Cancel</button>
  `;

  // Insert form after the buttons
  buttonContainer.insertAdjacentElement('afterend', form);

  // Handle form submission
  document.getElementById('confirm-add-staff')?.addEventListener('click', () => {
    const staffName = (document.getElementById('staff-name') as HTMLInputElement).value;
    const staffRate = parseFloat((document.getElementById('staff-rate') as HTMLInputElement).value);

    if (staffName && staffRate) {
      // Append new staff to staffCategories
      const newStaff = {
        name: staffName,
        hourlyRate: staffRate,
        count: 0,
      };
      staffCategories.push(newStaff);

      // Append the new staff input without clearing the existing inputs
      appendStaffInput(newStaff);

      // Clear and remove the form
      form.remove();
    }
  });
  // Handle cancel button
  document.getElementById('cancel-add-staff')?.addEventListener('click', () => {
    // Simply remove the form
    form.remove();
  });
}

// Add event listeners for buttons
document.getElementById('add-staff')?.addEventListener('click', showAddStaffForm);
document.getElementById('change-staff')?.addEventListener('click', showChangeStaffForm);

// Fetch staff categories from the server and generate dynamic staff inputs
document.addEventListener('DOMContentLoaded', async () => {
  const staffInputsContainer = document.getElementById('staff-inputs');

  if (!staffInputsContainer) return;

  // Fetch staff categories from the server
  const response = await fetch('/api/calculator/staff-categories');
  staffCategories = await response.json();

  // Dynamically generate staff input fields
  staffCategories.forEach((category: StaffCategory) => {
    const row = document.createElement('div');
    row.classList.add('form-row', 'mt-2', 'd-flex', 'align-items-center');

    // Truncate long names
    const label = document.createElement('label');
    label.textContent = category.name.length > 20 ? category.name.slice(0, 20) + '…' : category.name;
    label.classList.add('col-md-6', 'col-form-label', 'text-right');

    const inputDiv = document.createElement('div');
    inputDiv.classList.add('col-md-6');

    const input = document.createElement('input');
    input.setAttribute('type', 'number');
    input.setAttribute('id', `staff-${category.name}`);
    input.setAttribute('name', `staff-${category.name}`);
    input.setAttribute('value', '0');
    input.classList.add('form-control');
    input.style.maxWidth = '80px';

    // Attach event listener to each input to recalculate total on change
    input.addEventListener('change', calculateTotal);

    inputDiv.appendChild(input);
    row.appendChild(label);
    row.appendChild(inputDiv);
    staffInputsContainer.appendChild(row);
  });
});

// Helper function to calculate meeting duration in hours
function calculateDuration(startTime: string, endTime: string): number {
  const start = new Date(`2024-09-01T${startTime}:00Z`);
  const end = new Date(`2024-09-01T${endTime}:00Z`);

  let duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // Convert milliseconds to hours

  // If end time is earlier than start time, assume it crossed midnight
  if (duration < 0) {
    duration += 24;
  }

  return duration;
}

// Calculate total costs
const calculateTotal = () => {
  const startTimeInput = document.getElementById('start-time') as HTMLInputElement;
  const endTimeInput = document.getElementById('end-time') as HTMLInputElement;
  const repeatsInput = document.getElementById('repeats') as HTMLInputElement;
  const totalCostDisplay = document.getElementById('total-cost') as HTMLElement;
  const otherCostsInput = document.getElementById('other_costs') as HTMLInputElement;

  if (!startTimeInput || !endTimeInput || !repeatsInput || !otherCostsInput || !totalCostDisplay) return;

  const startTime = startTimeInput.value;
  const endTime = endTimeInput.value;
  const repeats = parseInt(repeatsInput.value, 10);
  const otherCosts = parseFloat(otherCostsInput.value) || 0;

  if (!startTime || !endTime) {
    totalCostDisplay.innerText = "";
    return;
  }

  const meetingDuration = calculateDuration(startTime, endTime);

  let totalCost = 0;

  // Get staff count for each category and calculate total cost
  staffCategories.forEach((category: StaffCategory) => {
    const staffInput = document.getElementById(`staff-${category.name}`) as HTMLInputElement;
    const count = parseInt(staffInput?.value || '0', 10);
    totalCost += category.hourlyRate * meetingDuration * count;
  });

  // Add other costs to total cost
  totalCost = (totalCost * repeats) + (repeats * otherCosts);

  totalCostDisplay.innerText = formatCurrency(totalCost.toFixed(2));
};


// Attach event listeners to all input fields
document.querySelectorAll('input').forEach(input => {
  input.addEventListener('change', calculateTotal);
});
