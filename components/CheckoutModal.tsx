import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WHATSAPP_NUMBER } from '../constants';
import { MapPin, Phone, User, Send, Map } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  payload: {
    items: any[];
    totalPrice: number;
    productName: string;
    details: string;
  } | null;
  logLead: (orderId: string, productName: string, price: number, details: string, customerData: any) => Promise<void>;
  logEvent: (eventName: string, productName: string) => Promise<void>;
  setCart?: (cart: any[]) => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, payload, logLead, logEvent, setCart }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Phone Validation Logic for Morocco
  const validatePhone = (val: string) => {
    const clean = val.replace(/\D/g, '');
    if (clean.startsWith('05') || clean.startsWith('06') || clean.startsWith('07')) {
      return clean.length === 10;
    }
    if (clean.startsWith('212')) {
      const rest = clean.slice(3);
      return (rest.startsWith('5') || rest.startsWith('6') || rest.startsWith('7')) && rest.length === 9;
    }
    return false;
  };

  const isPhoneValid = validatePhone(phone);
  const isFormComplete = name.length > 2 && isPhoneValid && address.length > 5 && city.length > 2;

  const formatDisplayPhone = (val: string) => {
    const clean = val.replace(/\D/g, '');
    if (clean.startsWith('212')) {
      return `(+212) ${clean.slice(3)}`;
    }
    return val;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payload || !isFormComplete) return;

    setIsSubmitting(true);
    const orderId = `SWP-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      // Store address components in gps_coordinates field separated by |
      const fullAddress = `${address} | ${city} | ${zipCode}`;
      const customerData = {
        customer_name: name,
        customer_phone: phone,
        latitude: null,
        longitude: null,
        gps_coordinates: fullAddress,
        location_captured: false
      };

      await Promise.all([
        logLead(orderId, payload.productName, payload.totalPrice, payload.details, customerData),
        logEvent('WhatsApp Click', payload.productName)
      ]);

      let message = `Bonjour SWOOP, je suis ${name}. Je souhaite passer commande:\n\n`;
      message += `Order ID: ${orderId}\n`;
      message += `Contact: ${formatDisplayPhone(phone)}\n`;
      message += `Adresse: ${address}\n`;
      message += `Ville: ${city}\n`;
      message += `Code Postal: ${zipCode}\n`;

      message += `\nArticles:\n`;
      payload.items.forEach((item, index) => {
        message += `${index + 1}. ${item.name} [${item.size}/${item.color || 'N/A'}] x${item.quantity}\n`;
      });
      message += `\nTOTAL: ${payload.totalPrice} MAD\n\nMerci de confirmer !`;

      window.open(`https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=${encodeURIComponent(message)}`, '_blank');

      if (setCart) setCart([]);
      onClose();
    } catch (err) {
      alert("Erreur de synchronisation. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 md:p-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-2xl" />
        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-white w-full max-w-lg p-6 md:p-14 rounded-[30px] md:rounded-[50px] shadow-3xl overflow-hidden max-h-[90vh] overflow-y-auto">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="relative z-10">
            <div className="text-center mb-6 md:mb-12">
              <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.5em] text-gold mb-2 md:mb-4 block">Finalisation</span>
              <h2 className="text-2xl md:text-4xl font-display font-black uppercase tracking-tighter leading-none mb-2">INFOS LIVRAISON</h2>
              <p className="text-[8px] md:text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Complétez pour commander via WhatsApp</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div className="space-y-3 md:space-y-4">
                <div className="relative">
                  <User className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-zinc-300 w-3.5 h-3.5 md:w-4 md:h-4" />
                  <input type="text" placeholder="NOM COMPLET" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-zinc-50 border border-zinc-100 px-12 md:px-14 py-4 md:py-5 rounded-[20px] md:rounded-[25px] text-[10px] md:text-[11px] font-black uppercase tracking-widest outline-none focus:border-gold transition-all" />
                </div>

                <div className="relative">
                  <Phone className={`absolute left-5 md:left-6 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 ${phone && !isPhoneValid ? 'text-red-400' : 'text-zinc-300'}`} />
                  <input 
                    type="tel" 
                    placeholder="TÉLÉPHONE (EX: 0612345678)" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    required 
                    className={`w-full bg-zinc-50 border px-12 md:px-14 py-4 md:py-5 rounded-[20px] md:rounded-[25px] text-[10px] md:text-[11px] font-black uppercase tracking-widest outline-none transition-all ${phone && !isPhoneValid ? 'border-red-200 focus:border-red-400' : 'border-zinc-100 focus:border-gold'}`} 
                  />
                  {phone && !isPhoneValid && (
                    <span className="absolute right-5 md:right-6 top-1/2 -translate-y-1/2 text-[7px] md:text-[8px] font-black text-red-400 uppercase tracking-widest">Invalide</span>
                  )}
                </div>

                <div className="space-y-3 md:space-y-4">
                  <div className="relative">
                    <MapPin className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-zinc-300 w-3.5 h-3.5 md:w-4 md:h-4" />
                    <input 
                      type="text" 
                      placeholder="ADRESSE (RUE, QUARTIER...)" 
                      value={address} 
                      onChange={(e) => setAddress(e.target.value)} 
                      required 
                      className="w-full bg-zinc-50 border border-zinc-100 px-12 md:px-14 py-4 md:py-5 rounded-[20px] md:rounded-[25px] text-[10px] md:text-[11px] font-black uppercase tracking-widest outline-none focus:border-gold transition-all"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div className="relative">
                      <Map className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-zinc-300 w-3.5 h-3.5 md:w-4 md:h-4" />
                      <input 
                        type="text" 
                        placeholder="VILLE" 
                        value={city} 
                        onChange={(e) => setCity(e.target.value)} 
                        required 
                        className="w-full bg-zinc-50 border border-zinc-100 px-12 md:px-14 py-4 md:py-5 rounded-[20px] md:rounded-[25px] text-[10px] md:text-[11px] font-black uppercase tracking-widest outline-none focus:border-gold transition-all"
                      />
                    </div>
                    <div className="relative">
                      <MapPin className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-zinc-300 w-3.5 h-3.5 md:w-4 md:h-4" />
                      <input 
                        type="text" 
                        placeholder="CODE POSTAL" 
                        value={zipCode} 
                        onChange={(e) => setZipCode(e.target.value)} 
                        required 
                        className="w-full bg-zinc-50 border border-zinc-100 px-12 md:px-14 py-4 md:py-5 rounded-[20px] md:rounded-[25px] text-[10px] md:text-[11px] font-black uppercase tracking-widest outline-none focus:border-gold transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 md:pt-4">
                <button type="submit" disabled={!isFormComplete || isSubmitting} className="group relative w-full bg-black text-white font-black uppercase tracking-[0.4em] text-[10px] md:text-[11px] py-6 md:py-8 rounded-[25px] md:rounded-[30px] shadow-2xl transition-all hover:bg-gold hover:text-black disabled:opacity-30 disabled:grayscale overflow-hidden">
                  <div className="relative z-10 flex items-center justify-center gap-3 md:gap-4">
                    {isSubmitting ? <span className="animate-pulse">SYNCHRONISATION...</span> : <><span>Commander sur WhatsApp</span><Send className="w-3.5 h-3.5 md:w-4 md:h-4" /></>}
                  </div>
                </button>
              </div>

              <button type="button" onClick={onClose} className="w-full text-[8px] md:text-[9px] font-black text-zinc-300 uppercase tracking-widest hover:text-black transition-colors">Annuler</button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CheckoutModal;