const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const redis = require('redis');
// NOUVELLE IMPORTATION pour Hugging Face
const { HfInference } = require('@huggingface/inference');

const { protect } = require('../middleware/authMiddleware');
const Summary = require('../models/Summary');

const router = express.Router();
// NOUVELLE CONFIGURATION
const hf = new HfInference(process.env.HUGGINGFACE_TOKEN);

// Configuration du client Redis
let redisClient;
(async () => {
  try {
    redisClient = redis.createClient({ url: process.env.REDIS_URL });
    redisClient.on("error", (error) => console.error(`Erreur du client Redis : ${error}`));
    await redisClient.connect();
    console.log('✅ Connexion à Redis réussie');
  } catch (err) {
    console.error('❌ Échec de la connexion à Redis:', err);
  }
})();

// On renomme la route pour plus de clarté
router.post('/summarize', protect, async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL manquante.' });

    try {
        const cachedSummary = await redisClient.get(url);
        if (cachedSummary) {
            console.log('CACHE HIT: Résumé trouvé dans Redis !');
            const summary = new Summary({ originalUrl: url, content: cachedSummary, user: req.user.id });
            await summary.save();
            return res.status(200).json(summary);
        }
        
        console.log('CACHE MISS: Résumé non trouvé...');
        
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const articleText = $('article p, main p').text();
        if (!articleText) {
            return res.status(400).json({ error: "Impossible d'extraire le contenu." });
        }

        // NOUVEL APPEL À L'API HUGGING FACE
        console.log('Appel à l\'API Hugging Face...');
        const hfResponse = await hf.summarization({
            model: 'facebook/bart-large-cnn', // Un modèle de résumé puissant, principalement pour l'anglais
            inputs: articleText,
        });
        const summaryText = hfResponse.summary_text;
        
        await redisClient.set(url, summaryText, { EX: 3600 });
        console.log('Nouveau résumé sauvegardé dans Redis.');

        const summary = new Summary({ originalUrl: url, content: summaryText, user: req.user.id });
        await summary.save();

        res.status(201).json(summary);

    } catch (error) {
        console.error('Erreur dans /summarize:', error);
        res.status(500).json({ error: 'Erreur serveur lors du résumé.' });
    }
});

router.get('/', protect, async (req, res) => {
    try {
        const summaries = await Summary.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(summaries);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

// ## ROUTE 3: Traduire un texte (PROTÉGÉE)
// @route   POST /api/summaries/translate
router.post('/translate', protect, async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Texte manquant.' });

    try {
        console.log('Appel à l\'API de traduction Hugging Face...');
        const hfResponse = await hf.translation({
            // Un excellent modèle de traduction du français vers l'anglais
            model: 'Helsinki-NLP/opus-mt-fr-en', 
            inputs: text,
        });

        res.json({ translatedText: hfResponse.translation_text });

    } catch (error) {
        console.error('Erreur dans /translate:', error);
        res.status(500).json({ error: 'Erreur serveur lors de la traduction.' });
    }
});

module.exports = router;