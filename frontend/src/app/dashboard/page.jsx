'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Orbitron } from 'next/font/google';

const orbitron = Orbitron({ subsets: ['latin'], weight: ['400', '700'] });

const LoadingSpinner = () => (
    <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
    </svg>
);

export default function DashboardPage() {
  const { token, logout } = useAuth();
  const router = useRouter();

  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  
  // NOUVEL ÉTAT pour le dernier résumé
  const [newSummary, setNewSummary] = useState(null);
  
  useEffect(() => {
    if (!token) {
      router.push('/');
      return;
    }
    const fetchHistory = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get('http://localhost:5001/api/summaries', config);
        setHistory(response.data);
      } catch (err) {
        if (err.response?.status === 401) logout();
      }
    };
    fetchHistory();
  }, [token, router, logout]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setNewSummary(null); // On efface l'ancien résultat

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post('http://localhost:5001/api/summaries/summarize', { url }, config);
      
      setNewSummary(response.data); // On stocke le nouveau résumé séparément
      setHistory([response.data, ...history]); // On met quand même à jour l'historique
      setUrl('');
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 md:p-8 font-sans">
       <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]"></div>

      <div className="relative max-w-7xl mx-auto z-10">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-10"
        >
          <h1 className={`${orbitron.className} text-2xl font-bold text-gray-200`}>
            IntelliSum <span className="text-cyan-400">Console</span>
          </h1>
          <button onClick={logout}
            className="bg-gray-800/50 hover:bg-red-600/50 border border-red-500/30 text-red-300 hover:text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Déconnexion
          </button>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 flex flex-col gap-8"
          >
            {/* Colonne de Gauche : Formulaire */}
            <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-xl p-6 shadow-lg">
              <form onSubmit={handleSubmit}>
                <label htmlFor="url-input" className="block text-xl font-medium text-gray-200 mb-4">
                  Nouvelle Analyse
                </label>
                <textarea
                  id="url-input" value={url} onChange={(e) => setUrl(e.target.value)}
                  placeholder="Collez une URL ici..."
                  className="w-full p-3 bg-gray-800/60 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none transition resize-none"
                  rows={4} required
                />
                {error && <p className="text-red-400 mt-3 text-sm">{error}</p>}
                <button
                  type="submit" disabled={loading}
                  className="mt-4 w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 px-8 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <LoadingSpinner /> : 'Lancer l\'analyse'}
                </button>
              </form>
            </div>
            
            {/* NOUVELLE SECTION POUR LE RÉSULTAT */}
            <AnimatePresence>
                {newSummary && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-black/20 backdrop-blur-lg border border-cyan-500/50 rounded-xl p-6 shadow-lg"
                    >
                        <h3 className={`${orbitron.className} text-xl mb-4 font-semibold text-cyan-300`}>Résultat de l'analyse</h3>
                        <p className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">{newSummary.content}</p>
                    </motion.div>
                )}
            </AnimatePresence>

          </motion.div>

          {/* Colonne de Droite : Historique */}
          <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
          >
            <h2 className={`${orbitron.className} text-2xl mb-6 font-semibold text-gray-200`}>Archives</h2>
            <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-2">
              <AnimatePresence>
                {history.length > 0 ? (
                  history.map((item) => (
                    <motion.div 
                      key={item._id}
                      layout
                      initial={{ opacity: 0, opacity: 0 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="bg-gray-800/40 backdrop-blur-lg p-5 rounded-xl border border-white/10 transition hover:border-cyan-500/50"
                    >
                      <p className="text-cyan-400 font-mono text-xs truncate mb-3" title={item.originalUrl}>{item.originalUrl}</p>
                      <p className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">{item.content}</p>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-black/20 backdrop-blur-lg rounded-xl border border-dashed border-gray-700">
                      <p className="text-gray-500">Aucune analyse dans les archives.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}