// --- Importations ---
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');
const cheerio = require('cheerio');
const { OpenAI } = require('openai');
require('dotenv').config();

// --- Configuration d'OpenAI ---
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

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

// Route de test
app.get('/', (req, res) => {
    res.json({ message: 'Bienvenue sur l\'API IntelliSum !' });
});




// --- Démarrage du serveur ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur le port ${PORT}`);
});