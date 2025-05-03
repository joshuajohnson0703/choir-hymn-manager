import React, { useState } from 'react';
import './App.css';

// Base URL for API; override via environment variable
const API_URL = process.env.REACT_APP_API_URL || 'https://choir-hymn-manager.onrender.com';

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
      if (!response.ok) throw new Error('Server error');
      setReadyToDownload(true);
    } catch (err) {
      console.error(err);
      alert(`Error: ${err.message}`);
    }
    setLoading(false);
  };

  const handleDownload = async () => {
    try {
      const res = await fetch(`${API_URL}/download`);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ChurchServiceDeck.pptx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert(`Download error: ${err.message}`);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">Choir Hymn Manager</h1>
        <form onSubmit={handleSubmit} className="form">
          <div className="form-section">
            <h2>Core Hymns</h2>
            {[
              ['Opening Hymn (e.g. 001)', openingHymn, setOpeningHymn],
              ['Between Lessons Hymn', betweenLessons, setBetweenLessons],
              ['Birthday & WA Hymn', bdayHymn, setBdayHymn],
              ['Offertory Hymn', offertory, setOffertory],
              ['Confession Hymn', confession, setConfession],
            ].map(([label, value, setter], idx) => (
              <div key={idx} className="form-group">
                <label>{label}</label>
                <input
                  type="text"
                  value={value}
                  onChange={e => setter(e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="form-section">
            <h2>Communion Hymns</h2>
            <div className="form-group-inline">
              <input
                type="text"
                placeholder="Enter code"
                value={communionInput}
                onChange={e => setCommunionInput(e.target.value)}
              />
              <button type="button" onClick={addCommunionHymn} className="btn">
                Add
              </button>
            </div>
            {communionHymns.length > 0 && (
              <ul className="list">
                {communionHymns.map((h, i) => (<li key={i}>{h}</li>))}
              </ul>
            )}
          </div>

          <div className="form-section">
            <h2>Doxology</h2>
            <div className="form-group">
              <label>Slide Number (1-10)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={doxologySlide}
                onChange={e => setDoxologySlide(e.target.value)}
              />
            </div>
          </div>

          {loading && <div className="spinner"></div>}

          {!loading && <button type="submit" className="btn">Submit</button>}
        </form>

        {readyToDownload && !loading && (
          <button onClick={handleDownload} className="btn btn-download">
            Download Presentation
          </button>
        )}
      </div>
    </div>
  );
}
