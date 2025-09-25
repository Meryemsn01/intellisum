const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 1. Définition du Schéma de l'Utilisateur
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Le nom est obligatoire"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "L'email est obligatoire"],
        unique: true, // Chaque email doit être unique
        lowercase: true,
        trim: true,
        match: [/.+\@.+\..+/, "Veuillez entrer un email valide"]
    },
    password: {
        type: String,
        required: [true, "Le mot de passe est obligatoire"],
        minlength: [6, "Le mot de passe doit contenir au moins 6 caractères"]
    }
}, {
    timestamps: true // Ajoute automatiquement les champs createdAt et updatedAt
});


// 2. Middleware "pre-save" pour hacher le mot de passe
// Cette fonction sera exécutée AUTOMATIQUEMENT avant chaque sauvegarde d'un nouvel utilisateur.
userSchema.pre('save', async function(next) {
    // On ne hache le mot de passe que s'il a été modifié (ou s'il est nouveau)
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // "Saler" le mot de passe pour plus de sécurité (10 est le coût du salage)
        const salt = await bcrypt.genSalt(10);
        // Remplacer le mot de passe en clair par sa version hachée
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// 3. Création et Exportation du Modèle
const User = mongoose.model('User', userSchema);

module.exports = User;