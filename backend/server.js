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

app.post('/api/summarize', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL manquante.' });

    try {
        console.log('--- NOUVELLE REQUÊTE ---');
        // 1. Scraping (cette partie ne change pas)
        console.log('Étape 1: Démarrage du scraping...');
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const selectors = ['#mw-content-text p', 'article p', 'main p'];
        let k = '';
        for (const selector of selectors) {
            articleText = $(selector).text();
            if (articleText) {
                console.log(`✅ Contenu trouvé avec le sélecteur: '${selector}'`);
                break;
            }
        }

        if (!articleText) {
            return res.status(400).json({ error: "Impossible d'extraire le contenu de l'article." });
        }
        console.log('Texte extrait avec succès (longueur):', articleText.length);

        // 2. Appel à Gemini Pro (cette partie change)
        console.log('Étape 2: Préparation de l\'appel à Gemini Pro...');
        // NOUVELLE LIGNE
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Résume le texte suivant en français, en 3 points clés clairs et concis, 
                        sous forme de liste à puces. Le ton doit être professionnel et informatif.
                        Voici le texte : "${articleText.substring(0, 10000)}"`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const summary = response.text();

        console.log('✅ Appel à Gemini Pro réussi !');

        // 3. Envoi de la réponse (cette partie ne change pas)
        console.log('Étape 3: Envoi du résumé au client.');
        res.json({ summary });

    } catch (error) {
        console.error('❌ ERREUR GLOBALE DANS LE BLOC TRY-CATCH ❌', error);
        res.status(500).json({ error: 'Une erreur est survenue lors du traitement de votre demande.' });
    }
});

// --- Démarrage du serveur ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur le port ${PORT}`);
});