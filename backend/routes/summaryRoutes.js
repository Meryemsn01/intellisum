const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// On importe nos nouveaux outils
const { protect } = require('../middleware/authMiddleware');
const Summary = require('../models/Summary');

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ## ROUTE 1: Créer un nouveau résumé (PROTÉGÉE)
// @route   POST /api/summaries/summarize
router.post('/summarize', protect, async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL manquante.' });

    try {
        // --- 1. Scraping et appel à Gemini (ne change pas) ---
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

        // --- 2. Sauvegarde en base de données (NOUVEAU) ---
        // Grâce au middleware "protect", req.user contient l'utilisateur connecté.
        const summary = new Summary({
            originalUrl: url,
            content: summaryText,
            user: req.user.id, // On lie ce résumé à l'ID de l'utilisateur connecté
        });
        await summary.save();

        res.status(201).json(summary); // On renvoie le résumé sauvegardé

    } catch (error) {
        console.error('Erreur dans /summarize:', error);
        res.status(500).json({ error: 'Erreur serveur lors du résumé.' });
    }
});


// ## ROUTE 2: Récupérer l'historique de l'utilisateur (PROTÉGÉE)
// @route   GET /api/summaries
router.get('/', protect, async (req, res) => {
    try {
        // On cherche tous les résumés dont le champ "user" correspond à l'ID de l'utilisateur connecté.
        const summaries = await Summary.find({ user: req.user.id }).sort({ createdAt: -1 }); // Trié du plus récent au plus ancien
        res.json(summaries);
    } catch (error) {
        console.error('Erreur dans GET /summaries:', error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});


module.exports = router;