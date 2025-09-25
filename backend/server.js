// --- Importations ---
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// --- Initialisation de l'application ---
const app = express();

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// --- Connexion à MongoDB ---
// --- Connexion à MongoDB (UNIQUEMENT en mode non-test) ---
// --> VÉRIFICATION N°1 : Est-ce que ce bloc est bien dans la condition ?
if (process.env.NODE_ENV !== 'test') {
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => console.log('✅ Connexion à MongoDB réussie'))
        .catch(err => console.error('❌ Erreur de connexion à MongoDB:', err));
}
// --- Liaison des Routes ---
const authRoutes = require('./routes/authRoutes');
const summaryRoutes = require('./routes/summaryRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/summaries', summaryRoutes);

// --- Démarrage du Serveur ---
// --- Démarrage du Serveur (UNIQUEMENT en mode non-test) ---
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`✅ Serveur démarré sur le port ${PORT}`);
    });
}
module.exports = app;
