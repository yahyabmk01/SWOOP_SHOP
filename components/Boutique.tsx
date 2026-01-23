import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { supabase } from '../lib/supabase';

const CATEGORIES = ['All', 'Hoodies', 'Pants', 'T-Shirts', 'Sneakers', 'Accessories', 'Packs'];

const Boutique: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false });

      if (!error && data) {
        setDbProducts(data);
      }
      setLoading(false);
    }
    loadProducts();
  }, []);

  const filteredProducts = dbProducts.filter(p => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pt-24 md:pt-40 bg-white-luxury min-h-screen">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
          <div className="flex-1">
            <h1 className="text-5xl md:text-8xl font-display font-black text-black uppercase tracking-tighter leading-none mb-4">
              BOUTIQUE<span className="text-gold">.</span>
            </h1>
            <p className="text-zinc-400 text-[10px] md:text-xs font-black uppercase tracking-[0.5em]">
              {loading ? 'CHARGEMENT...' : `${filteredProducts.length} ARTICLES DISPONIBLES`}
            </p>
          </div>

          <div className="w-full md:max-w-md">
            <div className="relative group">
              <i className="fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-gold transition-colors text-xs"></i>
              <input 
                type="text" 
                placeholder="RECHERCHER UN MODÈLE..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-zinc-200 px-14 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none focus:border-black transition-all shadow-sm"
              />
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 md:gap-3 mb-12 overflow-x-auto pb-4 no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 text-[9px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${
                activeCategory === cat 
                ? 'bg-black border-black text-white' 
                : 'bg-white border-zinc-100 text-zinc-400 hover:border-black'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 border-t border-l border-zinc-200">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
          
          {!loading && filteredProducts.length === 0 && (
            <div className="col-span-full py-40 text-center border-b border-r border-zinc-200 bg-white">
              <i className="fa-solid fa-box-open text-zinc-100 text-6xl mb-6"></i>
              <p className="text-zinc-400 uppercase tracking-[0.5em] text-[10px] font-black">Aucun drop ne correspond à votre recherche.</p>
              <button 
                onClick={() => {setSearchTerm(''); setActiveCategory('All');}} 
                className="mt-8 text-[9px] font-black uppercase tracking-widest underline decoration-gold underline-offset-8"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="py-20"></div>
    </div>
  );
};

export default Boutique;