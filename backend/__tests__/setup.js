const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Se lance AVANT tous les tests
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

// Se lance APRES tous les tests
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

// Se lance APRES CHAQUE test
afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany(); // Nettoie la BDD entre chaque test
    }
});