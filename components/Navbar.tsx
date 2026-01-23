import React, { useState, useEffect } from 'react';
import NavMenu from './ui/menu-hover-effects';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ cartCount, onOpenCart }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-white/90 backdrop-blur-md border-b border-zinc-200 py-2' : 'bg-transparent py-4 md:py-6'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo Section */}
        <div className="flex items-center cursor-pointer z-[60]" onClick={() => window.location.hash = '#'}>
          <img 
            src="https://raw.githubusercontent.com/yahyabmk01/Aymen-Clothes/main/Image_202601181051-removebg-preview.png" 
            alt="SWOOP Logo" 
            className="h-8 md:h-10 w-auto" 
          />
        </div>
        
        {/* Integrated Hover Menu Component */}
        <div className="flex-1 flex justify-center">
          <NavMenu />
        </div>

        {/* Action Icons */}
        <div className="flex items-center space-x-4 md:space-x-6 z-[60]">
          <button className="text-black hover:text-gold transition-colors hidden sm:block">
            <i className="fa-solid fa-magnifying-glass text-sm"></i>
          </button>
          <button 
            onClick={onOpenCart}
            className="text-black hover:text-gold transition-colors relative"
          >
            <i className="fa-solid fa-cart-shopping text-sm"></i>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-black text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;