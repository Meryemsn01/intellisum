'use client';

import { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Vérifie si un token est dans le localStorage au chargement de l'app
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      // Idéalement, on vérifierait aussi la validité du token auprès du backend ici
    }
  }, []);

  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken); // Sauvegarde le token
    router.push('/dashboard'); // Redirige vers le dashboard
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token'); // Supprime le token
    router.push('/'); // Redirige vers la page de connexion
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour utiliser facilement notre contexte
export const useAuth = () => {
  return useContext(AuthContext);
};