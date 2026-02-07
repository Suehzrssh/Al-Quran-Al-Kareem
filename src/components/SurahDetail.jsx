import React, { useState, useEffect, useRef } from 'react';
import surahList from '../data/surah-list.json';
import juzList from '../data/juz_index.json';

const toArabicDigits = (num) => {
  const id = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().replace(/\d/g, (d) => id[d]);
};

export default function SurahDetail({ pageData, onBack }) {
  const { type, id } = pageData;
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('both');
  const [activeFootnote, setActiveFootnote] = useState(null);
  const [currentAyaKey, setCurrentAyaKey] = useState(null); 
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBesmelePlaying, setIsBesmelePlaying] = useState(false);
  
  const audioRef = useRef(null);
  const verseRefs = useRef({});

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      try {
        if (type === 'surah') {
          const data = await import(`../data/surahs/${id}.json`);
          setContent([{ 
            info: surahList.find(s => s.number === id), 
            verses: data.default.verses 
          }]);
        } else {
          const currentJuz = juzList.juzs.find(j => j.number === id);
          const nextJuz = juzList.juzs.find(j => j.number === id + 1);
          const startPage = currentJuz.start_page;
          const endPage = nextJuz ? nextJuz.start_page - 1 : 604;
          let juzResults = [];
          for (let s = 1; s <= 114; s++) {
            try {
              const res = await import(`../data/surahs/${s}.json`);
              const validVerses = res.default.verses.filter(v => v.page >= startPage && v.page <= endPage);
              if (validVerses.length > 0) {
                juzResults.push({
                  info: surahList.find(item => item.number === s),
                  verses: validVerses
                });
              }
            } catch (e) { console.error(e); }
          }
          setContent(juzResults);
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    loadContent();
  }, [type, id]);

  useEffect(() => {
    if (isPlaying && currentAyaKey) {
      const [sNum, vNum] = currentAyaKey.split('-').map(Number);
      if (vNum === 1 && sNum !== 1 && sNum !== 9 && !isBesmelePlaying) {
        playBesmele(sNum, vNum);
      } else {
        playActualVerse(sNum, vNum);
      }
    } else {
      audioRef.current?.pause();
    }
  }, [currentAyaKey, isPlaying]);

  const playBesmele = (sNum, vNum) => {
    setIsBesmelePlaying(true);
    audioRef.current.src = "https://cdn.islamic.network/quran/audio/64/ar.saoodshuraym/1.mp3";
    audioRef.current.play().catch(e => console.log(e));
    audioRef.current.onended = () => {
      setIsBesmelePlaying(false);
      playActualVerse(sNum, vNum);
    };
  };

  const playActualVerse = (sNum, vNum) => {
    const currentSurah = content.find(s => s.info.number === sNum);
    const verse = currentSurah?.verses.find(v => v.numberInSurah === vNum);

    if (verse && audioRef.current) {
      audioRef.current.src = verse.audio;
      audioRef.current.play().catch(e => console.log(e));
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
          setIsPlaying(false);
        }
      };
    }
  };

  const renderTranslation = (text, footnotes) => {
    if (!text) return null;
    const parts = text.split(/(\[\d+\])/g);
    return parts.map((part, index) => {
      const match = part.match(/\[(\d+)\]/);
      if (match) {
        const fid = parseInt(match[1]);
        const note = footnotes?.find(f => f.id === fid);
        return (
          <sup 
            key={index} 
            className="footnote-marker" 
            onClick={(e) => { 
              e.stopPropagation(); 
              setActiveFootnote(activeFootnote?.id === fid ? null : note); 
            }}
          >
            {fid}
          </sup>
        );
      }
      return part;
    });
  };

  if (loading) return <div className="loading">...</div>;

  return (
    <div className="container">
      <header className="detail-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <div className="header-center">
          <h2 className="surah-name-title">{type === 'juz' ? `${id}. Juz` : content[0]?.info.transliteration}</h2>
          <div className="mode-toggle">
            <button className={viewMode === 'arabic' ? 'on' : ''} onClick={() => setViewMode('arabic')}>AR</button>
            <button className={viewMode === 'both' ? 'on' : ''} onClick={() => setViewMode('both')}>BOTH</button>
            <button className={viewMode === 'translation' ? 'on' : ''} onClick={() => setViewMode('translation')}>EN</button>
          </div>
        </div>
        <div className="player-controls">
          <button onClick={() => {
            if (!currentAyaKey) setCurrentAyaKey(`${content[0].info.number}-${content[0].verses[0].numberInSurah}`);
            setIsPlaying(!isPlaying);
          }} className={`play-btn ${isPlaying ? 'is-playing' : ''}`}>
            {isPlaying ? '⏸' : '▶'}
          </button>
        </div>
      </header>

      <audio ref={audioRef} preload="auto" />

      <div className="verses-list">
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

            {section.verses.map((v) => {
              const aKey = `${section.info.number}-${v.numberInSurah}`;
              return (
                <div 
                  key={aKey} 
                  ref={el => verseRefs.current[aKey] = el}
                  className={`verse-card ${currentAyaKey === aKey && !isBesmelePlaying ? 'playing' : ''}`}
                  onClick={() => { 
                    setIsBesmelePlaying(false); 
                    setCurrentAyaKey(aKey); 
                    setIsPlaying(true); 
                  }}
                >
                  {(viewMode === 'arabic' || viewMode === 'both') && (
                    <p className="arabic-text arabic-font" dir="rtl">
                      {v.text} <span className="aya-num">﴿{toArabicDigits(v.numberInSurah)}﴾</span>
                    </p>
                  )}
                  {(viewMode === 'translation' || viewMode === 'both') && (
                    <div className="translation">
                      <span className="aya-label-num">{v.numberInSurah}.</span>
                      {renderTranslation(v.translation, v.footnotes)}
                      {activeFootnote && v.footnotes?.some(f => f.id === activeFootnote.id) && (
                        <div className="accordion-note">
                          {activeFootnote.note}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <style>{`
        .detail-header { position: sticky; top: 0; background: var(--bg); z-index: 100; display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid #334155; margin-bottom: 20px; gap: 10px; }
        .header-center { text-align: center; flex: 1; }
        .surah-name-title { margin: 0; color: var(--accent); font-size: 1.2rem; font-weight: 700; }
        

        .back-btn, .play-btn { 
          background: #1e293b; 
          border: 1px solid var(--primary); 
          color: var(--primary); 
          width: 40px; 
          height: 40px; 
          border-radius: 50%; 
          cursor: pointer; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-size: 1.2rem;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .back-btn:hover, .play-btn:hover { background: #2d3e5a; }
        .play-btn.is-playing { background: var(--primary); color: white; }

        .mode-toggle { background: var(--card); padding: 3px; border-radius: 8px; display: inline-flex; gap: 2px; margin-top: 5px; border: 1px solid #334155; }
        .mode-toggle button { background: none; border: none; color: var(--text-muted); padding: 4px 10px; font-size: 0.7rem; border-radius: 6px; font-weight: 600; cursor: pointer; }
        .mode-toggle button.on { background: var(--primary); color: white; }
        
        .footnote-marker { color: var(--primary); cursor: pointer; font-weight: bold; padding: 0 2px; font-size: 0.8rem; vertical-align: super; }
        .accordion-note { background: #1e293b; padding: 12px; border-left: 3px solid var(--primary); margin-top: 10px; border-radius: 6px; font-size: 0.85rem; color: var(--text); }
        
        .surah-header-combined { display: flex; align-items: flex-end; justify-content: space-between; color: var(--accent); border-bottom: 1px solid #334155; padding-bottom: 25px; gap: 20px; }
        .basmala-text { font-size: 2.8rem; line-height: 1; transition: 0.3s ease; }
        .besmele-active { color: var(--primary); filter: drop-shadow(0 0 8px var(--primary)); }
        
        .verse-card { background: var(--card); padding: 25px; border-radius: 12px; margin-bottom: 15px; border: 1px solid #334155; cursor: pointer; }
        .verse-card.playing { border-color: var(--primary); background: #243147; }
        .arabic-text { font-size: 2.3rem; line-height: 2.2; text-align: right; margin: 0; }
        .translation { margin-top: 15px; color: var(--text-muted); line-height: 1.7; border-top: 1px solid #334155; padding-top: 15px; }
      `}</style>
    </div>
  );
}