"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a, _b;
// Initialise tooltips
$(function () {
    $('[data-toggle="tooltip"]').tooltip();
});
// Function to format numbers as currency (£#,###.00)
function formatCurrency(value) {
    if (value === "" || isNaN(Number(value)))
        return "";
    return '£' + parseFloat(value.toString()).toLocaleString('en-GB', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}
// Snap start-time and end-time
function roundTimeToNearestQuarterHour(time) {
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
    const startTimeInput = document.getElementById('start-time');
    if (startTimeInput) {
        // Snap to 15-minute intervals when the user changes the time
        startTimeInput.addEventListener('change', function () {
            startTimeInput.value = roundTimeToNearestQuarterHour(startTimeInput.value);
        });
    }
});
document.addEventListener('DOMContentLoaded', function () {
    const endTimeInput = document.getElementById('end-time');
    if (endTimeInput) {
        // Snap to 15-minute intervals when the user changes the time
        endTimeInput.addEventListener('change', function () {
            endTimeInput.value = roundTimeToNearestQuarterHour(endTimeInput.value);
        });
    }
});
// Currency formatting for other costs
document.addEventListener('DOMContentLoaded', function () {
    const otherCostsDisplayInput = document.getElementById('other_costs_display');
    const otherCostsHiddenInput = document.getElementById('other_costs');
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
    const startTimeInput = document.getElementById('start-time');
    const endTimeInput = document.getElementById('end-time');
    const startTimeHelp = document.getElementById('start-time-help');
    const endTimeHelp = document.getElementById('end-time-help');
    function validateTime() {
        const startTime = startTimeInput.value;
        const endTime = endTimeInput.value;
        if (!startTime) {
            startTimeHelp.textContent = "Enter a meeting start time";
        }
        else {
            startTimeHelp.textContent = ""; // Clear help text if valid
        }
        if (startTime && !endTime) {
            endTimeHelp.textContent = "Please enter a meeting end time";
        }
        else {
            endTimeHelp.textContent = ""; // Clear help text if valid
        }
    }
    startTimeInput === null || startTimeInput === void 0 ? void 0 : startTimeInput.addEventListener('input', validateTime);
    endTimeInput === null || endTimeInput === void 0 ? void 0 : endTimeInput.addEventListener('input', validateTime);
});
let staffCategories = [];
// Temporary data structure to hold staff state
let tempStaffState = [];
function captureCurrentStaffState() {
    tempStaffState = staffCategories.map((category) => {
        const staffInput = document.getElementById(`staff-${category.name}`);
        return {
            name: category.name,
            hourlyRate: category.hourlyRate,
            count: parseInt((staffInput === null || staffInput === void 0 ? void 0 : staffInput.value) || '0', 10), // Capture current count value
        };
    });
}
// Function to display the change staff form
function showChangeStaffForm() {
    var _a, _b;
    const staffInputsContainer = document.getElementById('staff-inputs');
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
    (_a = document.getElementById('confirm-change-staff')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', confirmStaffChanges);
    // Handle Cancel button click
    (_b = document.getElementById('cancel-change-staff')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', cancelStaffChanges);
}
// Function to confirm staff changes
function confirmStaffChanges() {
    tempStaffState.forEach((staff, index) => {
        const newName = document.getElementById(`edit-name-${index}`).value;
        const newRate = parseFloat(document.getElementById(`edit-rate-${index}`).value);
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
    const staffInputsContainer = document.getElementById('staff-inputs');
    staffInputsContainer.innerHTML = ''; // Clear previous inputs
    // Rebuild the staff input fields with the updated staffCategories
    staffCategories.forEach((category) => {
        appendStaffInput(category); // Append each staff input
    });
    calculateTotal();
}
// Function to append a new staff input (instead of clearing the whole container)
function appendStaffInput(category) {
    const staffInputsContainer = document.getElementById('staff-inputs');
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
    var _a, _b;
    const buttonContainer = document.querySelector('.d-flex.align-items-start');
    // Check if form already exists to prevent multiple form creations
    if (document.getElementById('add-staff-form'))
        return;
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
    (_a = document.getElementById('confirm-add-staff')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
        const staffName = document.getElementById('staff-name').value;
        const staffRate = parseFloat(document.getElementById('staff-rate').value);
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
    (_b = document.getElementById('cancel-add-staff')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => {
        // Simply remove the form
        form.remove();
    });
}
// Add event listeners for buttons
(_a = document.getElementById('add-staff')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', showAddStaffForm);
(_b = document.getElementById('change-staff')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', showChangeStaffForm);
// Fetch staff categories from the server and generate dynamic staff inputs
document.addEventListener('DOMContentLoaded', () => __awaiter(void 0, void 0, void 0, function* () {
    const staffInputsContainer = document.getElementById('staff-inputs');
    if (!staffInputsContainer)
        return;
    // Fetch staff categories from the server
    const response = yield fetch('/api/calculator/staff-categories');
    staffCategories = yield response.json();
    // Dynamically generate staff input fields
    staffCategories.forEach((category) => {
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
}));
// Helper function to calculate meeting duration in hours
function calculateDuration(startTime, endTime) {
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
    const startTimeInput = document.getElementById('start-time');
    const endTimeInput = document.getElementById('end-time');
    const repeatsInput = document.getElementById('repeats');
    const totalCostDisplay = document.getElementById('total-cost');
    const otherCostsInput = document.getElementById('other_costs');
    if (!startTimeInput || !endTimeInput || !repeatsInput || !otherCostsInput || !totalCostDisplay)
        return;
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
    staffCategories.forEach((category) => {
        const staffInput = document.getElementById(`staff-${category.name}`);
        const count = parseInt((staffInput === null || staffInput === void 0 ? void 0 : staffInput.value) || '0', 10);
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
