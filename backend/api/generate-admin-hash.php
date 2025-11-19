<?php
// Passwort-Hash für Admin-Benutzer generieren
$passwort = 'Superheld2025!';
$hash = password_hash($passwort, PASSWORD_BCRYPT);

echo "Passwort-Hash für 'Superheld2025!':\n";
echo $hash . "\n\n";

// SQL-Statement zum Einfügen
echo "SQL:\n";
echo "INSERT INTO benutzer (name, email, passwort_hash, rolle) VALUES \n";
echo "('Admin', 'admin@seelenzauber-alpaka.de', '$hash', 'admin');\n";
