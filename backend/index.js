const express = require('express');
const cors = require('cors');
const { compareDirs } = require('./compare');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.post('/compare', (req, res) => {
  const { dir1, dir2 } = req.body;
  if (!dir1 || !dir2) {
    return res.status(400).json({ error: 'both are require' });
  }
  const result = compareDirs(dir1, dir2);
  res.json(result);
});

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
