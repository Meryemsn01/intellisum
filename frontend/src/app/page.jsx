'use client'; 

import { useState } from 'react';
import axios from 'axios';
import clsx from 'clsx';
import Link from 'next/link';

// Importations
import AnimatedTitle from './components/AnimatedTitle';
import ClientOnly from './components/ClientOnly';
import AIBG from './components/AIBG';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [letterPositions, setLetterPositions] = useState(null);

  const { login } = useAuth();
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res = await axios.post('http://localhost:5001/api/auth/login', { email, password });
      login(res.data.token);
      alert('Connexion réussie !');
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
            <p className="text-gray-300">Entrez dans le futur du résumé</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
            
            <p className="text-center text-sm text-gray-400">
                Pas de compte ? <Link href="/register" className="font-medium text-cyan-300 hover:underline">Inscrivez-vous</Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}