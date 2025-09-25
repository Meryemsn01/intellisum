const request = require('supertest');
const app = require('../server'); // On importe notre application Express
const User = require('../models/User');

// On groupe tous les tests liés à l'authentification
describe('Auth Routes', () => {

    // PREMIER TEST : Inscription réussie
    it('should register a new user successfully', async () => {
        // 1. Préparation (Arrange)
        const userData = {
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
        };

        // 2. Action (Act)
        // On envoie une requête POST à notre API avec les données de l'utilisateur
        const res = await request(app)
            .post('/api/auth/register')
            .send(userData);

        // 3. Assertion (Assert)
        // On vérifie que la réponse du serveur est correcte
        expect(res.statusCode).toEqual(201); // Le statut doit être 201 (Created)
        expect(res.body).toHaveProperty('message', 'Utilisateur créé avec succès.');

        // Bonus : On vérifie que l'utilisateur a bien été créé en BDD
        const userInDb = await User.findOne({ email: 'test@example.com' });
        expect(userInDb).not.toBeNull();
    });

    // DEUXIÈME TEST : Échec de l'inscription si l'email existe déjà
    it('should fail to register a user with an existing email', async () => {
        // 1. Préparation (Arrange)
        // On crée d'abord un utilisateur
        const userData = {
            name: 'Existing User',
            email: 'existing@example.com',
            password: 'password123',
        };
        await request(app).post('/api/auth/register').send(userData);

        // 2. Action (Act)
        // On essaie de s'inscrire à nouveau avec le même email
        const res = await request(app)
            .post('/api/auth/register')
            .send(userData);

        // 3. Assertion (Assert)
        // On vérifie que le serveur renvoie une erreur 400 (Bad Request)
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'Cet utilisateur existe déjà.');
    });

});