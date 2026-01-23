
import React from 'react';
import { FEATURES } from '../constants';

const AboutSection: React.FC = () => {
  return (
    <section id="about" className="relative py-32 md:py-64 bg-white-luxury overflow-hidden border-t border-zinc-200">
      {/* Background Decorative Text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.015] select-none pointer-events-none">
        <span className="text-[25rem] md:text-[50rem] font-display font-black tracking-tighter leading-none">SWOOP</span>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-32 items-center">
          
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="inline-block px-5 py-2 bg-black text-white text-[9px] font-black uppercase tracking-[0.5em] mb-12 shadow-2xl">
              The Archive • Vol 01
            </div>
            
            <h3 className="text-4xl md:text-8xl font-display font-black text-black uppercase tracking-tighter mb-10 leading-[0.85]">
              LA VISION DU <br />
              <span className="text-gold italic">MOUVEMENT.</span>
            </h3>
            
            <p className="text-zinc-600 text-base md:text-2xl leading-relaxed mb-20 max-w-xl font-medium opacity-80">
              SWOOP n'est pas seulement une marque, c'est une trajectoire. Nous capturons l'essence de la vitesse, de l'audace et de l'élégance brute. Chaque pièce est conçue pour ceux qui ne s'arrêtent jamais.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-16">
              {FEATURES.map((feature, idx) => (
                <div key={feature.id} className="group flex flex-col items-start">
                  <div className="w-14 h-14 bg-white border border-zinc-200 flex items-center justify-center mb-8 group-hover:border-gold group-hover:bg-black group-hover:text-white transition-all duration-500 shadow-sm rounded-2xl">
                    <i className={`fa-solid ${feature.icon} text-lg transition-colors`}></i>
                  </div>
                  <h4 className="text-black font-black uppercase tracking-widest text-[11px] md:text-sm mb-4">
                    <span className="text-gold mr-3">/ 0{idx + 1}</span>
                    {feature.title}
                  </h4>
                  <p className="text-zinc-500 text-[10px] leading-relaxed uppercase tracking-wider font-semibold">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 relative order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-2xl">
              {/* Outer Glow / Space */}
              <div className="absolute -inset-10 bg-gold/5 blur-[100px] rounded-full opacity-50"></div>
              
              {/* Main Image Element - Larger, Rounded, High Contrast */}
              <div className="relative group p-4 md:p-8 bg-white border border-zinc-100 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] rounded-[3rem]">
                <div className="overflow-hidden aspect-[4/5] relative bg-zinc-200 rounded-[2.5rem]">
                  <img 
                    src="https://raw.githubusercontent.com/yahyabmk01/Aymen-Clothes/main/Change_the_outfit_2k_202601212021.jpeg" 
                    alt="SWOOP Vision Concept"
                    className="w-full h-full object-cover brightness-105 contrast-105 scale-100 group-hover:scale-105 transition-transform duration-[3s] ease-out"
                  />
                  
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60"></div>
                </div>
                
                {/* Floating label with Premium Styling */}
                <div className="absolute -bottom-8 -left-8 bg-black text-white p-8 md:p-12 shadow-3xl z-20 rounded-[2rem] border border-white/10 backdrop-blur-md">
                   <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-[2px] bg-gold"></div>
                      <span className="text-gold text-[9px] font-black uppercase tracking-[0.5em]">Live Vision</span>
                   </div>
                   <p className="text-2xl md:text-4xl font-display font-black uppercase tracking-tighter leading-none">
                     VITESSE & <br/> CARACTÈRE
                   </p>
                </div>
              </div>
              
              {/* Vertical Decorative Bar */}
              <div className="hidden xl:flex absolute -right-16 top-1/2 -translate-y-1/2 flex-col items-center gap-6">
                 <div className="w-[1px] h-48 bg-gradient-to-b from-transparent via-zinc-200 to-transparent"></div>
                 <p className="rotate-90 text-[10px] font-black uppercase tracking-[1.5em] text-zinc-300 whitespace-nowrap">
                   AUTHENTIC LUXURY
                 </p>
                 <div className="w-[1px] h-48 bg-gradient-to-b from-transparent via-zinc-200 to-transparent"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutSection;
