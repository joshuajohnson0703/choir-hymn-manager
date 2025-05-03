const express = require('express');
const path = require('path');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve React static assets from build/
app.use(express.static(path.join(__dirname, '..', 'build')));

// Path to generated PPTX file
const OUTPUT_FILE = path.join(__dirname, '..', 'PowerPoints', 'updated_master.pptx');

// Generate PPTX endpoint
app.post('/generate-pptx', (req, res) => {
  const {
    openingHymn,
    betweenLessons,
    bdayHymn,
    offertory,
    confession,
    communionHymns,
    doxologySlide
  } = req.body;

  const scriptPath = path.join(__dirname, 'powerpoint_script.py');
  const args = [
    '--blank', path.join(__dirname, '..', 'PowerPoints', 'blank.pptx'),
    '--hymnFolder', path.join(__dirname, '..', 'PowerPoints', 'Powerpoint'),
    '--opening', openingHymn,
    '--between', betweenLessons,
    '--bday', bdayHymn,
    '--offertory', offertory,
    '--confession', confession,
    '--communion', communionHymns.join(','),
    '--doxology', doxologySlide
  ];

  const py = spawn('python', [scriptPath, ...args]);
  let stdout = '';
  let stderr = '';

  py.stdout.on('data', data => stdout += data.toString());
  py.stderr.on('data', data => stderr += data.toString());

  py.on('close', code => {
    if (code === 0) {
      return res.json({ success: true, message: stdout.trim() });
    }
    console.error(stderr);
    res.status(500).json({ success: false, error: stderr.trim() });
  });
});

// Download generated PPTX
app.get('/download', (req, res) => {
  res.download(OUTPUT_FILE, 'ChurchServiceDeck.pptx');
});

// Catch-all: serve React index.html for any other GET request
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
