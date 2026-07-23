document.addEventListener("DOMContentLoaded", () => {
  let currentInput = "0";
  let previousInput = "";
  let operator = null;
  let history = [];
  const MAX_LENGTH = 12;

  const calcExpression = document.getElementById("calc-expression");
  const calcResult = document.getElementById("calc-result");
  const calcKeypad = document.getElementById("calc-keypad");
  const historyList = document.getElementById("history-list");
  const clearHistoryBtn = document.getElementById("clear-history-btn");

  const updateDisplay = () => {
    if (calcResult) calcResult.textContent = currentInput;
    if (calcExpression) {
      calcExpression.textContent = operator ? `${previousInput} ${operator}` : "";
    }
  };

  const handleNumber = (numStr) => {
    if (currentInput.replace(".", "").length >= MAX_LENGTH) {
      alert(`최대 ${MAX_LENGTH}자리까지 입력할 수 있습니다.`);
      return;
    }
    if (numStr === "." && currentInput.includes(".")) return;

    currentInput = currentInput === "0" && numStr !== "." ? numStr : currentInput + numStr;
  };

  const handleOperator = (op) => {
    if (operator && previousInput !== "") calculate();
    operator = op;
    previousInput = currentInput;
    currentInput = "0";
  };

  const calculate = () => {
    if (!operator || previousInput === "") return;
    const prev = parseFloat(previousInput);
    const curr = parseFloat(currentInput);
    let res = 0;

    switch (operator) {
      case "+": res = prev + curr; break;
      case "-": res = prev - curr; break;
      case "*": res = prev * curr; break;
      case "/":
        if (curr === 0) {
          alert("0으로 나눌 수 없습니다.");
          currentInput = "0"; previousInput = ""; operator = null;
          updateDisplay();
          return;
        }
        res = prev / curr;
        break;
    }

    res = Math.round(res * 100000000) / 100000000;
    addHistory(`${previousInput} ${operator} ${currentInput} = ${res}`);

    currentInput = String(res);
    operator = null;
    previousInput = "";
  };

  const addHistory = (record) => {
    history.unshift(record);
    if (history.length > 5) history.pop();
    renderHistory();
  };

  const renderHistory = () => {
    if (!historyList) return;
    historyList.innerHTML = history.length === 0 
      ? `<li class="history-item">기록이 없습니다.</li>`
      : history.map((item) => `<li class="history-item">${item}</li>`).join("");
  };

  // 피드백 반영: 이벤트 위임 처리
  calcKeypad?.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const num = btn.getAttribute("data-num");
    const op = btn.getAttribute("data-op");
    const action = btn.getAttribute("data-action");

    if (num !== null) handleNumber(num);
    else if (op !== null) handleOperator(op);
    else if (action === "clear") { currentInput = "0"; previousInput = ""; operator = null; }
    else if (action === "clear-entry") { currentInput = "0"; }
    else if (action === "delete") { currentInput = currentInput.length === 1 ? "0" : currentInput.slice(0, -1); }
    else if (action === "calculate") calculate();

    updateDisplay();
  });

  clearHistoryBtn?.addEventListener("click", () => {
    history = [];
    renderHistory();
  });

  updateDisplay();
  renderHistory();
});