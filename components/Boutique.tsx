
import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { supabase } from '../lib/supabase';

const CATEGORIES = ['All', 'Hoodies', 'Pants', 'T-Shirts', 'Sneakers', 'Accessories', 'Bundles'];

const Boutique: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');
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

  const filteredProducts = activeCategory === 'All' 
    ? dbProducts 
    : dbProducts.filter(p => p.category === activeCategory);

  return (
    <div className="pt-24 md:pt-40 bg-white-luxury min-h-screen">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <h1 className="text-5xl md:text-8xl font-display font-black text-black uppercase tracking-tighter leading-none mb-4">
              BOUTIQUE<span className="text-gold">.</span>
            </h1>
            <p className="text-zinc-400 text-[10px] md:text-xs font-black uppercase tracking-[0.5em]">
              {loading ? 'CHARGEMENT...' : `${filteredProducts.length} ARTICLES DISPONIBLES`}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 md:gap-4">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all border ${
                  activeCategory === cat 
                  ? 'bg-black border-black text-white' 
                  : 'bg-transparent border-zinc-200 text-zinc-500 hover:border-black'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 border-t border-l border-zinc-200">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
          
          {!loading && filteredProducts.length === 0 && (
            <div className="col-span-full py-40 text-center border-b border-r border-zinc-200">
              <p className="text-zinc-400 uppercase tracking-[0.5em] text-xs">Aucun produit trouvé.</p>
            </div>
          )}
        </div>
      </div>
      <div className="py-20"></div>
    </div>
  );
};

export default Boutique;
