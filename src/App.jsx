import React, { useState, useEffect } from 'react';
import MainMenu from './components/MainMenu';
import SurahDetail from './components/SurahDetail';

export default function App() {
  const [page, setPage] = useState({ type: 'menu', id: null, viewType: 'surah' });
  const [activeTab, setActiveTab] = useState('surah');
  
  // Load bookmarks from local storage on init
  const [bookmarks, setBookmarks] = useState(() => {
    const saved = localStorage.getItem('quran_bookmarks');
    return saved ? JSON.parse(saved) : [];
  });

  // Save bookmarks whenever they change
  useEffect(() => {
    localStorage.setItem('quran_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const handleSelect = (selection) => {
    setPage({ 
      type: 'detail', 
      id: selection.id, 
      viewType: selection.type 
    });
  };

  const toggleBookmark = (item) => {
    setBookmarks(prev => {
      const exists = prev.find(b => b.type === item.type && b.id === item.id);
      if (exists) {
        return prev.filter(b => !(b.type === item.type && b.id === item.id));
      }
      return [item, ...prev]; // Add new bookmarks to the top
    });
  };

  const openMushaf = () => {
    setPage({
      type: 'detail',
      id: 1,
      viewType: 'mushaf'
    });
  };

  return (
    <div className="app-container">
      {page.type === 'menu' ? (
        <div className="container">
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
            <button 
              className={activeTab === 'bookmarks' ? 'active' : ''} 
              onClick={() => setActiveTab('bookmarks')}
            >
              Bookmarks
            </button>
          </div>

          <MainMenu 
            activeTab={activeTab} 
            onSelectSurah={handleSelect} 
            bookmarks={bookmarks}
          />
        </div>
      ) : (
        <SurahDetail 
          pageData={{ type: page.viewType, id: page.id }} 
          onBack={() => setPage({ type: 'menu', id: null })} 
          bookmarks={bookmarks}
          onToggleBookmark={toggleBookmark}
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
          max-width: 500px;
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