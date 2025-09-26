'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { token, logout } = useAuth();

  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [history, setHistory] = useState([]);
  const [translatingId, setTranslatingId] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (token) {
        try {
          const config = { headers: { Authorization: `Bearer ${token}` } };
          const response = await axios.get('http://localhost:5001/api/summaries', config);
          setHistory(response.data);
        } catch (err) {
          console.error("Erreur lors de la récupération de l'historique:", err);
        }
      }
    };
    fetchHistory();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post('http://localhost:5001/api/summaries/summarize', { url }, config);
      setHistory([response.data, ...history]);
      setUrl('');
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  // NOUVELLE FONCTION POUR LA TRADUCTION
  const handleTranslate = async (summaryId, textToTranslate) => {
    setTranslatingId(summaryId);
    try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.post('http://localhost:5001/api/summaries/translate', { text: textToTranslate }, config);

        // On met à jour l'historique avec le texte traduit
        setHistory(history.map(item => 
            item._id === summaryId 
            ? { ...item, translatedContent: response.data.translatedText } 
            : item
        ));
    } catch (error) {
        console.error("Erreur de traduction:", error);
    } finally {
        setTranslatingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            IntelliSum
          </h1>
          <button onClick={logout} className="bg-gray-700 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md transition">
            Se déconnecter
          </button>
        </header>

        <section className="bg-black/30 backdrop-blur-md border border-white/10 rounded-lg p-6 mb-8">
            {/* ... le formulaire de résumé ne change pas ... */}
             <h2 className="text-2xl mb-4 font-semibold">Nouveau Résumé</h2>
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col md:flex-row gap-2">
                  <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://fr.wikipedia.org/wiki/..."
                    className="flex-grow p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none transition" required />
                  <button type="submit" disabled={loading}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 text-white font-semibold py-3 px-6 rounded-md transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? 'Analyse...' : 'Générer'}
                  </button>
                </div>
                {error && <p className="text-red-400 mt-4">{error}</p>}
              </form>
        </section>

        <section>
          <h2 className="text-2xl mb-4 font-semibold">Historique</h2>
          <div className="space-y-4">
            {history.length > 0 ? (
              history.map((item) => (
                <div key={item._id} className="bg-gray-800/50 p-4 rounded-lg border border-white/10">
                  <p className="text-cyan-400 font-mono text-sm truncate mb-2">{item.originalUrl}</p>
                  <p className="text-gray-300 whitespace-pre-wrap text-sm">{item.content}</p>
                  
                  {/* NOUVEAU BLOC POUR LA TRADUCTION */}
                  <div className="mt-3 border-t border-gray-700 pt-3">
                    {item.translatedContent ? (
                        <p className="text-amber-300 whitespace-pre-wrap text-sm italic">{item.translatedContent}</p>
                    ) : (
                        <button 
                            onClick={() => handleTranslate(item._id, item.content)}
                            disabled={translatingId === item._id}
                            className="text-xs bg-gray-600 hover:bg-gray-500 text-white font-semibold py-1 px-3 rounded-full transition disabled:opacity-50"
                        >
                            {translatingId === item._id ? 'Traduction...' : 'Traduire en Anglais'}
                        </button>
                    )}
                  </div>

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