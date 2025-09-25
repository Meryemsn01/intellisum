const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const redis = require('redis'); // On importe la bibliothèque Redis
const { GoogleGenerativeAI } = require("@google/generative-ai");

const { protect } = require('../middleware/authMiddleware');
const Summary = require('../models/Summary');

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- Configuration du client Redis ---
let redisClient;

(async () => {
  redisClient = redis.createClient(); // Par défaut, se connecte à localhost:6379
  redisClient.on("error", (error) => console.error(`Erreur du client Redis : ${error}`));
  await redisClient.connect();
  console.log('✅ Connexion à Redis réussie');
})();
// ---------------------------------------------

// ROUTE 1: Créer un nouveau résumé (maintenant avec un cache)
router.post('/summarize', protect, async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL manquante.' });

    try {
        // --- On vérifie le cache d'abord ---
        const cachedSummary = await redisClient.get(url);

        if (cachedSummary) {
            console.log('CACHE HIT: Résumé trouvé dans Redis !');
            const summary = new Summary({
                originalUrl: url,
                content: cachedSummary,
                user: req.user.id,
            });
            await summary.save();
            return res.status(200).json(summary);
        }
        
        console.log('CACHE MISS: Résumé non trouvé, on continue le processus...');
        
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const selectors = ['#mw-content-text p', 'article p', 'main p'];
        let articleText = '';
        for (const selector of selectors) {
            articleText = $(selector).text();
            if (articleText) break;
        }
        if (!articleText) {
            return res.status(400).json({ error: "Impossible d'extraire le contenu." });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Résume ce texte en 3 points clés: "${articleText.substring(0, 10000)}"`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const summaryText = response.text();

        // --- On sauvegarde le nouveau résumé dans le cache ---
        await redisClient.set(url, summaryText, { EX: 3600 }); // Expire dans 1h
        console.log('Nouveau résumé sauvegardé dans Redis.');

        const summary = new Summary({
            originalUrl: url,
            content: summaryText,
            user: req.user.id,
        });
        await summary.save();

        res.status(201).json(summary);

    } catch (error) {
        console.error('Erreur dans /summarize:', error);
        res.status(500).json({ error: 'Erreur serveur lors du résumé.' });
    }
});

// ROUTE 2: Récupérer l'historique (ne change pas)
router.get('/', protect, async (req, res) => {
    try {
        const summaries = await Summary.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(summaries);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

module.exports = router;