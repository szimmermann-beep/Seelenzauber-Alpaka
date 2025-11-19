const db = require('./db');

async function setupDatabase() {
  try {
    console.log('🔍 Prüfe Datenbank-Setup...');

    // Prüfe ob bereits Daten vorhanden sind
    const [users] = await db.query('SELECT COUNT(*) as count FROM users');
    
    if (users[0].count > 0) {
      console.log('✅ Datenbank enthält bereits Daten');
      return;
    }

    console.log('📝 Füge Test-Daten ein...');

    // Test-Admin-User
    await db.query(`
      INSERT INTO users (username, email, password_hash, role) VALUES
      ('admin', 'admin@seelenzauber-alpaka.de', '$2b$10$rXQ7VqZ5QqZ5QqZ5QqZ5Qe', 'admin')
    `);
    console.log('  ✓ Admin-User erstellt');

    // Beispiel-Alpakas
    await db.query(`
      INSERT INTO alpakas (name, geburtsdatum, geschlecht, farbe, beschreibung, charakter) VALUES
      ('Luna', '2020-05-15', 'weiblich', 'Weiß', 'Luna ist unser sanftes Alpaka-Mädchen', 'Ruhig und freundlich'),
      ('Felix', '2019-03-22', 'männlich', 'Braun', 'Felix ist sehr neugierig und verspielt', 'Energisch und sozial'),
      ('Bella', '2021-07-10', 'weiblich', 'Grau', 'Bella liebt Streicheleinheiten', 'Verschmust und geduldig')
    `);
    console.log('  ✓ 3 Alpakas erstellt');

    // Beispiel-Termine
    await db.query(`
      INSERT INTO termine (titel, beschreibung, datum, uhrzeit_von, uhrzeit_bis, max_teilnehmer, preis, ist_aktiv) VALUES
      ('Alpaka-Wanderung', 'Entspannte Wanderung mit unseren Alpakas durch die Natur', '2025-12-01', '10:00:00', '12:00:00', 8, 45.00, TRUE),
      ('Alpaka-Begegnung', 'Kennenlernen und Füttern der Alpakas', '2025-12-05', '14:00:00', '15:30:00', 6, 25.00, TRUE)
    `);
    console.log('  ✓ 2 Termine erstellt');

    console.log('✅ Test-Daten erfolgreich eingefügt!');

  } catch (error) {
    console.error('❌ Fehler beim Setup:', error.message);
  }
}

module.exports = setupDatabase;
