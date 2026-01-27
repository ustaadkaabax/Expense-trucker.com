import { useEffect, useMemo, useState } from "react";
import "./App.css";

const categories = {
  income: ["Salary", "Business", "Investment", "Gift", "Other"],
  expense: ["Food", "Transport", "Utilities", "Entertainment", "Health", "Other"],
};

export default function App() {
  const [transactions, setTransactions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("transactions")) || [];
    } catch {
      return [];
    }
  });

  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  // Form state
  const [type, setType] = useState("income");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(categories.income[0]);
  const [date, setDate] = useState("");

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    const first = categories[type][0];
    setCategory((prev) => (categories[type].includes(prev) ? prev : first));
  }, [type]);

  const filteredTransactions = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return transactions;
    return transactions.filter((t) =>
      (t.description || "").toLowerCase().includes(term)
    );
  }, [transactions, search]);

  const summary = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    return { income, expenses, balance: income - expenses };
  }, [transactions]);

  function resetForm() {
    setEditingId(null);
    setType("income");
    setDescription("");
    setAmount("");
    setCategory(categories.income[0]);
    setDate("");
  }

  function handleSubmit(e) {
    e.preventDefault();

    const tx = {
      id: editingId || Date.now().toString(),
      type,
      amount: parseFloat(amount),
      description: description.trim(),
      category,
      date,
    };

    if (!tx.description || !tx.date || Number.isNaN(tx.amount)) return;

    setTransactions((prev) => {
      if (editingId) {
        const idx = prev.findIndex((t) => t.id === editingId);
        if (idx === -1) return prev;
        const copy = [...prev];
        copy[idx] = tx;
        return copy;
      }
      return [...prev, tx];
    });

    resetForm();
  }

  function editTransaction(id) {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;

    setEditingId(id);
    setType(tx.type);
    setDescription(tx.description);
    setAmount(String(tx.amount));
    setCategory(tx.category);
    setDate(tx.date);
  }

  function deleteTransaction(id) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="app">
      <h1>Expense Tracker</h1>
      <h4>Abdulkadir Ahmed Kabah</h4>

      {/* Summary cards (single column) */}
      <div className="summery-cards">
        <div className="card-balance">
          <h3>Total Balance</h3>
          <p id="balance">${summary.balance.toFixed(2)}</p>
        </div>

        <div className="card-income">
          <h3>Total Income</h3>
          <p id="income">${summary.income.toFixed(2)}</p>
        </div>

        <div className="card-expenses">
          <h3>Total Expenses</h3>
          <p id="expenses">${summary.expenses.toFixed(2)}</p>
        </div>
      </div>

      {/* Form (full width, stacked) */}
      <div className="form-transaction">
        <h2>Add New Transaction</h2>

        <form className="form-transaction" id="transaction-form" onSubmit={handleSubmit}>
          <input type="hidden" id="transaction-id" value={editingId || ""} readOnly />

          <div className="form-group">
            <label htmlFor="transaction-type">type</label>
            <select
              id="transaction-type"
              required
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="transaction-description">Description</label>
            <input
              type="text"
              id="transaction-description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="amount">Amount</label>
              <input
                type="number"
                id="amount"
                min="0"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories[type].map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              id="cancel-btn"
              className="btn-secondary"
              onClick={(e) => {
                e.preventDefault();
                resetForm();
              }}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>

      {/* Transactions (full width, stacked) */}
      <div className="transactions">
        <h2>Transaction History</h2>

        <div className="form-group">
          <input
            type="text"
            id="search"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className="date">Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Type</th>
                <th>Amount</th>
                <th className="action">Actions</th>
              </tr>
            </thead>
            <tbody id="transaction-list">
              {filteredTransactions.map((t) => (
                <tr key={t.id}>
                  <td className="date">{t.date}</td>
                  <td>{t.description}</td>
                  <td>{t.category}</td>
                  <td>{t.type}</td>
                  <td className={t.type}>
                    {t.type === "income" ? "+" : "-"}${Number(t.amount).toFixed(2)}
                  </td>
                  <td>
                    <div className="actions">
                      <button
                        type="button"
                        className="btn-primary edit-btn"
                        onClick={() => editTransaction(t.id)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-secondary delete-btn"
                        onClick={() => deleteTransaction(t.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <p id="no-transactions">No transactions found.</p>
        )}
      </div>
    </div>
  );
}
