// server/index.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Path to your generated PPTX
const OUTPUT_PATH = path.join(__dirname, '../PowerPoints/updated_master.pptx');

// Enable CORS for all origins (or lock it down to your GH Pages URL)
app.use(cors());
// If you prefer to only allow your Pages domain, use:
// app.use(cors({ origin: 'https://joshuajohnson0703.github.io' }));

app.use(express.json());

// 1) Generate PPTX endpoint
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
    '--blank',      `"${path.join(__dirname, '../PowerPoints/blank.pptx')}"`,
    '--hymnFolder', `"${path.join(__dirname, '../PowerPoints/Powerpoint')}"`,
    '--opening',    openingHymn,
    '--between',    betweenLessons,
    '--bday',       bdayHymn,
    '--offertory',  offertory,
    '--confession', confession,
    '--communion',  communionHymns.join(','),
    '--doxology',   doxologySlide
  ];

  const cmd = `python "${scriptPath}" ${args.join(' ')}`;
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error('Generation error:', stderr);
      return res.status(500).json({ success: false, error: stderr });
    }
    console.log('Generation output:', stdout);
    // confirm file exists before responding
    if (!fs.existsSync(OUTPUT_PATH)) {
      return res.status(500).json({ success: false, error: 'Output file missing' });
    }
    res.json({ success: true });
  });
});

// 2) Download endpoint
app.get('/download', (req, res) => {
  if (!fs.existsSync(OUTPUT_PATH)) {
    return res.status(404).send('Generated file not found');
  }
  res.download(OUTPUT_PATH, 'ChurchServiceDeck.pptx', err => {
    if (err) console.error('Download error:', err);
  });
});

// 3) (Optional) Serve React build if deployed together
const buildDir = path.join(__dirname, '../build');
if (process.env.NODE_ENV === 'production' && fs.existsSync(buildDir)) {
  app.use(express.static(buildDir));
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildDir, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`✅ Server listening on http://localhost:${PORT}`);
});
