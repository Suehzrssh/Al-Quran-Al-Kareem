import React, { useState, useEffect, useRef } from 'react';
import surahList from '../data/surah-list.json';
import juzList from '../data/juz_index.json';

const toArabicDigits = (num) => {
  const id = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().replace(/\d/g, (d) => id[d]);
};

export default function SurahDetail({ pageData, onBack, bookmarks, onToggleBookmark }) {
  const [currentId, setCurrentId] = useState(pageData.id);
  const [currentType, setCurrentType] = useState(pageData.type); 
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('both');
  const [activeFootnote, setActiveFootnote] = useState(null); 
  const [currentAyaKey, setCurrentAyaKey] = useState(null); 
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBesmelePlaying, setIsBesmelePlaying] = useState(false);
  
  const audioRef = useRef(null);
  const preloaderRef = useRef(new Audio()); 
  const verseRefs = useRef({});

  // Bookmark Logic
  const isBookmarked = bookmarks.some(b => b.type === currentType && b.id === currentId);

  const handleBookmarkToggle = () => {
    let label = "";
    if (currentType === 'mushaf') {
      // Find the juz for the first verse on this page
      const firstVerseJuz = content[0]?.verses[0]?.juz || "";
      label = `Page ${currentId}, Juz ${firstVerseJuz}`;
    } else if (currentType === 'surah') {
      label = content[0]?.info.transliteration;
    } else {
      label = `Juz ${currentId}`;
    }

    onToggleBookmark({
      type: currentType,
      id: currentId,
      label: label
    });
  };

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      try {
        if (currentType === 'surah') {
          const data = await import(`../data/surahs/${currentId}.json`);
          const verses = data.default.verses;
          setContent([{ info: surahList.find(s => s.number === currentId), verses }]);
          verses.forEach(v => { const a = new Audio(); a.src = v.audio; a.preload = "auto"; });
        } else if (currentType === 'mushaf') {
          let pageResults = [];
          for (let s = 1; s <= 114; s++) {
            try {
              const res = await import(`../data/surahs/${s}.json`);
              const versesOnPage = res.default.verses.filter(v => v.page === currentId);
              if (versesOnPage.length > 0) {
                pageResults.push({ info: surahList.find(item => item.number === s), verses: versesOnPage });
                versesOnPage.forEach(v => { const a = new Audio(); a.src = v.audio; a.preload = "auto"; });
              }
            } catch (e) { console.error(e); }
          }
          setContent(pageResults);
        } else {
          const currentJuz = juzList.juzs.find(j => j.number === currentId);
          const nextJuz = juzList.juzs.find(j => j.number === currentId + 1);
          const startPage = currentJuz.start_page;
          const endPage = nextJuz ? nextJuz.start_page - 1 : 604;
          let juzResults = [];
          for (let s = 1; s <= 114; s++) {
            try {
              const res = await import(`../data/surahs/${s}.json`);
              const validVerses = res.default.verses.filter(v => v.page >= startPage && v.page <= endPage);
              if (validVerses.length > 0) {
                juzResults.push({ info: surahList.find(item => item.number === s), verses: validVerses });
              }
            } catch (e) { console.error(e); }
          }
          setContent(juzResults);
        }
      } catch (e) { console.error(e); }
      setLoading(false);
      window.scrollTo(0,0);
    };
    loadContent();
  }, [currentType, currentId]);

  useEffect(() => {
    if (isPlaying && !currentAyaKey && !loading && content.length > 0) {
      const firstSurah = content[0];
      const firstVerse = firstSurah.verses[0];
      setTimeout(() => {
        setCurrentAyaKey(`${firstSurah.info.number}-${firstVerse.numberInSurah}`);
      }, 150);
    }
  }, [loading, content, isPlaying, currentAyaKey]);

  useEffect(() => {
    if (isPlaying && currentAyaKey) {
      const [sNum, vNum] = currentAyaKey.split('-').map(Number);
      if (vNum === 1 && sNum !== 1 && sNum !== 9 && !isBesmelePlaying) {
        playBesmele(sNum, vNum);
      } else {
        playActualVerse(sNum, vNum);
      }
    } else if (!isPlaying) {
      audioRef.current?.pause();
    }
  }, [currentAyaKey, isPlaying]);

  const preloadNextVerse = (sNum, vNum) => {
    const sIdx = content.findIndex(s => s.info.number === sNum);
    if (sIdx === -1) return;
    const vIdx = content[sIdx].verses.findIndex(v => v.numberInSurah === vNum);
    let nextVerse = null;
    if (vIdx < content[sIdx].verses.length - 1) {
      nextVerse = content[sIdx].verses[vIdx + 1];
    } else if (sIdx < content.length - 1) {
      nextVerse = content[sIdx + 1].verses[0];
    }
    if (nextVerse) { preloaderRef.current.src = nextVerse.audio; preloaderRef.current.load(); }
  };

  const playBesmele = (sNum, vNum) => {
    setIsBesmelePlaying(true);
    audioRef.current.src = "https://cdn.islamic.network/quran/audio/64/ar.saoodshuraym/1.mp3";
    audioRef.current.play().catch(e => console.log(e));
    audioRef.current.onended = () => { setIsBesmelePlaying(false); playActualVerse(sNum, vNum); };
  };

  const playActualVerse = (sNum, vNum) => {
    const currentSurah = content.find(s => s.info.number === sNum);
    const verse = currentSurah?.verses.find(v => v.numberInSurah === vNum);
    if (verse && audioRef.current) {
      audioRef.current.src = verse.audio;
      audioRef.current.play().catch(e => console.log(e));
      preloadNextVerse(sNum, vNum);
      if (verseRefs.current[currentAyaKey]) {
        verseRefs.current[currentAyaKey].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      audioRef.current.onended = () => {
        const sIdx = content.findIndex(s => s.info.number === sNum);
        const vIdx = content[sIdx].verses.findIndex(v => v.numberInSurah === vNum);
        
        if (vIdx < content[sIdx].verses.length - 1) {
          setCurrentAyaKey(`${sNum}-${content[sIdx].verses[vIdx+1].numberInSurah}`);
        } else if (sIdx < content.length - 1) {
          setCurrentAyaKey(`${content[sIdx+1].info.number}-${content[sIdx+1].verses[0].numberInSurah}`);
        } else {
          if (currentType === 'mushaf' && currentId < 604) {
            setCurrentAyaKey(null);
            setCurrentId(prev => prev + 1);
          } else {
            setIsPlaying(false);
          }
        }
      };
    }
  };

  const renderTranslation = (verse, surahNum) => {
    if (!verse.translation) return null;
    const parts = verse.translation.split(/(\[\d+\])/g);
    const openNoteForThisVerse = activeFootnote?.startsWith(`${surahNum}-${verse.numberInSurah}-`) 
      ? activeFootnote.split('-').pop() 
      : null;
    return (
      <div className="translation-wrapper">
        <div className="translation-text">
          <span className="aya-label-num">{verse.numberInSurah}.</span>
          {parts.map((part, index) => {
            const match = part.match(/\[(\d+)\]/);
            if (match) {
              const fid = parseInt(match[1]);
              const uniqueKey = `${surahNum}-${verse.numberInSurah}-${fid}`;
              return (
                <sup 
                  key={index} 
                  className={`footnote-marker ${activeFootnote === uniqueKey ? 'active' : ''}`} 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setActiveFootnote(activeFootnote === uniqueKey ? null : uniqueKey); 
                  }}
                >
                  {fid}
                </sup>
              );
            }
            return part;
          })}
        </div>
        {verse.footnotes?.map(note => (
          <div 
            key={note.id} 
            className={`footnote-accordion ${openNoteForThisVerse === String(note.id) ? 'open' : ''}`}
          >
            <div className="footnote-inner">
              <strong>Note {note.id}:</strong> {note.note}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading && !isPlaying) return <div className="loading">...</div>;

  return (
    <div className="container" style={{ paddingBottom: currentType === 'mushaf' ? '100px' : '20px' }}>
      <header className="detail-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <div className="header-center">
          <h2 className="surah-name-title">
            {currentType === 'mushaf' ? `Page ${currentId}` : currentType === 'juz' ? `${currentId}. Juz` : content[0]?.info.transliteration}
          </h2>
          <div className="mode-toggle">
            <button className={viewMode === 'arabic' && currentType !== 'mushaf' ? 'on' : ''} onClick={() => setViewMode('arabic')}>AR</button>
            <button className={viewMode === 'both' && currentType !== 'mushaf' ? 'on' : ''} onClick={() => setViewMode('both')}>BOTH</button>
            <button className={viewMode === 'translation' && currentType !== 'mushaf' ? 'on' : ''} onClick={() => setViewMode('translation')}>EN</button>
            <button className={currentType === 'mushaf' ? 'on' : ''} onClick={() => { 
              setCurrentType('mushaf');
              if (content.length > 0) setCurrentId(content[0].verses[0].page);
            }}>📖 READ</button>
          </div>
        </div>
        <div className="player-controls" style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleBookmarkToggle} className={`play-btn ${isBookmarked ? 'is-playing' : ''}`}>
             <svg width="20" height="20" viewBox="0 0 24 24" fill={isBookmarked ? "white" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>
          <button onClick={() => {
            if (!currentAyaKey && content.length > 0) setCurrentAyaKey(`${content[0].info.number}-${content[0].verses[0].numberInSurah}`);
            setIsPlaying(!isPlaying);
          }} className={`play-btn ${isPlaying ? 'is-playing' : ''}`}>
            {isPlaying ? '⏸' : '▶'}
          </button>
        </div>
      </header>

      <audio ref={audioRef} preload="auto" />
      
      <div className={`verses-list ${currentType === 'mushaf' ? 'mushaf-layout' : ''}`}>
        {content.map((section) => (
          <div key={section.info.number} className="surah-section">
            <div className="surah-intro-area">
              <div className="surah-header-combined">
                <span className="surah-name-side surah-trans">{section.info.transliteration}</span>
                <div className="basmala-wrap">
                  {section.verses[0].numberInSurah === 1 && section.info.number !== 9 ? (
                    <span className={`basmala-text arabic-font ${isBesmelePlaying && currentAyaKey?.startsWith(section.info.number + '-') ? 'besmele-active' : ''}`}>
                      بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                    </span>
                  ) : <div className="divider-spacer-line"></div>}
                </div>
                <span className="surah-name-side surah-arabic arabic-font">{section.info.nameArabic}</span>
              </div>
            </div>
            <div className={currentType === 'mushaf' ? 'mushaf-text-flow' : ''}>
              {section.verses.map((v) => {
                const aKey = `${section.info.number}-${v.numberInSurah}`;
                if (currentType === 'mushaf') {
                  return (
                    <span key={aKey} ref={el => verseRefs.current[aKey] = el}
                      className={`mushaf-verse arabic-font ${currentAyaKey === aKey && !isBesmelePlaying ? 'mushaf-playing' : ''}`}
                      onClick={() => { setIsBesmelePlaying(false); setCurrentAyaKey(aKey); setIsPlaying(true); }}>
                      {v.text} <span className="mushaf-aya-num">﴿{toArabicDigits(v.numberInSurah)}﴾</span>
                    </span>
                  );
                }
                return (
                  <div key={aKey} ref={el => verseRefs.current[aKey] = el}
                    className={`verse-card ${currentAyaKey === aKey && !isBesmelePlaying ? 'playing' : ''}`}
                    onClick={() => { setIsBesmelePlaying(false); setCurrentAyaKey(aKey); setIsPlaying(true); }}>
                    {(viewMode === 'arabic' || viewMode === 'both') && (
                      <p className="arabic-text arabic-font" dir="rtl">
                        {v.text} <span className="aya-num">﴿{toArabicDigits(v.numberInSurah)}﴾</span>
                      </p>
                    )}
                    {(viewMode === 'translation' || viewMode === 'both') && (
                      <div className="translation">
                        {renderTranslation(v, section.info.number)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      {currentType === 'mushaf' && (
        <div className="mushaf-nav-footer">
          <button disabled={currentId >= 604} onClick={() => { if (isPlaying) setCurrentAyaKey(null); setCurrentId(prev => prev + 1); }} className="nav-page-btn">← Prev</button>
          <div className="page-indicator"><span className="page-num">{currentId}</span></div>
          <button disabled={currentId <= 1} onClick={() => { if (isPlaying) setCurrentAyaKey(null); setCurrentId(prev => prev - 1); }} className="nav-page-btn">Next →</button>
        </div>
      )}

      <style>{`
        .footnote-marker { color: var(--primary); cursor: pointer; padding: 0 3px; font-weight: bold; transition: color 0.2s; }
        .footnote-marker.active { color: var(--accent); text-decoration: underline; }
        .footnote-accordion { max-height: 0; overflow: hidden; transition: max-height 0.3s ease-out, margin-top 0.3s; background: rgba(0,0,0,0.2); border-radius: 8px; margin-top: 0; }
        .footnote-accordion.open { max-height: 500px; margin-top: 15px; border: 1px dashed var(--primary); }
        .footnote-inner { padding: 12px; font-size: 0.9rem; color: var(--text-muted); }
        .detail-header { position: sticky; top: 0; background: var(--bg); z-index: 100; display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid #334155; margin-bottom: 20px; }
        .header-center { text-align: center; flex: 1; }
        .surah-name-title { margin: 0; color: var(--accent); font-size: 1.2rem; font-weight: 700; }
        .back-btn, .play-btn { background: #1e293b; border: 1px solid var(--primary); color: var(--primary); width: 40px; height: 40px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; transition: all 0.2s ease; }
        .play-btn.is-playing { background: var(--primary); color: white; }
        .mode-toggle { background: var(--card); padding: 3px; border-radius: 8px; display: inline-flex; gap: 2px; margin-top: 5px; border: 1px solid #334155; }
        .mode-toggle button { background: none; border: none; color: var(--text-muted); padding: 4px 10px; font-size: 0.7rem; border-radius: 6px; cursor: pointer; }
        .mode-toggle button.on { background: var(--primary); color: white; }
        .surah-header-combined { display: flex; align-items: flex-end; justify-content: space-between; color: var(--accent); border-bottom: 1px solid #334155; padding-bottom: 25px; }
        .basmala-text { font-size: 2.8rem; line-height: 1; }
        .besmele-active { color: var(--primary); filter: drop-shadow(0 0 8px var(--primary)); }
        .verse-card { background: var(--card); padding: 25px; border-radius: 12px; margin-bottom: 15px; border: 1px solid #334155; cursor: pointer; transition: all 0.3s; }
        .verse-card.playing { border-color: var(--primary); background: #243147; }
        .arabic-text { font-size: 2.3rem; line-height: 2.2; text-align: right; margin: 0; }
        .mushaf-layout { background: var(--card); padding: 30px; border-radius: 16px; border: 1px solid #334155; }
        .mushaf-text-flow { direction: rtl; text-align: justify; line-height: 2.8; }
        .mushaf-verse { font-size: 2.3rem; cursor: pointer; padding: 0 4px; border-radius: 4px; transition: 0.2s; }
        .mushaf-playing { background: rgba(46, 204, 113, 0.25); color: var(--primary); }
        .mushaf-nav-footer { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: #1e293b; border: 1px solid var(--primary); padding: 10px 25px; border-radius: 50px; display: flex; align-items: center; gap: 30px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); z-index: 1000; }
        .nav-page-btn { background: none; border: none; color: var(--primary); font-weight: bold; cursor: pointer; }
        .page-num { font-size: 1.2rem; color: white; font-weight: bold; }
      `}</style>
    </div>
  );
}