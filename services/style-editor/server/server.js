const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Simple request logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] Received ${req.method} request for ${req.url}`);
  next();
});

// In-memory "database"
let stylePairs = [
    { _id: '1', before: 'لقد كان اجتماعا جيدا.', after: 'لقد كان اجتماعًا مثمرًا للغاية.' },
    { _id: '2', before: 'يجب أن ننتهي من هذا بسرعة.', after: 'من الضروري إنجاز هذا المشروع في الوقت المحدد.' }
];
let nextId = 3;

// --- API Routes ---

// GET all style pairs
app.get('/api/pairs', (req, res) => {
  res.json(stylePairs);
});

// POST a new style pair
app.post('/api/pairs', (req, res) => {
  const { before, after } = req.body;
  if (!before || !after) {
    return res.status(400).json({ message: 'Both "before" and "after" fields are required.' });
  }
  const newPair = {
    _id: String(nextId++),
    before: String(before),
    after: String(after),
  };
  stylePairs.push(newPair);
  res.status(201).json(newPair);
});

// POST a batch of new style pairs
app.post('/api/pairs/batch', (req, res) => {
  const pairsData = req.body;
  if (!Array.isArray(pairsData)) {
    return res.status(400).json({ message: 'Request body must be an array of pairs.'});
  }

  const newPairs = [];
  for (const pairData of pairsData) {
    if (!pairData.before || !pairData.after) {
      console.warn('Skipping invalid pair in batch:', pairData);
      continue;
    }
    const newPair = {
      _id: String(nextId++),
      before: String(pairData.before),
      after: String(pairData.after),
    };
    newPairs.push(newPair);
  }
  
  stylePairs.push(...newPairs);
  res.status(201).json(newPairs);
});

// DELETE a style pair by ID
app.delete('/api/pairs/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = stylePairs.length;
  stylePairs = stylePairs.filter(pair => pair._id !== id);
  if (stylePairs.length === initialLength) {
    return res.status(404).json({ message: `Pair with id ${id} not found.`});
  }
  res.json({ message: `Pair with id ${id} deleted successfully.` });
});


// Start server
app.listen(PORT, () => {
const API_URL = 'https://style-editor-service.onrender.com'
});