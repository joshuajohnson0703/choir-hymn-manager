// server/index.js
const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Path to your generated PPTX
const OUTPUT_PATH = path.join(__dirname, '../PowerPoints/updated_master.pptx');

app.use(cors());
app.use(express.json());

// 1) API endpoint to generate the PPTX
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

  // Build the python CLI args
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
    res.json({ success: true });
  });
});

// 2) Endpoint to download the finished file
app.get('/download', (req, res) => {
  res.download(OUTPUT_PATH, 'ChurchServiceDeck.pptx', err => {
    if (err) console.error('Download error:', err);
  });
});

// 3) (Optional) Serve React’s build directory if you colocate frontend+API
//    Make sure you run `npm run build` in your root so `/build` exists.
const buildPath = path.join(__dirname, '../build');
if (process.env.NODE_ENV === 'production' && require('fs').existsSync(buildPath)) {
  app.use(express.static(buildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
