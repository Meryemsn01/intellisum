# Étape 1: L'image de base
# On part d'une image officielle de Node.js (version 18, "alpine" pour la légèreté)
FROM node:18-alpine

# Étape 2: Créer le répertoire de travail
# On crée un dossier à l'intérieur du conteneur pour y mettre notre code
WORKDIR /app

# Étape 3: Copier les dépendances
# On copie d'abord package.json et package-lock.json pour optimiser le cache de Docker
COPY package*.json ./

# Étape 4: Installer les dépendances
# On lance npm install à l'intérieur du conteneur
RUN npm install

# Étape 5: Copier le reste du code
# Maintenant que les dépendances sont installées, on copie tout le reste de notre code
COPY . .

# Étape 6: Exposer le port
# On dit à Docker que notre application écoute sur le port 5000 à l'intérieur du conteneur
EXPOSE 5000

# Étape 7: La commande de démarrage
# C'est la commande qui sera lancée quand le conteneur démarre
CMD [ "node", "server.js" ]