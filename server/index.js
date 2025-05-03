const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const OUTPUT_PATH = path.join(__dirname, '../PowerPoints/updated_master.pptx');

app.post('/generate-pptx', (req, res) => {
  const data = req.body;

  const args = [
    '--blank', `"${path.join(__dirname, '../PowerPoints/blank.pptx')}"`,
    '--hymnFolder', `"${path.join(__dirname, '../PowerPoints/Powerpoint')}"`,
    '--opening', data.openingHymn,
    '--between', data.betweenLessons,
    '--bday', data.bdayHymn,
    '--offertory', data.offertory,
    '--confession', data.confession,
    '--communion', data.communionHymns.join(','),
    '--doxology', data.doxologySlide,
  ];

  const command = `python ./server/powerpoint_script.py ${args.join(' ')}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(stderr);
      return res.status(500).send('PPTX generation failed.');
    }
    console.log(stdout);
    res.sendStatus(200);
  });
});

app.get('/download', (req, res) => {
  res.download(OUTPUT_PATH, 'ChurchServiceDeck.pptx');
});

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});