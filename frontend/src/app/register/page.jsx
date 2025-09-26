'use client'; 

import { useState } from 'react';
import axios from 'axios';
import clsx from 'clsx';
import Link from 'next/link';

// Importations des composants partagés
import AnimatedTitle from '../components/AnimatedTitle';
import ClientOnly from '../components/ClientOnly';
import AIBG from '../components/AIBG';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [letterPositions, setLetterPositions] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // On appelle bien l'API d'inscription
      const response = await axios.post('http://localhost:5001/api/auth/register', {
        name,
        email,
        password,
      });
      setSuccess(response.data.message + " Vous pouvez maintenant vous connecter.");

    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-transparent text-white flex items-center justify-center p-4 overflow-hidden">
      <AIBG letterPositions={letterPositions} />

      <div className="relative z-10 w-full max-w-md">
        <div 
          className={clsx(
            "bg-black/50 backdrop-blur-md rounded-2xl shadow-2xl p-8 space-y-6 border border-white/20",
            { "border-red-500/50": error }
          )}
        >
          <div className="text-center mb-4">
            <ClientOnly>
              <AnimatedTitle onLettersPositioned={setLetterPositions} />
            </ClientOnly>
            <p className="text-gray-300">Créer un accès au système</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Si l'inscription n'est pas réussie, on affiche le formulaire */}
            {!success && (
              <>
                <div className="relative">
                  <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="Nom d'utilisateur"
                    className="w-full p-3 bg-black/20 text-white border-none rounded-md focus:ring-2 focus:ring-cyan-400 focus:outline-none transition placeholder-gray-400"
                    required />
                </div>
                <div className="relative">
                  <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full p-3 bg-black/20 text-white border-none rounded-md focus:ring-2 focus:ring-cyan-400 focus:outline-none transition placeholder-gray-400"
                    required />
                </div>
                <div className="relative">
                  <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mot de passe"
                    className="w-full p-3 bg-black/20 text-white border-none rounded-md focus:ring-2 focus:ring-cyan-400 focus:outline-none transition placeholder-gray-400"
                    required />
                </div>
                {error && <p className="text-red-400 bg-red-500/10 p-3 rounded-md text-center text-sm">{error}</p>}
                <button type="submit" disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 text-white font-semibold py-3 px-6 rounded-md transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform">
                  {loading ? 'Création en cours...' : 'Créer le compte'}
                </button>
              </>
            )}

            {/* Si l'inscription est réussie, on affiche un message de succès */}
            {success && <p className="text-green-400 bg-green-500/10 p-3 rounded-md text-center text-sm">{success}</p>}

            <p className="text-center text-sm text-gray-400">
              Déjà un compte ? <Link href="/" className="font-medium text-cyan-300 hover:underline">Connectez-vous</Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}