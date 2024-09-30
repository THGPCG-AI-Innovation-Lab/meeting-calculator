// Initialise tooltips
$(function () {
  $('[data-toggle="tooltip"]').tooltip();
});

// Function to format numbers as currency (£#,###.00)
function formatCurrency(value) {
  if (value === "" || isNaN(value)) return "";
  return '£' + parseFloat(value).toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Currency formatting for other costs
document.addEventListener('DOMContentLoaded', function () {
  const otherCostsDisplayInput = document.getElementById('other_costs_display');
  const otherCostsHiddenInput = document.getElementById('other_costs');

  // Event listener to format input when user leaves the field (on blur)
  otherCostsDisplayInput.addEventListener('blur', function () {
    const rawValue = parseFloat(otherCostsDisplayInput.value.replace(/[£,]/g, "")) || 0;
    const formattedValue = formatCurrency(rawValue);

    otherCostsDisplayInput.value = formattedValue; // Display formatted value in text input
    otherCostsHiddenInput.value = rawValue; // Store raw number in hidden input
    calculateTotal(); // Trigger recalculation when other costs change
  });

  // Remove formatting on focus to allow easy editing
  otherCostsDisplayInput.addEventListener('focus', function () {
    const rawValue = otherCostsHiddenInput.value;
    otherCostsDisplayInput.value = rawValue; // Show raw number for editing
  });
});

// Update time messages for start and end time
document.addEventListener('DOMContentLoaded', function () {
  const startTimeInput = document.getElementById('start-time');
  const endTimeInput = document.getElementById('end-time');
  const startTimeHelp = document.getElementById('start-time-help');
  const endTimeHelp = document.getElementById('end-time-help');

  // Function to validate time and show help text
  function validateTime() {
    const startTime = startTimeInput.value;
    const endTime = endTimeInput.value;

    // If no valid start time, show help text
    if (!startTime) {
      startTimeHelp.textContent = "Enter a meeting start time";
    } else {
      startTimeHelp.textContent = ""; // Clear help text if valid
    }

    // If start time is valid and no end time, show help text for end time
    if (startTime && !endTime) {
      endTimeHelp.textContent = "Please enter a meeting end time";
    } else {
      endTimeHelp.textContent = ""; // Clear help text if valid
    }
  }

  // Add event listeners to validate time when the input values change
  startTimeInput.addEventListener('input', validateTime);
  endTimeInput.addEventListener('input', validateTime);
});

// Fetch staff categories and generate dynamic staff inputs
document.addEventListener('DOMContentLoaded', async () => {
  const staffInputsContainer = document.getElementById('staff-inputs');

  // Fetch the staff categories from the backend
  const response = await fetch('/api/calculator/staff-categories');
  const staffCategories = await response.json();

  staffCategories.forEach(category => {
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
    input.setAttribute('value', 0);
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

// Calculate total costs
const calculateTotal = async () => {
  const startTime = document.getElementById('start-time').value;
  const endTime = document.getElementById('end-time').value;
  const repeats = document.getElementById('repeats').value;

  // Get the value of other costs from the hidden input (raw number)
  const otherCosts = parseFloat(document.getElementById('other_costs').value) || 0;
  const otherCostsTotal = repeats * otherCosts

  // Validate times before calculating
  if (!startTime || !endTime) {
    document.getElementById('total-cost').innerText = "";
    return;
  }

  const response = await fetch('/api/calculator/staff-categories');
  const staffCategories = await response.json();

  const staff = staffCategories.map(category => {
    const count = document.getElementById(`staff-${category.name}`).value;
    return { name: category.name, count: parseInt(count, 10) };
  });

  // Send other costs along with the other calculation data
  const resultResponse = await fetch('/api/calculator/calculate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ startTime, endTime, repeats, staff, otherCostsTotal }),
  });

  const result = await resultResponse.json();
  document.getElementById('total-cost').innerText = formatCurrency(result.totalCost.toFixed(2));
};

// Attach event listeners to all input fields
document.querySelectorAll('input').forEach(input => {
  input.addEventListener('change', calculateTotal);
});
