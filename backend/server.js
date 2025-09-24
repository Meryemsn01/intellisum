// Importer les dépendances
const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Pour charger les variables d'environnement

// Initialiser l'application Express
const app = express();

// Middlewares
app.use(cors()); // Permet les requêtes cross-origin (entre le front et le back)
app.use(express.json()); // Permet de parser le JSON des requêtes entrantes

// Route de test pour vérifier que le serveur fonctionne
app.get('/', (req, res) => {
    res.json({ message: 'Bienvenue sur l\'API IntelliSum !' });
});

// Définir le port d'écoute
const PORT = process.env.PORT || 5000;

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur le port ${PORT}`);
});