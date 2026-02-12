import React from 'react';
import surahList from '../data/surah-list.json';
import juzList from '../data/juz_index.json';

export default function MainMenu({ onSelectSurah, activeTab, bookmarks }) {
  // Determine which dataset to display
  let data = [];
  if (activeTab === 'surah') data = surahList;
  else if (activeTab === 'juz') data = juzList.juzs;
  else data = bookmarks;

  return (
    <div className="menu-grid">
      {data.length === 0 && activeTab === 'bookmarks' ? (
        <div className="empty-state">
          <p>No bookmarks saved yet.</p>
          <small>Click the bookmark icon while reading to save a page or surah.</small>
        </div>
      ) : (
        data.map((item, index) => {
          const isBookmark = activeTab === 'bookmarks';
          const itemId = isBookmark ? item.id : item.number;
          const itemType = isBookmark ? item.type : activeTab;

          return (
            <div 
              key={isBookmark ? `bm-${item.type}-${item.id}-${index}` : `${activeTab}-${item.number}`} 
              className="menu-item" 
              onClick={() => onSelectSurah({ type: itemType, id: itemId })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span className="item-number">
                  {isBookmark ? "🔖" : item.number}
                </span>
                <div>
                  <div className="item-title">
                    {isBookmark ? item.label : (activeTab === 'surah' ? item.transliteration : `Juz ${item.number}`)}
                  </div>
                  <div className="item-subtitle">
                    {activeTab === 'surah' ? `${item.versesCount} Ayahs` : 
                     activeTab === 'juz' ? `Page ${item.start_page}` : 
                     `Saved ${itemType.toUpperCase()}`}
                  </div>
                </div>
              </div>
              
              {!isBookmark && (
                <span className="arabic-font item-arabic">
                  {activeTab === 'surah' ? item.nameArabic : item.name}
                </span>
              )}
            </div>
          );
        })
      )}

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
        .item-number {
          color: var(--primary);
          font-weight: bold;
          font-size: 1.2rem;
          min-width: 30px;
        }
        .item-title {
          font-weight: 600;
          font-size: 1.1rem;
        }
        .item-subtitle {
          font-size: 12px;
          color: var(--text-muted);
        }
        .item-arabic {
          font-size: 2.2rem;
          color: var(--accent);
        }
        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 50px;
          background: var(--card);
          border-radius: 12px;
          border: 1px dashed #334155;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}