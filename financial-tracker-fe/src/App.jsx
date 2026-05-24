import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './components/AuthPage';
import CategoriesPanel from './components/CategoriesPanel';
import TransactionsPanel from './components/TransactionsPanel';
import SummaryPanel from './components/SummaryPanel';
import './App.css';

function AppContent() {
  const { user, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('summary');

  if (loading) {
    return (
      <main className="app">
        <p>Loading…</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="app">
        <header className="header">
          <h1>Financial Tracker</h1>
        </header>
        <AuthPage />
      </main>
    );
  }

  return (
    <main className="app">
      <header className="header">
        <div>
          <h1>Financial Tracker</h1>
          <p className="user-email">{user.email}</p>
        </div>
        <button type="button" className="secondary-button" onClick={logout}>
          Log out
        </button>
      </header>

      <nav className="tabs" aria-label="Main">
        <button
          type="button"
          className={activeTab === 'summary' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('summary')}
        >
          Summary
        </button>
        <button
          type="button"
          className={activeTab === 'categories' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('categories')}
        >
          Categories
        </button>
        <button
          type="button"
          className={activeTab === 'transactions' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('transactions')}
        >
          Transactions
        </button>
      </nav>

      {activeTab === 'summary' && <SummaryPanel />}
      {activeTab === 'categories' && <CategoriesPanel />}
      {activeTab === 'transactions' && <TransactionsPanel />}
    </main>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
