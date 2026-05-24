import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import * as reportsApi from '../api/reports';
import { expenseChartColors, incomeChartColors } from '../theme';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    amount,
  );

const monthLabel = (year, month) =>
  new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

const INCOME_COLORS = incomeChartColors;
const EXPENSE_COLORS = expenseChartColors;

function CategoryBreakdown({ title, items, colorScheme }) {
  const colors = colorScheme === 'income' ? INCOME_COLORS : EXPENSE_COLORS;

  const chartData = useMemo(
    () =>
      items.map((item) => ({
        name: item.categoryName,
        value: item.total,
      })),
    [items],
  );

  if (items.length === 0) {
    return (
      <div className="breakdown-section">
        <h3>{title}</h3>
        <p className="empty">No {title.toLowerCase()} this month.</p>
      </div>
    );
  }

  return (
    <div className="breakdown-section">
      <h3>{title}</h3>
      <div className="pie-chart-wrap">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={95}
              paddingAngle={2}
              label={({ name, percent }) =>
                `${name} (${Math.round(percent * 100)}%)`
              }
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={colors[index % colors.length]}
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatCurrency(value)}
              contentStyle={{
                background: '#ffffff',
                border: '1px solid #d4edf0',
                borderRadius: '8px',
                color: '#1a3336',
              }}
            />
            <Legend
              formatter={(value) => (
                <span style={{ color: '#1a3336' }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function SummaryPanel() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportsApi.getMonthlyReport(year, month);
      setReport(data);
    } catch (err) {
      setError(err.message);
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const incomeCategories = useMemo(
    () => report?.byCategory.filter((row) => row.type === 'income') ?? [],
    [report],
  );

  const expenseCategories = useMemo(
    () => report?.byCategory.filter((row) => row.type === 'expense') ?? [],
    [report],
  );

  return (
    <section className="panel">
      <h2>Monthly summary</h2>

      <div className="form-row summary-controls">
        <label>
          Month
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, index) => index + 1).map((value) => (
              <option key={value} value={value}>
                {new Date(2000, value - 1, 1).toLocaleDateString('en-US', {
                  month: 'long',
                })}
              </option>
            ))}
          </select>
        </label>
        <label>
          Year
          <input
            type="number"
            min="2000"
            max="2100"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />
        </label>
      </div>

      <p className="summary-period">{monthLabel(year, month)}</p>

      {error && <p className="error">{error}</p>}
      {loading && <p>Loading summary…</p>}

      {!loading && report && (
        <>
          <div className="summary-cards">
            <article className="summary-card summary-card-income">
              <span className="summary-label">Income</span>
              <strong>{formatCurrency(report.totalIncome)}</strong>
            </article>
            <article className="summary-card summary-card-expense">
              <span className="summary-label">Expenses</span>
              <strong>{formatCurrency(report.totalExpense)}</strong>
            </article>
            <article
              className={`summary-card ${
                report.balance >= 0
                  ? 'summary-card-positive'
                  : 'summary-card-negative'
              }`}
            >
              <span className="summary-label">Balance</span>
              <strong>{formatCurrency(report.balance)}</strong>
            </article>
          </div>

          <div className="breakdown-grid">
            <CategoryBreakdown
              title="Income by category"
              items={incomeCategories}
              colorScheme="income"
            />
            <CategoryBreakdown
              title="Expenses by category"
              items={expenseCategories}
              colorScheme="expense"
            />
          </div>
        </>
      )}
    </section>
  );
}
