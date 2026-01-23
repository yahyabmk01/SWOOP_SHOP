
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  viewKey: string;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children, viewKey }) => {
  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-white-luxury">
      {/* Luminous Shutter Pulse - The Cinematic "Flash" */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`flash-${viewKey}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.4, 0] }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] pointer-events-none bg-gradient-to-tr from-white via-gold/10 to-white"
        />
      </AnimatePresence>

      {/* Main Content Animation - Luxe Aperture Shift */}
      <motion.div
        key={viewKey}
        initial={{ 
          opacity: 0, 
          scale: 0.94,
          filter: 'blur(30px)',
        }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          filter: 'blur(0px)',
        }}
        exit={{ 
          opacity: 0, 
          scale: 1.06,
          filter: 'blur(30px)',
        }}
        transition={{ 
          duration: 0.5, 
          ease: [0.19, 1, 0.22, 1] // Luxe Exponential Out
        }}
        className="relative w-full"
      >
        {children}
      </motion.div>

      {/* Minimalist Depth Vignette */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.02, 0] }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 pointer-events-none z-[9997] bg-black"
      />
    </div>
  );
};

export default PageTransition;
