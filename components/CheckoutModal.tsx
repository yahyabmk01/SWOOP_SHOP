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
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [manualAddress, setManualAddress] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showManualAddress, setShowManualAddress] = useState(false);
  
  // Fix: Use ReturnType<typeof setTimeout> to safely type the timeout reference in browser environments
  const locatingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  const isFormComplete = name.length > 2 && isPhoneValid && (lat !== null || manualAddress.length > 5);

  const formatDisplayPhone = (val: string) => {
    const clean = val.replace(/\D/g, '');
    if (clean.startsWith('212')) {
      return `(+212) ${clean.slice(3)}`;
    }
    return val;
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée.");
      setShowManualAddress(true);
      return;
    }

    setIsLocating(true);
    
    // Set 10s timeout for GPS fallback
    locatingTimeoutRef.current = setTimeout(() => {
      if (isLocating) {
        setIsLocating(false);
        setShowManualAddress(true);
      }
    }, 10000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (locatingTimeoutRef.current) clearTimeout(locatingTimeoutRef.current);
        const { latitude, longitude } = position.coords;
        setLat(latitude);
        setLng(longitude);
        setManualAddress(''); // Clear manual if GPS works
        setIsLocating(false);
      },
      (error) => {
        if (locatingTimeoutRef.current) clearTimeout(locatingTimeoutRef.current);
        console.error("GPS Error:", error);
        setIsLocating(false);
        setShowManualAddress(true);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payload || !isFormComplete) return;

    setIsSubmitting(true);
    const orderId = `SWP-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const gpsCoordinates = lat && lng ? `${lat}, ${lng}` : manualAddress;
      const customerData = {
        customer_name: name,
        customer_phone: phone,
        latitude: lat,
        longitude: lng,
        gps_coordinates: gpsCoordinates,
        location_captured: true
      };

      await Promise.all([
        logLead(orderId, payload.productName, payload.totalPrice, payload.details, customerData),
        logEvent('WhatsApp Click', payload.productName)
      ]);

      let message = `Bonjour SWOOP, je suis ${name}. Je souhaite passer commande:\n\n`;
      message += `Order ID: ${orderId}\n`;
      message += `Contact: ${formatDisplayPhone(phone)}\n`;
      
      if (lat && lng) {
        message += `Location: https://www.google.com/maps?q=${lat},${lng}\n`;
      } else {
        message += `Adresse: ${manualAddress}\n`;
      }

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
      <div className="fixed inset-0 z-[100000] flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-2xl" />
        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-white w-full max-w-lg p-10 md:p-14 rounded-[50px] shadow-3xl overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="relative z-10">
            <div className="text-center mb-12">
              <span className="text-[9px] font-black uppercase tracking-[0.5em] text-gold mb-4 block">Finalisation</span>
              <h2 className="text-4xl font-display font-black uppercase tracking-tighter leading-none mb-2">INFOS LIVRAISON</h2>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Complétez pour commander via WhatsApp</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300 w-4 h-4" />
                  <input type="text" placeholder="NOM COMPLET" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-zinc-50 border border-zinc-100 px-14 py-5 rounded-[25px] text-[11px] font-black uppercase tracking-widest outline-none focus:border-gold transition-all" />
                </div>

                <div className="relative">
                  <Phone className={`absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 ${phone && !isPhoneValid ? 'text-red-400' : 'text-zinc-300'}`} />
                  <input 
                    type="tel" 
                    placeholder="TÉLÉPHONE (EX: 0612345678)" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    required 
                    className={`w-full bg-zinc-50 border px-14 py-5 rounded-[25px] text-[11px] font-black uppercase tracking-widest outline-none transition-all ${phone && !isPhoneValid ? 'border-red-200 focus:border-red-400' : 'border-zinc-100 focus:border-gold'}`} 
                  />
                  {phone && !isPhoneValid && (
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[8px] font-black text-red-400 uppercase tracking-widest">Invalide</span>
                  )}
                </div>

                {!showManualAddress ? (
                  <button type="button" onClick={handleGetLocation} disabled={isLocating} className={`w-full flex items-center justify-between px-8 py-5 rounded-[25px] border-2 transition-all ${lat ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-dashed border-zinc-200 text-zinc-400 hover:border-black hover:text-black'}`}>
                    <div className="flex items-center gap-4">
                      <MapPin className={`w-4 h-4 ${isLocating ? 'animate-bounce' : ''}`} />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {isLocating ? 'Localisation...' : lat ? 'Position Enregistrée' : 'Partager Position GPS'}
                      </span>
                    </div>
                    {lat && <i className="fa-solid fa-check"></i>}
                  </button>
                ) : (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
                    <div className="relative">
                      <Map className="absolute left-6 top-6 text-zinc-300 w-4 h-4" />
                      <textarea 
                        placeholder="ADRESSE DE LIVRAISON COMPLÈTE (VILLE, QUARTIER...)" 
                        value={manualAddress} 
                        onChange={(e) => setManualAddress(e.target.value)} 
                        required 
                        className="w-full bg-zinc-50 border border-zinc-100 px-14 py-5 rounded-[25px] text-[11px] font-black uppercase tracking-widest outline-none focus:border-gold transition-all min-h-[120px] resize-none"
                      />
                    </div>
                    <button type="button" onClick={() => { setShowManualAddress(false); setLat(null); setLng(null); }} className="text-[8px] font-black text-gold uppercase tracking-widest ml-4 hover:underline">Réessayer le GPS</button>
                  </motion.div>
                )}
              </div>

              <div className="pt-4">
                <button type="submit" disabled={!isFormComplete || isSubmitting} className="group relative w-full bg-black text-white font-black uppercase tracking-[0.4em] text-[11px] py-8 rounded-[30px] shadow-2xl transition-all hover:bg-gold hover:text-black disabled:opacity-30 disabled:grayscale overflow-hidden">
                  <div className="relative z-10 flex items-center justify-center gap-4">
                    {isSubmitting ? <span className="animate-pulse">SYNCHRONISATION...</span> : <><span>Commander sur WhatsApp</span><Send className="w-4 h-4" /></>}
                  </div>
                </button>
              </div>

              <button type="button" onClick={onClose} className="w-full text-[9px] font-black text-zinc-300 uppercase tracking-widest hover:text-black transition-colors">Annuler</button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CheckoutModal;