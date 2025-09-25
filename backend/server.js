// --- Importations ---
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');
const cheerio = require('cheerio');
// NOUVELLE IMPORTATION pour Google AI
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// --- Configuration de Google AI (Gemini) ---
// On récupère la nouvelle clé
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- Initialisation de l'application Express ---
const app = express();

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// --- Connexion à MongoDB ---
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connexion à MongoDB réussie'))
    .catch(err => console.error('❌ Erreur de connexion à MongoDB:', err));

// --- Routes ---
app.get('/', (req, res) => {
    res.json({ message: 'Bienvenue sur l\'API IntelliSum !' });
});



// --- Démarrage du serveur ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur le port ${PORT}`);
});