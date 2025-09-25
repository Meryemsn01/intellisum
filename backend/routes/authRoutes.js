const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

const router = express.Router();

// Route: POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Veuillez fournir toutes les informations." });
        }
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "Cet utilisateur existe déjà." });
        }
        const user = new User({ name, email, password });
        await user.save();
        res.status(201).json({ message: "Utilisateur créé avec succès." });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur lors de l'inscription." });
    }
});

// Route: POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email et mot de passe requis." });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Identifiants invalides." });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Identifiants invalides." });
        }
        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '3h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur lors de la connexion." });
    }
});

module.exports = router;