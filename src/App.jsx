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

  return (
    <div className="app-container">
      {page.type === 'menu' ? (
        <div className="container">
          <h1 style={{ textAlign: 'center', color: 'var(--primary)', fontSize: '2.5rem', marginBottom: '10px' }}>Holy Qur'an</h1>
          
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