const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = ('jsonwebtoken');
const User = require('../models/User.js');

const router = express.Router();

// ## ROUTE 1: Inscription d'un nouvel utilisateur (REGISTER)
// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Valider les données d'entrée
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Veuillez fournir un nom, un email et un mot de passe." });
        }

        // 2. Vérifier si l'utilisateur existe déjà
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "Cet utilisateur existe déjà." });
        }

        // 3. Créer un nouvel utilisateur
        // Le hachage du mot de passe est géré automatiquement par le middleware pre-save dans User.js
        const user = new User({
            name,
            email,
            password,
        });

        // 4. Sauvegarder l'utilisateur en base de données
        await user.save();

        res.status(201).json({ message: "Utilisateur créé avec succès." });

    } catch (error) {
        res.status(500).json({ message: "Erreur du serveur.", error: error.message });
    }
});

// ## ROUTE 2: Connexion d'un utilisateur (LOGIN)
// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Valider les données d'entrée
        if (!email || !password) {
            return res.status(400).json({ message: "Veuillez fournir un email et un mot de passe." });
        }

        // 2. Chercher l'utilisateur dans la base de données
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Email ou mot de passe incorrect." });
        }

        // 3. Comparer le mot de passe fourni avec celui haché en BDD
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Email ou mot de passe incorrect." });
        }

        // 4. Créer et signer un JSON Web Token (JWT)
        const payload = {
            user: {
                id: user.id,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET, // On aura besoin d'ajouter cette clé secrète dans .env
            { expiresIn: '3h' }, // Le token expirera dans 3 heures
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );

    } catch (error) {
        res.status(500).json({ message: "Erreur du serveur.", error: error.message });
    }
});


module.exports = router;