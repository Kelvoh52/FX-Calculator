const display = document.getElementById('display');
const previous = document.getElementById('previous');
const buttons = document.querySelectorAll('.btn');

let currentInput = '0';
let storedValue = '';
let operator = null;
let justEvaluated = false;

function updateDisplay() {
  display.textContent = currentInput;
  previous.textContent = storedValue + (operator ? ` ${operator}` : '');
}

function clearAll() {
  currentInput = '0';
  storedValue = '';
  operator = null;
  justEvaluated = false;
  updateDisplay();
}

function deleteLast() {
  if (justEvaluated) {
    clearAll();
    return;
  }

  if (currentInput.length <= 1) {
    currentInput = '0';
  } else {
    currentInput = currentInput.slice(0, -1);
  }

  updateDisplay();
}

function appendNumber(value) {
  if (justEvaluated) {
    currentInput = '0';
    justEvaluated = false;
  }

  if (value === '.' && currentInput.includes('.')) {
    return;
  }

  if (currentInput === '0' && value !== '.') {
    currentInput = value;
  } else {
    currentInput += value;
  }

  updateDisplay();
}

function handleOperator(nextOperator) {
  if (currentInput === '0' && storedValue === '' && nextOperator === '-') {
    currentInput = '-';
    updateDisplay();
    return;
  }

  if (storedValue && operator && !justEvaluated) {
    performCalculation();
  }

  storedValue = currentInput;
  operator = nextOperator;
  currentInput = '0';
  justEvaluated = false;
  updateDisplay();
}

function handlePercent() {
  const numeric = Number(currentInput);
  if (!Number.isFinite(numeric)) {
    currentInput = '0';
    updateDisplay();
    return;
  }

  currentInput = String(numeric / 100);
  updateDisplay();
}

function calculateExpression(expression) {
  const sanitized = expression.replace(/÷/g, '/').replace(/×/g, '*');
  const safePattern = /^[0-9+\-*/.()%\s]+$/;

  if (!safePattern.test(sanitized)) {
    throw new Error('Invalid expression');
  }

  const result = Function(`"use strict"; return (${sanitized});`)();

  if (!Number.isFinite(result)) {
    throw new Error('Calculation error');
  }

  return Number(result.toFixed(10)).toString();
}

function performCalculation() {
  if (!storedValue || !operator) return;

  const expression = `${storedValue}${operator}${currentInput}`;

  try {
    const result = calculateExpression(expression);
    previous.textContent = `${expression} =`;
    currentInput = result;
    storedValue = '';
    operator = null;
    justEvaluated = true;
    updateDisplay();
  } catch (error) {
    currentInput = 'Error';
    storedValue = '';
    operator = null;
    justEvaluated = true;
    updateDisplay();
  }
}

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const { value, action } = button.dataset;

    if (action === 'clear') {
      clearAll();
      return;
    }

    if (action === 'delete') {
      deleteLast();
      return;
    }

    if (action === 'percent') {
      handlePercent();
      return;
    }

    if (action === 'equals') {
      if (storedValue && operator) {
        performCalculation();
      }
      return;
    }

    if (['+', '-', '*', '/'].includes(value)) {
      handleOperator(value);
      return;
    }

    if (value === '.') {
      appendNumber('.');
      return;
    }

    if (/\d/.test(value)) {
      appendNumber(value);
    }
  });
});

const exchangeRates = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  NGN: 1550,
  JPY: 156.4,
};

function formatCurrency(value, currency) {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  });

  return formatter.format(value);
}

function convertCurrency() {
  const amountInput = document.getElementById('currency-amount');
  const fromSelect = document.getElementById('currency-from');
  const toSelect = document.getElementById('currency-to');
  const resultBox = document.getElementById('currency-result');

  const amount = Number(amountInput.value || 0);
  const from = fromSelect.value;
  const to = toSelect.value;

  if (!Number.isFinite(amount)) {
    resultBox.textContent = 'Enter a valid amount';
    return;
  }

  const converted = (amount / exchangeRates[from]) * exchangeRates[to];
  resultBox.textContent = `${amount} ${from} = ${formatCurrency(converted, to)}`;
}

function calculateRisk() {
  const accountSize = Number(document.getElementById('account-size').value || 0);
  const riskPercent = Number(document.getElementById('risk-percent').value || 0);
  const stopLossPips = Number(document.getElementById('stop-loss-pips').value || 0);
  const pipValue = Number(document.getElementById('pip-value').value || 0);

  const riskAmount = (accountSize * riskPercent) / 100;
  const lotSize = stopLossPips > 0 && pipValue > 0 ? riskAmount / (stopLossPips * pipValue) : 0;

  document.getElementById('risk-amount').textContent = formatCurrency(riskAmount, 'USD');
  document.getElementById('lot-size').textContent = lotSize.toFixed(4);
}

document.getElementById('convert-btn').addEventListener('click', convertCurrency);
document.getElementById('risk-btn').addEventListener('click', calculateRisk);

convertCurrency();
calculateRisk();
updateDisplay();
