import React, { useState } from 'react';

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

    const response = await fetch('http://localhost:5000/generate-pptx', {
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

    if (response.ok) {
      setReadyToDownload(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl p-8">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8">
          Choir Hymn Manager
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-700">Core Hymns</h2>
            {[{
              label: 'Opening Hymn (e.g. 001)', value: openingHymn, setter: setOpeningHymn
            }, {
              label: 'Between Lessons Hymn', value: betweenLessons, setter: setBetweenLessons
            }, {
              label: 'Birthday & WA Hymn', value: bdayHymn, setter: setBdayHymn
            }, {
              label: 'Offertory Hymn', value: offertory, setter: setOffertory
            }, {
              label: 'Confession Hymn', value: confession, setter: setConfession
            }].map(({ label, value, setter }, idx) => (
              <div key={idx} className="flex flex-col">
                <label htmlFor={`field-${idx}`} className="text-gray-600 font-medium mb-2">
                  {label}
                </label>
                <input
                  id={`field-${idx}`}
                  type="text"
                  value={value}
                  onChange={e => setter(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            ))}
          </section>

          <hr className="border-gray-200" />

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-700">Communion Hymns</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter 3-digit code"
                value={communionInput}
                onChange={e => setCommunionInput(e.target.value)}
                className="flex-grow p-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="button"
                onClick={addCommunionHymn}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-shadow shadow"
              >
                Add
              </button>
            </div>
            {communionHymns.length > 0 && (
              <ul className="list-disc list-inside pl-5 space-y-1">
                {communionHymns.map((h, i) => (
                  <li key={i} className="text-gray-600">{h}</li>
                ))}
              </ul>
            )}
          </section>

          <hr className="border-gray-200" />

          <section className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-700">Doxology</h2>
            <div className="flex flex-col">
              <label htmlFor="doxologySlide" className="text-gray-600 font-medium mb-2">
                Slide Number (1-10)
              </label>
              <input
                id="doxologySlide"
                type="number"
                min="1"
                max="10"
                value={doxologySlide}
                onChange={e => setDoxologySlide(e.target.value)}
                className="w-32 p-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </section>

          {loading && (
            <div className="flex justify-center mt-4">
              <svg
                className="animate-spin h-8 w-8 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            </div>
          )}

          {!loading && (
            <button
              type="submit"
              className="w-full py-4 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-shadow shadow"
            >
              Submit
            </button>
          )}

          {readyToDownload && !loading && (
            <a
              href="http://localhost:5000/download"
              className="block text-center mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-shadow shadow"
              download
            >
              Download ChurchServiceDeck.pptx
            </a>
          )}
        </form>
      </div>
    </div>
  );
}
