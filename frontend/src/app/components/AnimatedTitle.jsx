'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

// On importe la nouvelle police
import { Orbitron } from 'next/font/google';

// On configure la police
const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '700'],
});

const AnimatedTitle = ({ onLettersPositioned }) => {
  const text = "IntelliSum";
  const letters = Array.from(text);
  const letterRefs = useRef([]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const positions = letterRefs.current.map(el => {
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      });
      if (positions.every(p => p !== null) && positions.length > 0) {
        onLettersPositioned(positions);
      }
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [onLettersPositioned]);

  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", damping: 12, stiffness: 100 },
    },
  };

  return (
    // On combine les classes de la police avec les nôtres
    <motion.h1
      className={`${orbitron.className} text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500 flex justify-center w-full`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          variants={letterVariants}
          ref={el => letterRefs.current[index] = el}
        >
          {letter}
        </motion.span>
      ))}
    </motion.h1>
  );
};

export default AnimatedTitle;