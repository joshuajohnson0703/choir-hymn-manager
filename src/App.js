import React, { useState } from 'react';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function App() {
  const [openingHymn, setOpeningHymn] = useState('');
  const [betweenLessons, setBetweenLessons] = useState('');
  const [bdayHymn, setBdayHymn] = useState('');
  const [offertory, setOffertory] = useState('');
  const [confession, setConfession] = useState('');
  const [communionInput, setCommunionInput] = useState('');
  const [communionHymns, setCommunionHymns] = useState([]);
  const [doxologySlide, setDoxologySlide] = useState('');

  const [loading, setLoading] = useState(false);
  const [readyToDownload, setReadyToDownload] = useState(false);

  const addCommunionHymn = () => {
    const trimmed = communionInput.trim();
    if (trimmed) {
      setCommunionHymns(prev => [...prev, trimmed]);
      setCommunionInput('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setReadyToDownload(false);

    try {
      const response = await fetch(`${API_URL}/generate-pptx`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          openingHymn,
          betweenLessons,
          bdayHymn,
          offertory,
          confession,
          communionHymns,
          doxologySlide,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        alert(`Error: ${err.error || response.statusText}`);
      } else {
        setReadyToDownload(true);
      }
    } catch (error) {
      console.error(error);
      alert('Network error: could not reach server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">Choir Hymn Manager</h1>

        <form onSubmit={handleSubmit}>
          {/* Core Hymns */}
          <div className="form-section">
            <h2>Core Hymns</h2>
            {[
              ['Opening Hymn (e.g. 001)', openingHymn, setOpeningHymn],
              ['Between Lessons Hymn', betweenLessons, setBetweenLessons],
              ['Birthday & WA Hymn', bdayHymn, setBdayHymn],
              ['Offertory Hymn', offertory, setOffertory],
              ['Confession Hymn', confession, setConfession],
            ].map(([label, value, setter], i) => (
              <div key={i} className="form-group">
                <label htmlFor={`field-${i}`}>{label}</label>
                <input
                  id={`field-${i}`}
                  type="text"
                  value={value}
                  onChange={e => setter(e.target.value)}
                />
              </div>
            ))}
          </div>

          {/* Communion Hymns */}
          <div className="form-section">
            <h2>Communion Hymns</h2>
            <div className="form-group-inline">
              <input
                type="text"
                placeholder="Enter 3-digit code"
                value={communionInput}
                onChange={e => setCommunionInput(e.target.value)}
              />
              <button type="button" onClick={addCommunionHymn}>Add</button>
            </div>
            {communionHymns.length > 0 && (
              <ul>
                {communionHymns.map((h, i) => <li key={i}>{h}</li>)}
              </ul>
            )}
          </div>

          {/* Doxology */}
          <div className="form-section">
            <h2>Doxology</h2>
            <div className="form-group">
              <label htmlFor="doxologySlide">Slide Number (1-10)</label>
              <input
                id="doxologySlide"
                type="number"
                min="1"
                max="10"
                value={doxologySlide}
                onChange={e => setDoxologySlide(e.target.value)}
              />
            </div>
          </div>

          {/* Loader */}
          {loading && <div className="spinner"></div>}

          {/* Submit */}
          {!loading && (
            <button type="submit" className="btn">Generate Presentation</button>
          )}

          {/* Download */}
          {readyToDownload && !loading && (
            <button
              type="button"
              className="btn btn-download"
              onClick={() => window.open(`${API_URL}/download`, '_blank')}
            >
              Download ChurchServiceDeck.pptx
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
