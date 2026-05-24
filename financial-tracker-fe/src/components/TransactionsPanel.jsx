import { useCallback, useEffect, useMemo, useState } from 'react';
import * as categoriesApi from '../api/categories';
import * as transactionsApi from '../api/transactions';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    amount,
  );

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

export default function TransactionsPanel() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState('expense');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [transactionData, categoryData] = await Promise.all([
        transactionsApi.getTransactions(),
        categoriesApi.getCategories(),
      ]);
      setTransactions(transactionData);
      setCategories(categoryData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.type === type),
    [categories, type],
  );

  useEffect(() => {
    const stillValid = filteredCategories.some(
      (category) => String(category._id) === String(categoryId),
    );
    if (!stillValid) {
      setCategoryId(
        filteredCategories[0] ? String(filteredCategories[0]._id) : '',
      );
    }
  }, [filteredCategories, categoryId]);

  const categoryNameById = useMemo(
    () =>
      Object.fromEntries(
        categories.map((category) => [String(category._id), category.name]),
      ),
    [categories],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!categoryId) {
      setError('Add a category for this transaction type first.');
      return;
    }

    setError(null);
    try {
      await transactionsApi.createTransaction({
        amount: Number(amount),
        date,
        type,
        categoryId,
        description: description.trim(),
      });
      setAmount('');
      setDescription('');
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    setError(null);
    try {
      await transactionsApi.deleteTransaction(id);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="panel">
      <h2>Transactions</h2>

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>
            Type
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </label>
          <label>
            Category
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              disabled={filteredCategories.length === 0}
            >
              {filteredCategories.length === 0 ? (
                <option value="">No categories for this type</option>
              ) : (
                filteredCategories.map((category) => (
                  <option key={category._id} value={String(category._id)}>
                    {category.name}
                  </option>
                ))
              )}
            </select>
          </label>
        </div>
        <div className="form-row">
          <label>
            Amount
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </label>
          <label>
            Date
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </label>
        </div>
        <label>
          Description
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional note"
          />
        </label>
        <button type="submit" disabled={filteredCategories.length === 0}>
          Add transaction
        </button>
      </form>

      {error && <p className="error">{error}</p>}
      {loading && <p>Loading transactions…</p>}

      {!loading && transactions.length === 0 && (
        <p className="empty">No transactions yet.</p>
      )}

      {transactions.length > 0 && (
        <ul className="list">
          {transactions.map((transaction) => (
            <li key={transaction._id} className="list-item">
              <span>
                <strong>{formatCurrency(transaction.amount)}</strong>{' '}
                <span className={`badge badge-${transaction.type}`}>
                  {transaction.type}
                </span>
                <br />
                <span className="meta">
                  {formatDate(transaction.date)} ·{' '}
                  {categoryNameById[String(transaction.categoryId)] || 'Unknown'}{' '}
                  {transaction.description && `· ${transaction.description}`}
                </span>
              </span>
              <button
                type="button"
                className="danger-button"
                onClick={() => handleDelete(transaction._id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
