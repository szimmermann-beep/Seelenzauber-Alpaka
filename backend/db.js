const mysql = require('mysql2');
require('dotenv').config({ path: '../.env' });

// Datenbank-Verbindung erstellen
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Promise-Wrapper für einfachere Verwendung
const promiseDb = db.promise();

// Verbindung testen
db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Datenbank-Verbindung fehlgeschlagen:', err.message);
  } else {
    console.log('✅ Erfolgreich mit MariaDB verbunden!');
    connection.release();
  }
});

module.exports = promiseDb;
