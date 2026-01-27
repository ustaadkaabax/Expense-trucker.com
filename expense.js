document.addEventListener("DOMContentLoaded", () => {
  // DOM elements
  const form = document.getElementById("transaction-form");
  const transactionList = document.getElementById("transaction-list");
  const noTransactionsMessage = document.getElementById("no-transactions");
  const cancelButton = document.getElementById("cancel-btn"); // ✅ FIX
  const searchInput = document.getElementById("search");

  // summary elements
  const totalBalance = document.getElementById("balance");
  const totalIncome = document.getElementById("income");
  const totalExpenses = document.getElementById("expenses");

  // form elements
  const typeSelect = document.getElementById("transaction-type");
  const amountInput = document.getElementById("amount");
  const descriptionInput = document.getElementById("transaction-description");
  const categoryInput = document.getElementById("category");
  const dateInput = document.getElementById("date");

  // category object
  const categories = {
    income: ["Salary", "Business", "Investment", "Gift", "Other"],
    expense: ["Food", "Transport", "Utilities", "Entertainment", "Health", "Other"],
  };

  // State
  let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  let editingId = null;

  init();

  function init() {
    renderCategories();
    renderTransactions();
    calculateSummary();

    typeSelect.addEventListener("change", renderCategories);

    searchInput.addEventListener("input", (e) =>
      renderTransactions(e.target.value)
    );

    form.addEventListener("submit", handleSubmit);

    // ✅ Cancel working
    cancelButton.addEventListener("click", (e) => {
      e.preventDefault();
      reset();
    });
  }

  function renderCategories() {
    const type = typeSelect.value;
    categoryInput.innerHTML = categories[type]
      .map((cat) => `<option value="${cat}">${cat}</option>`)
      .join("");
  }

  function handleSubmit(e) {
    e.preventDefault();

    const transaction = {
      id: editingId || Date.now().toString(),
      type: typeSelect.value,
      amount: parseFloat(amountInput.value),
      description: descriptionInput.value.trim(),
      category: categoryInput.value,
      date: dateInput.value,
    };

    if (editingId) {
      const index = transactions.findIndex((t) => t.id === editingId);
      if (index !== -1) transactions[index] = transaction;
    } else {
      transactions.push(transaction);
    }

    saveLocalStorage();
    renderTransactions(searchInput.value || "");
    form.reset();
    editingId = null;
    renderCategories(); // ✅ after reset, re-fill categories
    calculateSummary();
  }

  function saveLocalStorage() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }

  function renderTransactions(searchTerm = "") {
    const filteredTransactions = searchTerm
      ? transactions.filter((t) =>
          t.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : transactions;

    if (filteredTransactions.length === 0) {
      noTransactionsMessage.style.display = "block";
      transactionList.innerHTML = "";
      calculateSummary();
      return;
    }

    noTransactionsMessage.style.display = "none";

    transactionList.innerHTML = filteredTransactions
      .map(
        (transaction) => `
      <tr>
        <td class="date">${transaction.date}</td>
        <td>${transaction.description}</td>
        <td>${transaction.category}</td>
        <td>${transaction.type}</td>
        <td class="${transaction.type}">
          ${transaction.type === "income" ? "+" : "-"}$${Number(transaction.amount).toFixed(2)}
        </td>
        <td>
          <div class="actions">
            <button class="btn-primary edit-btn" data-id="${transaction.id}">
              Edit
            </button>
            <button class="btn-secondary delete-btn" data-id="${transaction.id}">
              Delete
            </button>
          </div>
        </td>
      </tr>
    `
      )
      .join("");

    // attach events
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", () => editTransaction(btn.dataset.id));
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => deleteTransaction(btn.dataset.id));
    });

    calculateSummary();
  }

  function editTransaction(id) {
    const transaction = transactions.find((t) => t.id === id);
    if (!transaction) return;

    editingId = id;
    typeSelect.value = transaction.type;
    renderCategories();
    descriptionInput.value = transaction.description;
    amountInput.value = transaction.amount;
    categoryInput.value = transaction.category;
    dateInput.value = transaction.date;
  }

  function deleteTransaction(id) {
    transactions = transactions.filter((t) => t.id !== id);
    saveLocalStorage();
    renderTransactions(searchInput.value || "");
    calculateSummary();
  }

  function reset() {
    form.reset();
    editingId = null;
    typeSelect.value = "income";
    renderCategories();
  }

  function calculateSummary() {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const balance = income - expenses;

    // ✅ Update UI (this was missing)
    totalIncome.textContent = `$${income.toFixed(2)}`;
    totalExpenses.textContent = `$${expenses.toFixed(2)}`;
    totalBalance.textContent = `$${balance.toFixed(2)}`;
  }
});

