import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import ProductDetail from './components/ProductDetail';
import Boutique from './components/Boutique';
import AboutSection from './components/AboutSection';
import Footer from './components/Footer';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import Cart from './components/Cart';
import CheckoutModal from './components/CheckoutModal';
import { Product } from './types';
import { supabase } from './lib/supabase';
import { AnimatePresence, motion } from "framer-motion";
import { CustomLoader } from './components/ui/LiquidGlass';
import PageTransition from './components/ui/PageTransition';

interface ConfirmationState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  confirmLabel?: string;
}

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'boutique' | 'product' | 'admin'>('home');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [session, setSession] = useState<any>(null);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [processing, setProcessing] = useState(false);
  const [confirmModal, setConfirmModal] = useState<ConfirmationState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Checkout State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutPayload, setCheckoutPayload] = useState<{
    items: any[];
    totalPrice: number;
    productName: string;
    details: string;
  } | null>(null);

  const triggerConfirm = (title: string, message: string, onConfirm: () => void, confirmLabel = "Confirmer") => {
    setConfirmModal({ isOpen: true, title, message, onConfirm, confirmLabel });
  };

  const closeConfirm = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

  const logEvent = async (eventName: string, productName: string) => {
    try {
      const { error } = await supabase.from('site_analytics').insert([
        { 
          event_name: eventName, 
          product_name: productName,
          timestamp: new Date().toISOString()
        }
      ]);
      if (error) throw error;
    } catch (err) {
      console.error("[Analytics] Error:", err);
    }
  };

  const logLead = async (orderId: string, productName: string, price: number, details: string, customerData?: any) => {
    try {
      const { error } = await supabase.from('product_leads').insert([
        { 
          order_id: orderId, 
          product_name: productName,
          total_price: price,
          details: details,
          customer_name: customerData?.customer_name,
          customer_phone: customerData?.customer_phone,
          gps_coordinates: customerData?.gps_coordinates,
          latitude: customerData?.latitude,
          longitude: customerData?.longitude,
          location_captured: !!customerData?.location_captured,
          status: 'Pending',
          created_at: new Date().toISOString()
        }
      ]);
      if (error) throw error;
    } catch (err) {
      console.error("[Lead] Critical Error:", err);
      throw err;
    }
  };

  const [cart, setCart] = useState<any[]>(() => {
    const saved = localStorage.getItem('swoop_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('swoop_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const hasVisited = sessionStorage.getItem('swoop_visited');
    if (!hasVisited) {
      logEvent('Page View', 'Home');
      sessionStorage.setItem('swoop_visited', 'true');
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    const fetchFeatured = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(6)
        .order('id', { ascending: false });
      
      if (!error && data) {
        setFeaturedProducts(data);
      }
      setLoading(false);
    };

    fetchFeatured();

    const handleHashChange = async () => {
      const hash = window.location.hash;
      if (hash === '#admin') {
        setView('admin');
      } else if (hash.startsWith('#product-')) {
        const id = hash.replace('#product-', '');
        const { data } = await supabase.from('products').select('*').eq('id', id).single();
        if (data) {
          setSelectedProduct(data);
          setView('product');
        }
      } else if (hash === '#boutique') {
        setView('boutique');
        setSelectedProduct(null);
      } else {
        setView('home');
        setSelectedProduct(null);
        fetchFeatured(); 
      }
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      subscription.unsubscribe();
    };
  }, []);

  const handleAddToCart = (item: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.cartId === item.cartId);
      if (existing) {
        return prev.map(i => i.cartId === item.cartId ? { ...i, quantity: i.quantity + item.quantity } : i);
      }
      return [...prev, item];
    });
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (cartId: string) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.hash = '#';
  };

  const openCheckout = (payload: { items: any[]; totalPrice: number; productName: string; details: string }) => {
    setCheckoutPayload(payload);
    setIsCheckoutOpen(true);
    setIsCartOpen(false);
  };

  const renderContent = () => {
    if (view === 'admin') {
      if (!session) return <AdminLogin onLoginSuccess={() => setView('admin')} />;
      return (
        <AdminDashboard 
          session={session}
          onLogout={handleLogout} 
          triggerConfirm={triggerConfirm}
          setProcessing={setProcessing}
        />
      );
    }

    if (view === 'product' && selectedProduct) {
      return (
        <ProductDetail 
          product={selectedProduct} 
          onAddToCart={handleAddToCart} 
          onBack={() => window.location.hash = '#boutique'} 
          logEvent={logEvent}
          logLead={logLead}
          onCheckout={openCheckout}
        />
      );
    }

    if (view === 'boutique') return <Boutique />;

    return (
      <>
        <Hero />
        <section className="bg-white-luxury py-16 md:py-32 px-6 flex flex-col items-center border-t border-zinc-200">
            <h2 className="text-4xl md:text-8xl font-display font-black text-black-matte uppercase tracking-tighter mb-4 text-center">
              CURATED <span className="text-outline">DROPS</span>
            </h2>
            <div className="w-20 md:w-32 h-[3px] bg-gold mt-4"></div>
        </section>

        <section id="featured" className="relative border-t border-zinc-200 bg-white-luxury">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 bg-zinc-50 border-x border-zinc-200">
              {loading ? (
                <div className="col-span-full py-20 text-center uppercase tracking-widest text-[10px] text-zinc-400">Chargement...</div>
              ) : (
                featuredProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))
              )}
              
              {!loading && (
                <div className="bg-white p-10 md:p-16 flex flex-col items-center justify-center text-center space-y-8 min-h-[500px] border-b border-zinc-200">
                  <h4 className="text-gold text-[10px] font-black uppercase tracking-[0.6em]">CATALOGUE</h4>
                  <button 
                    onClick={() => window.location.hash = '#boutique'}
                    className="group relative px-10 py-4 border border-black text-black font-black uppercase tracking-[0.4em] text-[10px] overflow-hidden hover:text-white transition-colors duration-500"
                  >
                    <span className="relative z-10">VOIR TOUT</span>
                    <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
        <AboutSection />
        
        <section className="relative h-[400px] md:h-[600px] bg-black overflow-hidden flex flex-col items-center justify-center">
          <div className="absolute top-1/2 left-10 -translate-y-1/2 opacity-20 hidden md:block">
            <img src="https://raw.githubusercontent.com/yahyabmk01/Aymen-Clothes/main/Image_202601181051-removebg-preview.png" className="w-24 grayscale brightness-200" alt="SWOOP Logo" />
          </div>
          <div className="absolute top-1/2 right-10 -translate-y-1/2 opacity-20 hidden md:block">
            <img src="https://raw.githubusercontent.com/yahyabmk01/Aymen-Clothes/main/Image_202601181051-removebg-preview.png" className="w-24 grayscale brightness-200" alt="SWOOP Logo" />
          </div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05] select-none overflow-hidden">
            <span className="text-[15rem] md:text-[30rem] font-display font-black text-white whitespace-nowrap tracking-tighter uppercase italic">SWOOP LUXURY</span>
          </div>

          <div className="relative z-10 text-center space-y-2 md:space-y-4 px-6">
            <h5 className="text-gold text-[8px] md:text-[10px] font-black uppercase tracking-[1em] mb-4">CULTURE • ART • MAROC</h5>
            <h2 className="text-5xl md:text-9xl font-display font-black text-white uppercase tracking-tighter leading-none">BORN IN THE</h2>
            <h2 className="text-5xl md:text-9xl font-display font-black text-white uppercase tracking-tighter italic leading-none">STREETS</h2>
          </div>

          <div className="absolute bottom-16 -left-10 -right-10 h-10 md:h-14 bg-gold rotate-[-2deg] flex items-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-20">
            <div className="flex animate-ticker-fast whitespace-nowrap">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="flex items-center mx-6 md:mx-10">
                  <span className="text-black text-[9px] md:text-[11px] font-black uppercase tracking-[0.4em]">
                    SWOOP EXCLUSIF • 001 • MAROC ⚡
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="absolute bottom-10 text-zinc-500 text-[8px] font-black uppercase tracking-[0.8em]">SWOOP WORLDWIDE</div>
        </section>
      </>
    );
  };

  return (
    <div className="min-h-screen font-sans selection:bg-gold selection:text-white bg-white-luxury text-black">
      {view !== 'admin' && <Navbar cartCount={cart.length} onOpenCart={() => setIsCartOpen(true)} />}
      
      <AnimatePresence mode="wait">
        <PageTransition key={view + (selectedProduct?.id || '')} viewKey={view + (selectedProduct?.id || '')}>
          <main>{renderContent()}</main>
        </PageTransition>
      </AnimatePresence>

      {view !== 'admin' && <Footer />}
      
      <AnimatePresence>
        {(confirmModal.isOpen || processing) && (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={!processing ? closeConfirm : undefined} 
              className="fixed inset-0 bg-black/80 backdrop-blur-2xl" 
            />
            <AnimatePresence mode="wait">
              {confirmModal.isOpen && !processing && (
                <motion.div 
                  key="confirm" 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                  animate={{ opacity: 1, scale: 1, y: 0 }} 
                  exit={{ opacity: 0, scale: 0.9, y: 20 }} 
                  className="relative bg-white w-full max-w-[360px] p-10 rounded-[45px] shadow-3xl text-center"
                >
                  <h3 className="text-3xl font-display font-black uppercase tracking-tighter mb-4">{confirmModal.title}</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-8 leading-relaxed">
                    {confirmModal.message}
                  </p>
                  <div className="space-y-3">
                    <button 
                      onClick={() => { confirmModal.onConfirm(); closeConfirm(); }} 
                      className="w-full py-6 bg-red-600 text-white rounded-[25px] text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                    >
                      {confirmModal.confirmLabel || 'Oui, continuer'}
                    </button>
                    <button 
                      onClick={closeConfirm} 
                      className="w-full py-6 bg-zinc-100 text-zinc-400 rounded-[25px] text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                    >
                      Annuler
                    </button>
                  </div>
                </motion.div>
              )}
              {processing && (
                <motion.div 
                  key="loading" 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }} 
                  className="relative flex flex-col items-center gap-10"
                >
                  <CustomLoader />
                  <p className="text-[14px] font-black uppercase tracking-[1em] text-white animate-pulse">
                    SYNCHRONISATION...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </AnimatePresence>
      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cart} 
        onRemove={handleRemoveFromCart} 
        setCart={setCart}
        onCheckout={openCheckout}
      />
      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => {
          setIsCheckoutOpen(false);
          setCheckoutPayload(null);
        }}
        payload={checkoutPayload}
        logLead={logLead}
        logEvent={logEvent}
        setCart={setCart}
      />
    </div>
  );
};

export default App;