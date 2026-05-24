import { useCallback, useEffect, useState } from 'react';
import * as categoriesApi from '../api/categories';

export default function CategoriesPanel() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('expense');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadCategories = useCallback(async () => {
    setError(null);
    try {
      const data = await categoriesApi.getCategories();
      setCategories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      await categoriesApi.createCategory(name.trim(), type);
      setName('');
      await loadCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    setError(null);
    try {
      await categoriesApi.deleteCategory(id);
      await loadCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="panel">
      <h2>Categories</h2>
      <form className="form form-inline" onSubmit={handleSubmit}>
        <label>
          Name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Food, Rent, Salary…"
            required
          />
        </label>
        <label>
          Type
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>
        <button type="submit">Add category</button>
      </form>

      {error && <p className="error">{error}</p>}
      {loading && <p>Loading categories…</p>}

      {!loading && categories.length === 0 && (
        <p className="empty">No categories yet. Add one above.</p>
      )}

      {categories.length > 0 && (
        <ul className="list">
          {categories.map((category) => (
            <li key={category._id} className="list-item">
              <span>
                <strong>{category.name}</strong>{' '}
                <span className={`badge badge-${category.type}`}>
                  {category.type}
                </span>
              </span>
              <button
                type="button"
                className="danger-button"
                onClick={() => handleDelete(category._id)}
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
