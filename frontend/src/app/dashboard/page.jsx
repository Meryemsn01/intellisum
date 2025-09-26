'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { token, logout } = useAuth();

  // États pour le formulaire de résumé
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newSummary, setNewSummary] = useState(null);

  // État pour l'historique
  const [history, setHistory] = useState([]);

  // Effet pour charger l'historique au chargement de la page
  useEffect(() => {
    const fetchHistory = async () => {
      if (token) {
        try {
          const config = {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };
          const response = await axios.get('http://localhost:5001/api/summaries', config);
          setHistory(response.data);
        } catch (err) {
          console.error("Erreur lors de la récupération de l'historique:", err);
        }
      }
    };
    fetchHistory();
  }, [token]); // Se déclenche quand le token est disponible

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setNewSummary(null);

    try {
      // On prépare la requête authentifiée avec le token
      const config = {
        headers: {
          Authorization: `Bearer ${token}`, // C'est ici qu'on prouve notre identité
        },
      };

      const response = await axios.post('http://localhost:5001/api/summaries/summarize', { url }, config);
      
      setNewSummary(response.data); // On affiche le nouveau résumé
      setHistory([response.data, ...history]); // On l'ajoute en haut de la liste d'historique
      setUrl(''); // On vide le champ de saisie

    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            IntelliSum
          </h1>
          <button 
            onClick={logout}
            className="bg-gray-700 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md transition"
          >
            Se déconnecter
          </button>
        </header>

        {/* Section du formulaire de résumé */}
        <section className="bg-black/30 backdrop-blur-md border border-white/10 rounded-lg p-6 mb-8">
          <h2 className="text-2xl mb-4 font-semibold">Nouveau Résumé</h2>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col md:flex-row gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://fr.wikipedia.org/wiki/..."
                className="flex-grow p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none transition"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 text-white font-semibold py-3 px-6 rounded-md transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Analyse...' : 'Générer'}
              </button>
            </div>
            {error && <p className="text-red-400 mt-4">{error}</p>}
          </form>

          {/* Affichage du dernier résumé généré */}
          {newSummary && (
            <div className="mt-6 p-4 bg-gray-800 rounded-md border border-cyan-500/30">
              <h3 className="font-semibold text-lg mb-2">Dernier Résumé :</h3>
              <p className="text-gray-300 whitespace-pre-wrap">{newSummary.content}</p>
            </div>
          )}
        </section>

        {/* Section de l'historique */}
        <section>
          <h2 className="text-2xl mb-4 font-semibold">Historique</h2>
          <div className="space-y-4">
            {history.length > 0 ? (
              history.map((item) => (
                <div key={item._id} className="bg-gray-800/50 p-4 rounded-lg border border-white/10">
                  <p className="text-cyan-400 font-mono text-sm truncate mb-2">{item.originalUrl}</p>
                  <p className="text-gray-300 whitespace-pre-wrap text-sm">{item.content}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Votre historique est vide.</p>
            )}
          </div>
        </section>

      </div>
    </main>
  );
}