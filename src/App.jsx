import React, { useState } from 'react';
import MainMenu from './components/MainMenu';
import SurahDetail from './components/SurahDetail';

export default function App() {
  const [page, setPage] = useState({ type: 'menu', id: null, viewType: 'surah' });
  const [activeTab, setActiveTab] = useState('surah');

  const handleSelect = (selection) => {
    setPage({ 
      type: 'detail', 
      id: selection.id, 
      viewType: selection.type 
    });
  };

  // This function handles opening the "Exact Page" (Mushaf) view
  const openMushaf = () => {
    setPage({
      type: 'detail',
      id: 1, // Start at page 1
      viewType: 'mushaf'
    });
  };

  return (
    <div className="app-container">
      {page.type === 'menu' ? (
        <div className="container">
          {/* Header with Title and Book Icon */}
          <div className="header-main">
            <h1 className="main-title">Holy Qur'an</h1>
            <button 
              className="read-mode-btn" 
              onClick={openMushaf}
              title="Read Holy Quran (Page View)"
            >
              📖
            </button>
          </div>
          
          <div className="tab-container">
            <button 
              className={activeTab === 'surah' ? 'active' : ''} 
              onClick={() => setActiveTab('surah')}
            >
              Surah
            </button>
            <button 
              className={activeTab === 'juz' ? 'active' : ''} 
              onClick={() => setActiveTab('juz')}
            >
              Juz
            </button>
          </div>

          <MainMenu 
            activeTab={activeTab} 
            onSelectSurah={handleSelect} 
          />
        </div>
      ) : (
        <SurahDetail 
          pageData={{ type: page.viewType, id: page.id }} 
          onBack={() => setPage({ type: 'menu', id: null })} 
        />
      )}

      <style>{`
        .header-main {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          margin-bottom: 10px;
        }
        .main-title {
          color: var(--primary);
          font-size: 2.5rem;
          margin: 0;
          text-align: center;
        }
        .read-mode-btn {
          background: #1e293b;
          border: 1px solid var(--primary);
          color: white;
          font-size: 1.5rem;
          padding: 5px 10px;
          border-radius: 10px;
          cursor: pointer;
          transition: 0.2s ease;
          line-height: 1;
        }
        .read-mode-btn:hover {
          background: var(--primary);
          transform: translateY(-2px);
        }
        .tab-container {
          display: flex;
          justify-content: center;
          gap: 0;
          margin: 20px auto 30px;
          max-width: 400px;
          background: var(--card);
          border-radius: 12px;
          padding: 5px;
          border: 1px solid #334155;
        }
        .tab-container button {
          flex: 1;
          background: none;
          border: none;
          color: var(--text-muted);
          padding: 10px;
          border-radius: 8px;
          font-weight: 600;
          transition: 0.3s;
          cursor: pointer;
        }
        .tab-container button.active {
          background: var(--primary);
          color: white;
        }
      `}</style>
    </div>
  );
}