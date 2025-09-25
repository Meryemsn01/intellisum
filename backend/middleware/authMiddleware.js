const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    // 1. On vérifie si le token est dans les en-têtes et s'il commence par "Bearer"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 2. On récupère le token (en enlevant le "Bearer ")
            token = req.headers.authorization.split(' ')[1];

            // 3. On décode et vérifie le token avec notre clé secrète
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 4. On attache l'utilisateur à la requête
            // On récupère l'utilisateur depuis la BDD grâce à l'ID contenu dans le token,
            // et on exclut le mot de passe pour des raisons de sécurité.
            req.user = await User.findById(decoded.user.id).select('-password');

            // 5. On passe à la suite (la logique de la route protégée)
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Non autorisé, le token a échoué' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Non autorisé, pas de token' });
    }
};

module.exports = { protect };