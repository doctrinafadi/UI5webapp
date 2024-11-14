const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json()); // Middleware zum Parsen von JSON-Daten im Request-Body

// Erweiterte CORS-Konfiguration für den Server
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next(); // Weiterleitung an die nächste Middleware
});

// Route zum Speichern der aktualisierten Daten in der Model-JSON-Datei
app.post('/saveUpdatedData', (req, res) => {
  const updatedData = req.body;
  const filePath = path.join(__dirname, 'webapp', 'model', 'ZeiterfassungData.json');

  // Schreiben der Daten in die JSON-Datei
  fs.writeFile(filePath, JSON.stringify(updatedData, null, 2), (err) => {
    if (err) {
      console.error('Error writing file:', err);
      res.status(500).send('Error saving data to file');
    } else {
      res.status(200).send('Data successfully saved to file');
    }
  });
});

// Starten des Servers auf dem angegebenen Port
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
