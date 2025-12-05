const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Load NRC data
const nrcData = JSON.parse(fs.readFileSync(path.join(__dirname, 'nrc_data_test.json'), 'utf8'));

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Get all NRC types
app.get('/api/nrc-types', (req, res) => {
  res.json(nrcData.nrcTypes);
});

// Get all states
app.get('/api/states', (req, res) => {
  res.json(nrcData.nrcStates);
});

// Get all townships
app.get('/api/townships', (req, res) => {
  res.json(nrcData.nrcTownships);
});

// Get townships by state
app.get('/api/states/:stateId/townships', (req, res) => {
  const townships = nrcData.nrcTownships.filter(t => t.stateId === req.params.stateId);
  res.json(townships);
});

// Get state by code
app.get('/api/states/code/:code', (req, res) => {
  const state = nrcData.nrcStates.find(s => s.code === req.params.code.toUpperCase());
  if (!state) return res.status(404).json({ error: 'State not found' });
  res.json(state);
});

// Get township by code
app.get('/api/townships/code/:code', (req, res) => {
  const township = nrcData.nrcTownships.find(t => t.code === req.params.code.toUpperCase());
  if (!township) return res.status(404).json({ error: 'Township not found' });
  res.json(township);
});

// Get townships by state number
app.get('/api/states/number/:number/townships', (req, res) => {
  const stateNumber = req.params.number;
  const townships = nrcData.nrcTownships.filter(t => t.stateCode === stateNumber);
  res.json(townships);
});

// Parse and validate NRC
app.post('/api/nrc/parse', (req, res) => {
  const { nrc } = req.body;
  const match = nrc.match(/^(\d{1,2})\/(\w+)\((\w)\)(\d{6})$/);
  
  if (!match) {
    return res.status(400).json({ error: 'Invalid NRC format' });
  }
  
  const [, stateNumber, townshipCode, nrcType, serialNumber] = match;
  
  const state = nrcData.nrcStates.find(s => s.number.en === stateNumber);
  const township = nrcData.nrcTownships.find(t => t.short.en === townshipCode.toUpperCase());
  const type = nrcData.nrcTypes.find(t => t.name.en === nrcType.toUpperCase());
  
  if (!state || !township || !type) {
    return res.status(400).json({ error: 'Invalid NRC data' });
  }
  
  res.json({
    nrc,
    state,
    township,
    type,
    serialNumber
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Myanmar NRC API running on port ${PORT}`);
});