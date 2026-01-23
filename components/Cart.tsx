
import React from 'react';
import { WHATSAPP_NUMBER } from '../constants';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: any[];
  onRemove: (cartId: string) => void;
  setCart?: (cart: any[]) => void;
  onCheckout?: (payload: any) => void;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose, items, onRemove, setCart, onCheckout }) => {
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleFinalizeOrder = () => {
    if (items.length === 0 || !onCheckout) return;

    // Construct multi-product summary string for DB product_name field
    const productSummary = items.map(item => `${item.name} [${item.size}/${item.color || 'N/A'}]`).join(', ');
    
    // RESTORED FULL DETAIL FORMAT for the 'details' column: 
    // Item [Number]: [Product Name] | Size: [Size] | Color: [Color] | Qty: [Quantity]
    const details = items.map((item, index) => 
      `Item ${index + 1}: ${item.name} | Size: ${item.size} | Color: ${item.color || 'N/A'} | Qty: ${item.quantity}`
    ).join(' || ');

    onCheckout({
      items,
      totalPrice,
      productName: productSummary,
      details
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-reveal">
        <div className="p-8 border-b flex justify-between items-center">
          <h2 className="text-xl font-display font-black uppercase tracking-tighter">Votre Panier <span className="text-gold">({items.length})</span></h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-black transition-colors"><i className="fa-solid fa-xmark text-xl"></i></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <i className="fa-solid fa-cart-shopping text-zinc-100 text-8xl"></i>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.5em]">Votre panier est vide</p>
              <button onClick={onClose} className="text-[10px] font-black underline underline-offset-4 uppercase tracking-widest">Continuer vos achats</button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.cartId} className="flex gap-6 items-start group">
                <div className="w-24 aspect-[3/4] bg-zinc-50 border overflow-hidden">
                  <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                </div>
                <div className="flex-1 flex flex-col">
                  <h3 className="text-[11px] font-black uppercase tracking-widest mb-1">{item.name}</h3>
                  <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mb-3">Taille: {item.size} • Couleur: {item.color || 'N/A'}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold italic">{item.price} MAD <span className="text-zinc-300 text-[10px] normal-case tracking-normal">x {item.quantity}</span></span>
                    <button onClick={() => onRemove(item.cartId)} className="text-red-400 hover:text-red-600 text-[9px] font-black uppercase tracking-widest">Supprimer</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-8 bg-zinc-50 border-t space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Estimation</span>
              <span className="text-2xl font-display font-black italic">{totalPrice} MAD</span>
            </div>
            <button 
              onClick={handleFinalizeOrder}
              className="w-full bg-black text-white font-black uppercase tracking-[0.4em] text-[10px] py-7 hover:bg-gold transition-all duration-500 flex items-center justify-center gap-4 shadow-xl"
            >
              <i className="fa-brands fa-whatsapp text-xl"></i>
              <span>Finaliser sur WhatsApp</span>
            </button>
            <p className="text-[8px] text-center text-zinc-400 uppercase tracking-widest">Paiement à la livraison partout au Maroc</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
