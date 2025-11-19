const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '../.env' });
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Test-Route
app.get('/', (req, res) => {
  res.json({ 
    message: '🦙 Seelenzauber-Alpaka Backend läuft!',
    status: 'online'
  });
});

// Datenbank-Test-Route
app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS result');
    res.json({ 
      success: true, 
      message: 'Datenbank-Verbindung erfolgreich!',
      result: rows[0].result 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Datenbank-Fehler', 
      error: error.message 
    });
  }
});

// Server starten
app.listen(PORT, () => {
  console.log(`🚀 Backend läuft auf http://localhost:${PORT}`);
});
