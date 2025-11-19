const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '../.env' });
const db = require('./db');
const setupDatabase = require('./setup');

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

// API: Alle Alpakas abrufen
app.get('/api/alpakas', async (req, res) => {
  try {
    const [alpakas] = await db.query('SELECT * FROM alpakas WHERE ist_aktiv = TRUE');
    res.json({ success: true, data: alpakas });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Alle Termine abrufen
app.get('/api/termine', async (req, res) => {
  try {
    const [termine] = await db.query('SELECT * FROM termine WHERE ist_aktiv = TRUE ORDER BY datum ASC');
    res.json({ success: true, data: termine });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Server starten
app.listen(PORT, async () => {
  console.log(`🚀 Backend läuft auf http://localhost:${PORT}`);
  
  // Automatisches Setup beim ersten Start
  await setupDatabase();
});
