
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { WHATSAPP_NUMBER } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductDetailProps {
  product: any; 
  onBack: () => void;
  onAddToCart: (item: any) => void;
  logEvent: (eventName: string, productName: string) => void;
  logLead: (orderId: string, productName: string, price: number, details: string, customerData?: any) => void;
  onCheckout: (payload: any) => void;
}

interface SelectionSlot {
  id: number;
  size: string | null;
  color: string | null;
}

const COLOR_MAP: Record<string, string> = {
  'BLACK': '#000000',
  'WHITE': '#FFFFFF',
  'RED': '#FF3B30',
  'BLUE': '#0038FF',
  'GREEN': '#34C759',
  'NAVY': '#323264',
  'GREY': '#A2A2A2',
  'BEIGE': '#F5F5DC',
  'GOLD': '#FFD700',
  'SILVER': '#C0C0C0',
  'PINK': '#FFD1DC',
  'ORANGE': '#FF9500',
  'YELLOW': '#FFFF00',
  'PURPLE': '#AF52DE',
  'BROWN': '#A52A2A'
};

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onBack, onAddToCart, logEvent, logLead, onCheckout }) => {
  const imageUrls = Array.isArray(product.image_url) 
    ? (product.image_url.length > 0 ? product.image_url : ["https://placehold.co/800x1000?text=No+Image"])
    : (product.image_url ? [product.image_url] : (product.image ? [product.image] : ["https://placehold.co/800x1000?text=No+Image"]));

  const [activeImage, setActiveImage] = useState(imageUrls[0]);
  const [quantity, setQuantity] = useState<number>(1);
  const [slots, setSlots] = useState<SelectionSlot[]>([{ id: 1, size: null, color: null }]);
  const [activeSlotIndex, setActiveSlotIndex] = useState<number>(0);
  
  const sizes = product.sizes || ['S', 'M', 'L', 'XL'];
  const colors = product.colors || []; // Default to empty array if null
  const hasValidDiscount = product.old_price && Number(product.old_price) > Number(product.price);

  useEffect(() => {
    if (imageUrls.length > 0) setActiveImage(imageUrls[0]);
  }, [product]);

  useEffect(() => {
    setSlots(prev => {
      if (quantity > prev.length) {
        const newSlots = [...prev];
        for (let i = prev.length; i < quantity; i++) {
          newSlots.push({ id: Date.now() + i, size: null, color: null });
        }
        return newSlots;
      } else {
        return prev.slice(0, quantity);
      }
    });
    if (activeSlotIndex >= quantity) setActiveSlotIndex(quantity - 1);
  }, [quantity]);

  const updateSlot = (index: number, field: 'size' | 'color', value: string) => {
    const newSlots = [...slots];
    newSlots[index][field] = value;
    setSlots(newSlots);
  };

  const isComplete = slots.every(s => s.size && (colors.length > 0 ? s.color : true));

  const handleOrderNow = async () => {
    if (!isComplete) return;
    
    const totalPrice = product.price * quantity;
    // RESTORED FULL DETAIL FORMAT: Item [N]: [Product Name] | Size: [Size] | Color: [Color] | Qty: [Quantity]
    const details = slots.map((s, i) => 
      `Item ${i+1}: ${product.name} | Size: ${s.size} | Color: ${s.color || 'N/A'} | Qty: 1`
    ).join(' || ');
    
    onCheckout({
      items: slots.map(s => ({
        ...product,
        size: s.size,
        color: s.color,
        quantity: 1
      })),
      totalPrice,
      productName: product.name,
      details
    });
  };

  const handleAddToCart = () => {
    if (!isComplete) return;

    logEvent('Add to Cart', product.name);

    slots.forEach(slot => {
      onAddToCart({
        cartId: `${product.id}-${slot.size}-${slot.color || 'none'}-${slot.id}`,
        id: product.id,
        name: product.name,
        price: product.price,
        image: imageUrls[0],
        size: slot.size,
        color: slot.color,
        quantity: 1
      });
    });
  };

  const getSizeCount = (size: string) => slots.filter(s => s.size === size).length;

  return (
    <div className="pt-24 md:pt-40 pb-20 bg-white min-h-screen">
      <div className="container mx-auto px-6">
        <button 
          onClick={onBack}
          className="group flex items-center gap-4 text-zinc-400 hover:text-black transition-colors uppercase tracking-[0.4em] text-[10px] font-black mb-16"
        >
          <i className="fa-solid fa-arrow-left-long group-hover:-translate-x-2 transition-transform"></i> Retour à la collection
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 items-start">
          <div className="space-y-6 md:sticky md:top-40">
            <div 
              className="aspect-[9/16] bg-zinc-50 border border-zinc-200 flex items-center justify-center overflow-hidden relative group"
            >
               <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
                  <span className="bg-black text-white text-[9px] font-black uppercase px-3 py-1 tracking-widest">Limited Drop</span>
                  {hasValidDiscount && (
                    <span className="bg-red-500 text-white text-[9px] font-black uppercase px-3 py-1 tracking-widest">SALE</span>
                  )}
               </div>
               <img 
                 src={activeImage} 
                 alt={product.name} 
                 className="w-full h-full object-cover transition-all duration-700" 
               />
            </div>

            <div className="flex flex-wrap gap-3 mt-4">
              {imageUrls.map((url, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImage(url)} 
                  className={`w-16 md:w-20 aspect-[9/16] border-2 transition-all duration-300 overflow-hidden ${activeImage === url ? 'border-black' : 'border-zinc-100 opacity-50 hover:opacity-100'}`}
                >
                  <img src={url} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="mb-12">
              <span className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.5em] mb-4 block">Product Selection</span>
              <h1 className="text-5xl md:text-7xl font-display font-black text-black uppercase tracking-tighter leading-[0.85] mb-8">{product.name}</h1>
              <div className="flex items-center gap-6">
                <span className="text-3xl font-display font-black text-black italic">{product.price} MAD</span>
                {hasValidDiscount && (
                  <span className="text-xl font-display font-black text-zinc-300 line-through">{product.old_price} MAD</span>
                )}
              </div>
            </div>

            <div className="space-y-12 mb-12">
              <div>
                <span className="text-black text-[10px] font-black uppercase tracking-[0.3em] block underline decoration-gold underline-offset-8 mb-6">1. Quantité Totale</span>
                <div className="flex items-center gap-6">
                   <div className="flex items-center border border-zinc-200 bg-zinc-50">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-14 h-14 flex items-center justify-center text-zinc-400 hover:text-black hover:bg-white transition-colors">-</button>
                      <span className="w-14 h-14 flex items-center justify-center font-black text-lg">{quantity}</span>
                      <button onClick={() => setQuantity(quantity + 1)} className="w-14 h-14 flex items-center justify-center text-zinc-400 hover:text-black hover:bg-white transition-colors">+</button>
                   </div>
                </div>
              </div>

              <div className="space-y-8">
                <span className="text-black text-[10px] font-black uppercase tracking-[0.3em] block underline decoration-gold underline-offset-8 mb-6">2. Configuration des pièces</span>
                
                <div className="flex flex-wrap gap-2 mb-8">
                  {slots.map((slot, idx) => (
                    <button 
                      key={slot.id}
                      onClick={() => setActiveSlotIndex(idx)}
                      className={`px-4 py-3 text-[9px] font-black uppercase tracking-widest border transition-all ${activeSlotIndex === idx ? 'bg-black text-white border-black' : 'bg-white text-zinc-400 border-zinc-100 hover:border-black'}`}
                    >
                      Article {idx + 1} {slot.size && (colors.length > 0 ? slot.color : true) ? '✓' : ''}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div 
                    key={activeSlotIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-8 bg-zinc-50 border border-zinc-100 space-y-10"
                  >
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4 block">Choisir Taille (Article {activeSlotIndex + 1})</span>
                      <div className="flex flex-wrap gap-2">
                        {sizes.map((size: string) => {
                          const count = getSizeCount(size);
                          return (
                            <button 
                              key={size} 
                              onClick={() => updateSlot(activeSlotIndex, 'size', size)} 
                              className={`relative min-w-[60px] h-14 flex items-center justify-center text-[10px] font-black transition-all border ${slots[activeSlotIndex].size === size ? 'bg-black border-black text-white' : 'bg-white border-zinc-200 text-zinc-400 hover:border-black'}`}
                            >
                              {size}
                              {count > 0 && (
                                <span className="absolute -top-2 -right-2 w-5 h-5 bg-gold text-black rounded-full flex items-center justify-center text-[8px] font-black border-2 border-white">
                                  {count}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {colors.length > 0 && (
                      <div className={slots[activeSlotIndex].size ? 'opacity-100' : 'opacity-30 pointer-events-none'}>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4 block">Choisir Couleur</span>
                        <div className="flex gap-4">
                          {colors.map((colorName: string) => {
                            const upperColor = colorName.toUpperCase();
                            const bgColor = COLOR_MAP[upperColor] || colorName;
                            return (
                              <button 
                                key={colorName} 
                                onClick={() => updateSlot(activeSlotIndex, 'color', colorName)} 
                                className={`w-12 h-12 rounded-full border-4 transition-all ${slots[activeSlotIndex].color === colorName ? 'border-black scale-110' : 'border-transparent shadow-sm'}`} 
                                style={{ backgroundColor: bgColor }}
                                title={colorName}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <div className="flex flex-col gap-4 mt-auto">
              <div className="mb-4 flex justify-between items-center px-2">
                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Selection</span>
                 <span className="text-xl font-display font-black">{product.price * quantity} MAD</span>
              </div>

              <button 
                onClick={handleAddToCart} 
                disabled={!isComplete}
                className={`group relative w-full border-2 border-black font-black uppercase tracking-[0.4em] text-[10px] py-7 transition-all duration-500 overflow-hidden ${isComplete ? 'text-black hover:bg-black hover:text-white' : 'opacity-30 grayscale cursor-not-allowed'}`}
              >
                <span className="relative z-10">{isComplete ? 'Ajouter les articles au panier' : 'Configuration Incomplète'}</span>
                {isComplete && <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>}
              </button>

              <button 
                onClick={handleOrderNow} 
                disabled={!isComplete}
                className={`group relative w-full bg-black text-white font-black uppercase tracking-[0.4em] text-[10px] py-7 flex items-center justify-center gap-4 shadow-xl transition-all duration-500 ${isComplete ? 'hover:bg-gold' : 'opacity-30 grayscale cursor-not-allowed'}`}
              >
                <i className="fa-brands fa-whatsapp text-xl"></i>
                <span className="relative z-10">Commander via WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
