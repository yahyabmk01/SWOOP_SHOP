
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const menuItems = [
  { name: 'Accueil', href: '#' },
  { name: 'Boutique', href: '#boutique' },
  { name: 'Vision', href: '#about' },
  { name: 'Contact', href: '#footer' }
];

export default function NavMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  useEffect(() => {
    const main = document.querySelector('main');
    if (isMenuOpen) {
      // Body Scroll Lock: Prevent background movement
      document.body.style.overflow = 'hidden';
      if (main) {
        main.style.transition = 'filter 0.8s ease, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
        main.style.filter = 'blur(8px) brightness(0.7)';
        main.style.transform = 'scale(0.95)';
      }
    } else {
      // Restore scrolling
      document.body.style.overflow = 'unset';
      if (main) {
        main.style.filter = 'blur(0px) brightness(1)';
        main.style.transform = 'scale(1)';
      }
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const handleLinkClick = (href: string) => {
    setIsMenuOpen(false);
    setTimeout(() => {
      if (href === '#') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        window.location.hash = '';
        return;
      }
      const targetId = href.startsWith('#') ? href.substring(1) : null;
      if (targetId) {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        } else {
           window.location.hash = href;
        }
      }
    }, 600);
  };

  return (
    <>
      {/* Dynamic Toggle Button - Increased Z-Index */}
      <button 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="md:hidden relative z-[10000] flex items-center justify-center w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-black/5"
        aria-label="Menu"
      >
        <div className="flex flex-col gap-1.5 items-center justify-center">
          <motion.span 
            animate={{ 
              rotate: isMenuOpen ? 45 : 0, 
              y: isMenuOpen ? 7 : 0,
              backgroundColor: isMenuOpen ? "#000" : "#000"
            }}
            className="w-5 h-[2px] bg-black rounded-full origin-center"
          />
          <motion.span 
            animate={{ 
              opacity: isMenuOpen ? 0 : 1,
              x: isMenuOpen ? 10 : 0
            }}
            className="w-5 h-[2px] bg-black rounded-full"
          />
          <motion.span 
            animate={{ 
              rotate: isMenuOpen ? -45 : 0, 
              y: isMenuOpen ? -7 : 0,
              backgroundColor: isMenuOpen ? "#000" : "#000"
            }}
            className="w-5 h-[2px] bg-black rounded-full origin-center"
          />
        </div>
      </button>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Full Screen Backdrop - Z-Index 9999 & Position Fixed */}
            <motion.div 
              initial={{ clipPath: 'circle(0% at 90% 5%)' }}
              animate={{ clipPath: 'circle(150% at 90% 5%)' }}
              exit={{ clipPath: 'circle(0% at 90% 5%)' }}
              transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
              className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center md:hidden h-screen w-screen overflow-hidden"
            >
              {/* Decorative Brand Watermark */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] select-none pointer-events-none">
                <span className="text-[15rem] sm:text-[20rem] font-display font-black tracking-tighter">SWOOP</span>
              </div>

              <ul className="relative z-10 flex flex-col items-center space-y-6">
                {menuItems.map((item, i) => (
                  <li key={item.name} className="overflow-hidden">
                    <motion.a 
                      href={item.href}
                      initial={{ y: 80, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 40, opacity: 0 }}
                      transition={{ 
                        delay: 0.2 + (i * 0.1), 
                        duration: 0.6, 
                        ease: [0.16, 1, 0.3, 1] 
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        handleLinkClick(item.href);
                      }}
                      className="group block py-2 px-8"
                    >
                      <div className="relative overflow-hidden">
                        <span className="block text-4xl sm:text-5xl font-display font-black uppercase tracking-tighter text-black transition-transform duration-500 group-hover:-translate-y-full">
                          {item.name}
                        </span>
                        <span className="absolute top-0 left-0 block text-4xl sm:text-5xl font-display font-black uppercase tracking-tighter text-gold translate-y-full transition-transform duration-500 group-hover:translate-y-0">
                          {item.name}
                        </span>
                      </div>
                    </motion.a>
                  </li>
                ))}
              </ul>

              {/* Mobile Footer Info */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="absolute bottom-12 text-center"
              >
                <p className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-300 px-6">
                  Luxury Streetwear • Maroc
                </p>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Navigation */}
      <ul className="hidden md:flex flex-row items-center space-x-12 relative z-[60]">
        {menuItems.map((item) => (
          <li key={item.name}>
            <a 
              href={item.href}
              className="group relative text-[10px] font-black uppercase tracking-[0.5em] text-black hover:text-gold transition-colors"
              onClick={(e) => {
                if(item.href.startsWith('#')) {
                  e.preventDefault();
                  handleLinkClick(item.href);
                }
              }}
            >
              {item.name}
              <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-gold transition-all duration-500 group-hover:w-full"></span>
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
