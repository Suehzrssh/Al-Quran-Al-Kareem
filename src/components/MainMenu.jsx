import React from 'react';
import surahList from '../data/surah-list.json';
import juzList from '../data/juz_index.json';

export default function MainMenu({ onSelectSurah, activeTab }) {
  const data = activeTab === 'surah' ? surahList : juzList.juzs;

  return (
    <div className="menu-grid">
      {data.map(item => (
        <div 
          key={activeTab === 'surah' ? item.number : `juz-${item.number}`} 
          className="menu-item" 
          onClick={() => onSelectSurah({ type: activeTab, id: item.number })}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.2rem' }}>
              {item.number}
            </span>
            <div>
              <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                {activeTab === 'surah' ? item.transliteration : `Juz ${item.number}`}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {activeTab === 'surah' ? `${item.versesCount} Ayahs` : `Page ${item.start_page}`}
              </div>
            </div>
          </div>
          <span className="arabic-font" style={{ fontSize: '2.2rem', color: 'var(--accent)' }}>
            {activeTab === 'surah' ? item.nameArabic : item.name}
          </span>
        </div>
      ))}

      <style>{`
        .menu-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 15px;
        }
        .menu-item {
          background: var(--card);
          padding: 20px;
          border-radius: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1px solid #334155;
          cursor: pointer;
          transition: 0.2s ease;
        }
        .menu-item:hover {
          border-color: var(--primary);
          transform: translateY(-2px);
          background: #273549;
        }
      `}</style>
    </div>
  );
}