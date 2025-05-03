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

  const addCommunionHymn = () => {
    const trimmed = communionInput.trim();
    if (trimmed) {
      setCommunionHymns(prev => [...prev, trimmed]);
      setCommunionInput('');
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    const data = {
      openingHymn,
      betweenLessons,
      bdayHymn,
      offertory,
      confession,
      communionHymns,
      doxologySlide,
    };
    console.log('Form Data:', data);
    // TODO: integrate with backend or file processing
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl p-8">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8">
          Choir Hymn Manager
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Core Hymns Section */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-700">Core Hymns</h2>
            {[
              {label: 'Opening Hymn (e.g. 001)', value: openingHymn, setter: setOpeningHymn},
              {label: 'Between Lessons Hymn', value: betweenLessons, setter: setBetweenLessons},
              {label: 'Birthday & WA Hymn', value: bdayHymn, setter: setBdayHymn},
              {label: 'Offertory Hymn', value: offertory, setter: setOffertory},
              {label: 'Confession Hymn', value: confession, setter: setConfession},
            ].map(({label, value, setter}, idx) => (
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

          {/* Communion Hymns Section */}
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

          {/* Doxology Section */}
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

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-shadow shadow"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
