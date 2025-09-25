const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Route: POST /api/summaries/summarize
// Note : Le chemin complet sera /api/summaries/summarize
router.post('/summarize', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL manquante.' });

    try {
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
        const summary = response.text();
        res.json({ summary });

    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur lors du résumé.' });
    }
});

module.exports = router;