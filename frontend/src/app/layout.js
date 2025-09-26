import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext'; // CHEMIN CORRIGÉ avec @

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'IntelliSum',
  description: 'Votre assistant de résumé de contenu IA',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* On remet la balise <body> qui manquait */}
      <body className={`${inter.className} bg-gray-900`}>
        {/* Le Provider doit être à l'intérieur du body */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}