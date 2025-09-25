const mongoose = require('mongoose');

const summarySchema = new mongoose.Schema({
    originalUrl: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    // C'est ici que la magie opère !
    // On crée un lien vers le modèle 'User'.
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // La référence au modèle User
        required: true,
    },
}, {
    timestamps: true // Ajoute createdAt et updatedAt
});

const Summary = mongoose.model('Summary', summarySchema);

module.exports = Summary;