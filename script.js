const display = document.getElementById("display");
const keys = document.querySelector(".keys");

let current = "0";
let stored = null;
let operator = null;
let fresh = true;

function render() {
  display.textContent = current;
}

function inputDigit(digit) {
  if (fresh || current === "0") {
    current = digit;
    fresh = false;
    return;
  }
  if (current.replace("-", "").length >= 12) return;
  current += digit;
}

function inputDot() {
  if (fresh) {
    current = "0.";
    fresh = false;
    return;
  }
  if (!current.includes(".")) current += ".";
}

function setOperator(next) {
  if (operator && !fresh) compute();
  stored = Number(current);
  operator = next;
  fresh = true;
}

function compute() {
  if (operator === null || stored === null) return;
  const right = Number(current);
  let result;
  if (operator === "+") result = stored + right;
  else if (operator === "−") result = stored - right;
  else if (operator === "×") result = stored * right;
  else if (operator === "÷") result = right === 0 ? "Error" : stored / right;

  current = format(result);
  stored = null;
  operator = null;
  fresh = true;
}

function format(value) {
  if (value === "Error") return "Error";
  if (!Number.isFinite(value)) return "Error";
  const text = String(Math.round(value * 1e10) / 1e10);
  return text.length > 12 ? Number(value).toExponential(6) : text;
}

keys.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (current === "Error" && !button.dataset.action) {
    current = "0";
    fresh = true;
  }

  if (button.dataset.digit) inputDigit(button.dataset.digit);
  else if (button.dataset.op) setOperator(button.dataset.op);
  else if (button.dataset.action === "dot") inputDot();
  else if (button.dataset.action === "clear") {
    current = "0";
    stored = null;
    operator = null;
    fresh = true;
  } else if (button.dataset.action === "sign") {
    if (current !== "0" && current !== "Error") {
      current = current.startsWith("-") ? current.slice(1) : "-" + current;
    }
  } else if (button.dataset.action === "percent") {
    current = format(Number(current) / 100);
    fresh = true;
  } else if (button.dataset.action === "equals") {
    compute();
  }

  render();
});
