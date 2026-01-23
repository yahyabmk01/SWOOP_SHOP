
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

const AdminLogin: React.FC<{ onLoginSuccess: () => void }> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError('ÉCHEC DE L\'AUTHENTIFICATION. ACCÈS REFUSÉ.');
      setLoading(false);
    } else {
      onLoginSuccess();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[100px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="bg-white border border-zinc-100 p-10 md:p-14 rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-1.5 rounded-full bg-zinc-50 border border-zinc-100 text-zinc-400 text-[8px] font-black uppercase tracking-[0.5em] mb-8">
              SYSTÈME SÉCURISÉ • SWOOP HQ
            </div>
            <h1 className="text-5xl font-display font-black tracking-tighter uppercase text-black mb-2">
              ADMIN<span className="text-gold italic">.</span>
            </h1>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.4em]">ACCÈS TERMINAL</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-10">
            <div className="space-y-4 group">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] block text-zinc-400 group-focus-within:text-gold transition-colors">Email Terminal</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-50 border-b-2 border-zinc-100 p-4 text-black text-lg focus:border-gold outline-none transition-all placeholder:text-zinc-300"
                placeholder="admin@swoop.ma"
                required
              />
            </div>
            <div className="space-y-4 group">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] block text-zinc-400 group-focus-within:text-gold transition-colors">Clé d'Accès</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-50 border-b-2 border-zinc-100 p-4 text-black text-lg focus:border-gold outline-none transition-all placeholder:text-zinc-300"
                placeholder="••••••••"
                required
              />
            </div>
            
            {error && (
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-red-50 border border-red-100 p-4 rounded-2xl">
                <p className="text-red-500 text-[9px] font-black uppercase tracking-widest text-center">{error}</p>
              </motion.div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="group relative w-full h-20 bg-black text-white font-black uppercase tracking-[0.6em] text-[10px] rounded-3xl overflow-hidden hover:bg-gold hover:text-black transition-all duration-700 disabled:opacity-50 active:scale-95 shadow-xl"
            >
              <span className="relative z-10">{loading ? 'VÉRIFICATION...' : 'SE CONNECTER'}</span>
            </button>
          </form>

          <button 
            onClick={() => window.location.hash = '#'}
            className="w-full mt-10 text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors"
          >
            RETOUR AU SITE
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
