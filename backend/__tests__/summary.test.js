const request = require('supertest');
const app = require('../server');
const Summary = require('../models/Summary');
const User = require('../models/User');

describe('Summary Routes', () => {
    let token;
    let userId;

    // Avant chaque test dans ce fichier, on crée et connecte un utilisateur
    beforeEach(async () => {
        // 1. Créer un utilisateur de test
        await request(app).post('/api/auth/register').send({
            name: 'Summary Test User',
            email: 'summary@test.com',
            password: 'password123',
        });

        // 2. Le connecter pour obtenir un token
        const res = await request(app).post('/api/auth/login').send({
            email: 'summary@test.com',
            password: 'password123',
        });

        token = res.body.token; // On stocke le token
        
        // Bonus: on récupère l'ID de l'utilisateur pour des vérifications plus tard
        const user = await User.findOne({ email: 'summary@test.com' });
        userId = user.id;
    });

    // TEST N°1 : Échec si l'utilisateur n'est pas authentifié
    it('should fail to create a summary if user is not authenticated', async () => {
        const res = await request(app)
            .post('/api/summaries/summarize')
            .send({ url: 'https://fr.wikipedia.org/wiki/Node.js' });

        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty('message', 'Non autorisé, pas de token');
    });

    // TEST N°2 : Succès si l'utilisateur est authentifié
    // Note: Ce test fait un vrai appel à l'API Gemini, il peut donc être un peu long
    it('should create a summary successfully if user is authenticated', async () => {
        const res = await request(app)
            .post('/api/summaries/summarize')
            .set('Authorization', `Bearer ${token}`) // On ajoute le token dans les en-têtes !
            .send({ url: 'https://fr.wikipedia.org/wiki/Node.js' });

        // Vérifie la réponse de l'API
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('content'); // Le résumé doit avoir un contenu
        expect(res.body).toHaveProperty('user', userId); // Le résumé doit être lié au bon utilisateur

        // Vérifie que le résumé a bien été sauvegardé en BDD
        const summaryInDb = await Summary.findById(res.body._id);
        expect(summaryInDb).not.toBeNull();
        expect(summaryInDb.user.toString()).toEqual(userId);
    }, 20000); // On augmente le temps max du test à 20 secondes car l'appel à l'IA peut être long

});