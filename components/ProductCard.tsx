
import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: any;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const handleClick = () => {
    window.location.hash = `#product-${product.id}`;
    window.scrollTo(0, 0);
  };

  // Logic: Show SALE badge only if old_price exists and is greater than current price
  const hasValidDiscount = product.old_price && Number(product.old_price) > Number(product.price);
  
  // Safely extract the first image from the new array format
  let displayImage = "https://placehold.co/800x1000?text=No+Image";
  if (product.image_url) {
    if (Array.isArray(product.image_url) && product.image_url.length > 0) {
      displayImage = product.image_url[0];
    } else if (typeof product.image_url === 'string') {
      displayImage = product.image_url;
    }
  } else if (product.image) {
    displayImage = product.image;
  }

  return (
    <div 
      onClick={handleClick}
      className="bg-white group cursor-pointer border-r border-b border-zinc-200 p-8 flex flex-col items-center justify-between transition-all duration-500 hover:bg-zinc-50 min-h-[500px]"
    >
      <div className="w-full flex justify-between items-start mb-4">
        {hasValidDiscount ? (
          <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-red-500 text-white">
            SALE
          </span>
        ) : (
          <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 text-gold bg-gold/10 border border-gold/20">
            NEW DROP
          </span>
        )}
        <div className="text-zinc-300 group-hover:text-black transition-colors">
          <i className="fa-solid fa-arrow-right-long text-xl"></i>
        </div>
      </div>

      <div className="relative w-full aspect-square flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gold/5 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        <img 
          src={displayImage} 
          alt={product.name}
          className="w-full h-full object-contain filter group-hover:scale-110 transition-all duration-700 z-10"
          onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/800x1000?text=Image+Error"; }}
        />
      </div>

      <div className="text-center mt-8 space-y-2 z-10">
        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-black group-hover:text-gold transition-colors">
          {product.name}
        </h3>
        <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">{product.category}</p>
        <div className="flex flex-col items-center justify-center gap-1 mt-4">
          <span className="text-sm text-black font-black italic underline decoration-gold decoration-2 underline-offset-4">{product.price} MAD</span>
          {hasValidDiscount && (
            <span className="text-[10px] text-zinc-300 line-through font-bold">
              {product.old_price} MAD
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
