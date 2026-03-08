
import React from 'react';
import { MorphingText } from './ui/morphing-text';

const Hero: React.FC = () => {
  const handleBoutiqueClick = () => {
    window.location.hash = '#boutique';
  };

  const morphingWords = [
    "ÉLÉGANCE",
    "AUDACE",
    "LUXE",
    "URBAIN",
    "SWOOP",
    "EXCLUSIF"
  ];

  return (
    <section className="relative h-[100vh] md:h-[120vh] w-full flex flex-col justify-center items-start bg-white-luxury overflow-hidden">
      {/* Video Background - Crystal Clear */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="w-full h-full object-cover scale-100 brightness-[1.05] contrast-[1.02]"
        >
          <source src="https://github.com/yahyabmk01/Aymen-Clothes/raw/main/swoop%20hero%202.webm" type="video/webm" />
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="relative z-10 w-full max-w-7xl px-6 md:px-24 text-left">
        <div className="p-0">
          <div className="mb-4 overflow-hidden">
             <h2 className="animate-reveal text-black text-[9px] md:text-[10px] font-light tracking-[1em] uppercase opacity-70">
               VOLUME 001 • MAROC
             </h2>
          </div>
          
          <div className="mb-10 w-full">
            <MorphingText 
              texts={morphingWords} 
              className="text-black-matte text-5xl md:text-7xl lg:text-[7rem] uppercase tracking-tighter" 
            />
          </div>

          <div className="animate-fade-in-up flex flex-col items-start [animation-delay:800ms]">
            <p className="text-black-matte text-[10px] md:text-[11px] max-w-xs uppercase tracking-[0.4em] mb-12 font-medium leading-relaxed opacity-60">
              ÉDITION LIMITÉE. CONÇUE POUR L'IMPACT.<br/>
              L'ART DE LA RUE REDÉFINI.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto">
              {/* Primary Boutique Button with Enhanced Blur Effect */}
              <button 
                onClick={handleBoutiqueClick}
                className="group relative px-10 md:px-16 py-7 bg-white/5 backdrop-blur-[40px] border border-white/30 text-black font-black uppercase tracking-[0.4em] text-[10px] transition-all duration-700 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:bg-black hover:text-white hover:backdrop-blur-none hover:border-black"
                style={{ WebkitBackdropFilter: 'blur(40px)' }}
              >
                <span className="relative z-10">Explore la boutique</span>
                <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)]"></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-24 right-12 hidden md:flex items-center gap-6 animate-pulse z-20">
        <span className="text-[8px] font-black uppercase tracking-[0.5em] text-black/40">Scroll</span>
        <div className="w-12 h-[1px] bg-black/20"></div>
      </div>

      <div className="absolute bottom-0 w-full border-t border-zinc-200/50 bg-white/30 backdrop-blur-md py-4 overflow-hidden z-20">
        <div className="flex animate-ticker whitespace-nowrap">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center mx-12">
              <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-black/30">
                LIMITED RUN • PRE-ORDER OPEN • LUXURY FINISH • SWOOP® CLOTHING
              </span>
              <span className="mx-12 w-1 h-1 bg-gold rounded-full"></span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
