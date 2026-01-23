import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { AlertToast } from './ui/AlertToast';
import { AnimatePresence, motion } from "framer-motion";
import { GlassFilter, CustomLoader } from './ui/LiquidGlass';
import { 
  MapPin, ExternalLink, Package, Phone, User, X, CheckCircle2, Clock, XCircle, 
  TrendingUp, Plus, LayoutDashboard, Box, ShoppingCart, Menu, LogOut, 
  Trash2, Edit3, Image as ImageIcon, Check, Camera, Search, Filter, ArrowUpRight,
  History, Calendar, Save, RotateCw, Pencil, Printer
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

// Categories unified with storefront
const CATEGORIES = ['Hoodies', 'Pants', 'T-Shirts', 'Sneakers', 'Accessories', 'Packs'];
const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const SHOE_SIZES = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'];
const DATE_FILTERS = [
  { label: 'DERNIÈRES 24 HEURES', value: 1 },
  { label: '3 DERNIERS JOURS', value: 3 },
  { label: '7 DERNIERS JOURS', value: 7 },
  { label: '14 DERNIERS JOURS', value: 14 },
  { label: 'DERNIER MOIS', value: 30 },
  { label: '3 DERNIERS MOIS', value: 90 },
  { label: '6 DERNIERS MOIS', value: 180 },
  { label: 'DERNIÈRE ANNÉE', value: 365 }
];

const OFFICIAL_COLORS = [
  { name: 'BLACK', hex: '#000000' },
  { name: 'WHITE', hex: '#FFFFFF' },
  { name: 'RED', hex: '#FF3B30' },
  { name: 'BLUE', hex: '#0038FF' },
  { name: 'GREEN', hex: '#34C759' },
  { name: 'NAVY', hex: '#323264' },
  { name: 'GREY', hex: '#A2A2A2' },
  { name: 'BEIGE', hex: '#F5F5DC' },
  { name: 'GOLD', hex: '#FFD700' },
  { name: 'SILVER', hex: '#C0C0C0' },
  { name: 'PINK', hex: '#FFD1DC' },
  { name: 'ORANGE', hex: '#FF9500' },
  { name: 'YELLOW', hex: '#FFFF00' },
  { name: 'PURPLE', hex: '#AF52DE' },
  { name: 'BROWN', hex: '#A52A2A' }
];

const LEAD_STATUSES = ['Pending', 'Completed', 'Cancelled'];

interface AdminDashboardProps {
  session: any;
  onLogout: () => void;
  triggerConfirm: (title: string, message: string, onConfirm: () => void, confirmLabel?: string) => void;
  setProcessing: (val: boolean) => void;
}

interface ParsedOrderItem {
  id: string;
  name: string;
  size: string;
  color: string;
  qty: number;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ session, onLogout, triggerConfirm, setProcessing }) => {
  // Role Detection
  const isOwner = session?.user?.user_metadata?.role === 'owner';
  
  const [activeTab, setActiveTab] = useState<'nav' | 'leads' | 'manage' | 'add'>(isOwner ? 'nav' : 'leads');
  const [products, setProducts] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toasts, setToasts] = useState<any[]>([]);
  const [dateFilterDays, setDateFilterDays] = useState(7);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  
  // Lead Editing State
  const [isEditingLead, setIsEditingLead] = useState(false);
  const [editLeadName, setEditLeadName] = useState('');
  const [editLeadPhone, setEditLeadPhone] = useState('');
  const [editLeadItems, setEditLeadItems] = useState<ParsedOrderItem[]>([]);
  const [isSavingLead, setIsSavingLead] = useState(false);

  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Completed' | 'Cancelled'>('All');
  const [leadSearch, setLeadSearch] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Form State for Add/Edit
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formOldPrice, setFormOldPrice] = useState('');
  const [formCategory, setFormCategory] = useState(CATEGORIES[0]);
  const [formSizes, setFormSizes] = useState<string[]>([]);
  const [formColors, setFormColors] = useState<string[]>([]);
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formIsInStock, setFormIsInStock] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchGlobalData();
  }, [dateFilterDays]);

  const showToast = (variant: any, title: string, description: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, variant, title, description }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  };

  async function fetchGlobalData() {
    setIsRefreshing(true);
    const filterDate = new Date();
    filterDate.setDate(filterDate.getDate() - dateFilterDays);
    const dateStr = filterDate.toISOString();

    try {
      const promises: Promise<any>[] = [
        supabase.from('products').select('*').order('id', { ascending: false }),
        supabase.from('product_leads').select('*').gte('created_at', dateStr).order('created_at', { ascending: false }),
      ];

      if (isOwner) {
        promises.push(supabase.from('site_analytics').select('*').gte('timestamp', dateStr));
      }

      const results = await Promise.all(promises);
      const [pRes, lRes] = results;
      const aRes = isOwner ? results[2] : { data: [] };

      if (pRes.data) setProducts(pRes.data);
      if (lRes.data) setLeads(lRes.data);
      if (isOwner && aRes.data) setAllEvents(aRes.data);
    } catch (e) { 
      showToast('error', 'Erreur', 'Synchronisation impossible.'); 
    } finally { 
      setIsRefreshing(false); 
    }
  }

  const parseDetails = (detailsStr: string): ParsedOrderItem[] => {
    if (!detailsStr) return [];
    return detailsStr.split(' || ').map((itemStr, idx) => {
      const parts = itemStr.split(' | ');
      return {
        id: idx.toString() + Date.now(),
        name: parts[0]?.replace(/^Item \d+: /, '') || 'Unknown Product',
        size: parts[1]?.replace('Size: ', '') || '?',
        color: parts[2]?.replace('Color: ', '') || '?',
        qty: parseInt(parts[3]?.replace('Qty: ', '') || '1')
      };
    });
  };

  const serializeDetails = (items: ParsedOrderItem[]): string => {
    return items.map((item, idx) => 
      `Item ${idx + 1}: ${item.name} | Size: ${item.size} | Color: ${item.color} | Qty: ${item.qty}`
    ).join(' || ');
  };

  const stats = useMemo(() => {
    if (!isOwner) return { realRevenue: 0, potentialRevenue: 0, views: 0, clicks: 0, chartData: [], topProducts: [] };

    const realRevenue = leads.filter(l => l.status === 'Completed').reduce((acc, curr) => acc + (Number(curr.total_price) || 0), 0);
    const potentialRevenue = leads.filter(l => l.status !== 'Cancelled').reduce((acc, curr) => acc + (Number(curr.total_price) || 0), 0);
    const views = allEvents.filter(e => e.event_name === 'Page View').length;
    const clicks = allEvents.filter(e => e.event_name === 'WhatsApp Click').length;
    
    const chartMap: Record<string, { name: string, views: number, clicks: number }> = {};
    const now = new Date();
    for (let i = dateFilterDays - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      const dateKey = d.toISOString().split('T')[0];
      chartMap[dateKey] = { name: dateKey.split('-')[2] + '/' + dateKey.split('-')[1], views: 0, clicks: 0 };
    }
    allEvents.forEach(e => {
      const dateKey = e.timestamp?.split('T')[0];
      if (chartMap[dateKey]) {
        if (e.event_name === 'Page View') chartMap[dateKey].views++;
        if (e.event_name === 'WhatsApp Click') chartMap[dateKey].clicks++;
      }
    });

    const productRankingMap: Record<string, { name: string, count: number, img: string }> = {};
    leads.filter(l => l.status === 'Completed').forEach(l => {
      const parts = l.product_name.split(', ');
      parts.forEach((pStr: string) => {
        const nameOnly = pStr.split(' [')[0].trim();
        if (!productRankingMap[nameOnly]) {
          const original = products.find(prod => prod.name === nameOnly);
          productRankingMap[nameOnly] = { name: nameOnly, count: 0, img: original?.image_url?.[0] || '' };
        }
        productRankingMap[nameOnly].count++;
      });
    });
    const topProducts = Object.values(productRankingMap).sort((a, b) => b.count - a.count).slice(0, 10);

    return { realRevenue, potentialRevenue, views, clicks, chartData: Object.values(chartMap), topProducts };
  }, [leads, allEvents, products, dateFilterDays, isOwner]);

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const matchesStatus = statusFilter === 'All' || l.status === statusFilter;
      const searchLower = leadSearch.toLowerCase();
      const matchesSearch = (l.order_id || '').toLowerCase().includes(searchLower) || 
                           (l.customer_name || '').toLowerCase().includes(searchLower);
      return matchesStatus && matchesSearch;
    });
  }, [leads, statusFilter, leadSearch]);

  const handleStatusUpdate = async (id: number, status: string) => {
    const { error } = await supabase.from('product_leads').update({ status }).eq('id', id);
    if (!error) {
      fetchGlobalData();
      if (selectedLead?.id === id) setSelectedLead((prev: any) => ({ ...prev, status }));
      showToast('success', 'Statut Mis à Jour', `La commande est maintenant ${status}.`);
    }
  };

  const startEditProduct = (p: any) => {
    setEditingId(p.id); 
    setFormName(p.name); 
    setFormPrice(p.price.toString()); 
    setFormOldPrice(p.old_price?.toString() || '');
    setFormCategory(p.category); 
    setFormSizes(p.sizes || []);
    setFormColors(p.colors || []); 
    setFormImages(p.image_url || []);
    setFormIsInStock(p.is_in_stock ?? true);
    setActiveTab('add');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProductDelete = async (id: number) => {
    triggerConfirm('Supprimer', 'Voulez-vous supprimer ce produit ? Cette action est irréversible.', async () => {
      setProcessing(true);
      await supabase.from('products').delete().eq('id', id);
      fetchGlobalData();
      setProcessing(false);
      showToast('success', 'Supprimé', 'Produit retiré de l\'inventaire.');
    }, 'Supprimer définitivement');
  };

  const handleImageDelete = (idx: number) => {
    triggerConfirm('Retirer Image', 'Voulez-vous retirer cette image de la galerie ?', () => {
      setFormImages(prev => prev.filter((_, i) => i !== idx));
    }, 'Retirer');
  };

  const handleExitAdmin = () => {
    triggerConfirm('Quitter le Terminal', 'Vous allez être redirigé vers le site public. Toute modification non enregistrée sera perdue.', () => {
      onLogout();
    }, 'Quitter');
  };

  const resetForm = () => {
    setEditingId(null); setFormName(''); setFormPrice(''); setFormOldPrice('');
    setFormCategory(CATEGORIES[0]); setFormSizes([]); setFormColors([]); setFormImages([]);
    setFormIsInStock(true);
  };

  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxSize = 1200;
        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas context failed'));
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Blob conversion failed'));
        }, 'image/webp', 0.8);
      };
      img.onerror = reject;
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setProcessing(true);
    const newUrls = [...formImages];
    for (const file of Array.from(files) as File[]) {
      try {
        const compressedBlob = await compressImage(file);
        const fileName = `${Date.now()}-${file.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.webp`;
        
        console.log(`[Storage] Tentative d'upload: ${fileName} vers le bucket 'product-images'`);
        
        const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, compressedBlob, {
            contentType: 'image/webp',
            cacheControl: '3600',
            upsert: false
        });

        if (uploadError) { 
          console.error("[Supabase Storage Error Full Response]:", uploadError);
          showToast('error', 'Upload Error', `Code: ${uploadError.name} - ${uploadError.message}`); 
          continue; 
        }

        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
        console.log(`[Storage] Succès! URL Publique: ${publicUrl}`);
        newUrls.push(publicUrl);
      } catch (err) {
        console.error("[Local Compression Error]:", err);
        showToast('error', 'Compression Error', 'Une erreur est survenue lors de l\'optimisation locale.');
      }
    }
    setFormImages(newUrls);
    setProcessing(false);
  };

  const handleSaveProduct = async () => {
    if (!formName || !formPrice) {
      showToast('warning', 'Champs Manquants', 'Le nom et le prix sont obligatoires.');
      return;
    }
    setProcessing(true);
    const payload = {
      name: formName,
      price: Number(formPrice),
      old_price: formOldPrice ? Number(formOldPrice) : null,
      category: formCategory,
      sizes: formSizes,
      colors: formColors,
      image_url: formImages,
      is_in_stock: formIsInStock
    };

    let error;
    if (editingId) {
      const res = await supabase.from('products').update(payload).eq('id', editingId);
      error = res.error;
    } else {
      const res = await supabase.from('products').insert([payload]);
      error = res.error;
    }

    if (!error) {
      fetchGlobalData();
      setActiveTab('manage');
      resetForm();
      showToast('success', 'Succès', editingId ? 'Produit modifié.' : 'Nouveau drop lancé !');
    } else {
      showToast('error', 'Erreur BDD', error.message);
    }
    setProcessing(false);
  };

  const handleSaveLeadChanges = async () => {
    if (!selectedLead) return;
    setIsSavingLead(true);
    
    const newTotal = editLeadItems.reduce((acc, item) => {
      const product = products.find(p => p.name === item.name);
      return acc + (product ? product.price * item.qty : 0);
    }, 0);

    const newDetails = serializeDetails(editLeadItems);
    const newProductSummary = editLeadItems.map(item => `${item.name} [${item.size}/${item.color}]`).join(', ');

    try {
      const { error } = await supabase
        .from('product_leads')
        .update({
          customer_name: editLeadName,
          customer_phone: editLeadPhone,
          details: newDetails,
          product_name: newProductSummary,
          total_price: newTotal
        })
        .eq('id', selectedLead.id);

      if (error) throw error;

      showToast('success', 'Modifications Enregistrées', 'La commande a été mise à jour.');
      setIsEditingLead(false);
      fetchGlobalData();
      setSelectedLead(null);
    } catch (err) {
      showToast('error', 'Erreur', 'Impossible de sauvegarder les modifications.');
    } finally {
      setIsSavingLead(false);
    }
  };

  const handleAddProductToLead = (p: any) => {
    const newItem: ParsedOrderItem = {
      id: Date.now().toString(),
      name: p.name,
      size: p.sizes?.[0] || '?',
      color: p.colors?.[0] || '?',
      qty: 1
    };
    setEditLeadItems([...editLeadItems, newItem]);
  };

  const handlePrintSticker = () => {
    if (!selectedLead) return;
    window.print();
  };

  const NavItem = ({ id, icon: Icon, label }: any) => (
    <button 
      onClick={() => { setActiveTab(id); setIsMobileMenuOpen(false); }} 
      className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === id ? 'bg-black text-white shadow-xl' : 'text-zinc-400 hover:text-black hover:bg-zinc-100'}`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );

  const getProductImage = (name: string) => {
    const p = products.find(prod => prod.name === name);
    return p?.image_url?.[0] || 'https://placehold.co/100x100?text=Product';
  };

  const currentTotal = useMemo(() => {
    return editLeadItems.reduce((acc, item) => {
      const product = products.find(p => p.name === item.name);
      return acc + (product ? product.price * item.qty : 0);
    }, 0);
  }, [editLeadItems, products]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-black-matte pb-24">
      <GlassFilter />
      <div className="fixed top-6 right-6 z-[99999] flex flex-col gap-3 w-full max-w-sm pointer-events-none no-print">
        <AnimatePresence mode="popLayout">
          {toasts.map(toast => <AlertToast key={toast.id} {...toast} onClose={() => {}} />)}
        </AnimatePresence>
      </div>

      <nav className="fixed top-0 w-full z-[100] bg-white/70 backdrop-blur-2xl border-b border-zinc-100 h-20 md:h-24 px-6 md:px-12 flex justify-between items-center no-print">
        <div className="flex items-center gap-6">
          <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-3 bg-zinc-50 rounded-xl">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-display font-black uppercase tracking-tighter">SWOOP <span className="text-gold italic">HQ</span></h1>
        </div>
        <div className="hidden md:flex gap-2">
          {isOwner && <NavItem id="nav" icon={LayoutDashboard} label="Bureau" />}
          <NavItem id="leads" icon={ShoppingCart} label="Commandes" />
          <NavItem id="manage" icon={Box} label="Stocks" />
          <NavItem id="add" icon={Plus} label="Nouveau" />
        </div>
        <div className="flex items-center gap-4">
          <button onClick={fetchGlobalData} className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center hover:bg-zinc-100 transition-colors">
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={handleExitAdmin} className="px-5 py-3 bg-red-50 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-md md:hidden no-print" />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25 }} className="fixed top-0 left-0 bottom-0 w-[280px] z-[151] bg-white p-8 flex flex-col gap-4 md:hidden no-print">
              <div className="flex justify-between items-center mb-10">
                <span className="text-sm font-display font-black uppercase tracking-tighter">Navigation</span>
                <button onClick={() => setIsMobileMenuOpen(false)}><X className="w-6 h-6" /></button>
              </div>
              {isOwner && <NavItem id="nav" icon={LayoutDashboard} label="Bureau" />}
              <NavItem id="leads" icon={ShoppingCart} label="Commandes" />
              <NavItem id="manage" icon={Box} label="Stocks" />
              <NavItem id="add" icon={Plus} label="Nouveau" />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="pt-32 md:pt-40 container mx-auto px-6 max-w-7xl no-print">
        {activeTab === 'nav' && isOwner && (
          <div className="space-y-12 animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <h2 className="text-3xl font-display font-black uppercase tracking-tight">VUE D'ENSEMBLE</h2>
              <select value={dateFilterDays} onChange={(e) => setDateFilterDays(Number(e.target.value))} className="bg-white px-6 py-4 rounded-2xl border border-zinc-100 text-[10px] font-black uppercase tracking-widest shadow-sm outline-none cursor-pointer">
                {DATE_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'RÉEL', val: stats.realRevenue, color: 'text-green-600', bg: 'bg-green-50' },
                { label: 'POTENTIEL', val: stats.potentialRevenue, color: 'text-black', bg: 'bg-white' },
                { label: 'TRAFIC', val: stats.views, color: 'text-black', bg: 'bg-white' },
                { label: 'INTÉRÊT', val: stats.clicks, color: 'text-gold', bg: 'bg-gold/5' }
              ].map((kpi, i) => (
                <div key={i} className={`${kpi.bg} p-8 rounded-[40px] border border-zinc-50 shadow-sm`}>
                  <span className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-400 block mb-2">{kpi.label}</span>
                  <p className={`text-2xl md:text-3xl font-display font-black italic ${kpi.color}`}>{kpi.val.toLocaleString()} <span className="text-[10px]">{i < 2 ? 'MAD' : ''}</span></p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-10 rounded-[50px] shadow-sm border border-zinc-50">
                <div className="flex items-center gap-4 mb-10">
                  <RotateCw className="text-gold" />
                  <h3 className="text-xl font-display font-black uppercase tracking-widest">COURBE DE CROISSANCE</h3>
                </div>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.chartData}>
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#000" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900 }} />
                      <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', textTransform: 'uppercase', fontSize: '10px', fontWeight: 900 }} />
                      <Area type="monotone" dataKey="views" name="Visites" stroke="#000" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                      <Area type="monotone" dataKey="clicks" name="Clics WA" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorClicks)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-black p-10 rounded-[50px] shadow-2xl text-white">
                <h3 className="text-xl font-display font-black uppercase mb-10 tracking-widest flex items-center gap-3">
                  BEST SELLERS <ArrowUpRight className="text-gold w-4 h-4" />
                </h3>
                <div className="space-y-6">
                  {stats.topProducts.map((p, i) => (
                    <div key={i} className="flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-800">
                          <img src={p.img} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-tight truncate w-24">{p.name}</p>
                          <p className="text-[8px] text-gold font-black uppercase tracking-widest">{p.count} Ventes</p>
                        </div>
                      </div>
                      <div className="text-xl font-display font-black italic opacity-20">#{i+1}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leads' && (
          <div className="space-y-8 animate-fade-in-up">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
              <h2 className="text-2xl font-display font-black uppercase tracking-tight">GESTION DES FLUX</h2>
              <div className="flex flex-wrap gap-2">
                {['All', ...LEAD_STATUSES].map(s => (
                  <button 
                    key={s} 
                    onClick={() => setStatusFilter(s as any)} 
                    className={`px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${statusFilter === s ? 'bg-black text-white shadow-xl' : 'bg-white text-zinc-400 border-zinc-100'}`}
                  >
                    {s === 'All' ? 'TOUT' : s === 'Pending' ? 'ATTENTE' : s === 'Completed' ? 'TERMINÉ' : 'ANNULÉ'}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300 w-5 h-5" />
              <input 
                type="text" 
                placeholder="RECHERCHER PAR ID OU NOM CLIENT..." 
                value={leadSearch} 
                onChange={e => setLeadSearch(e.target.value)} 
                className="w-full bg-white px-16 py-6 rounded-[30px] border border-zinc-100 shadow-sm text-[11px] font-black uppercase tracking-widest outline-none focus:border-gold transition-all"
              />
            </div>

            <div className="grid gap-4">
              {filteredLeads.map(l => (
                <div key={l.id} 
                  onClick={() => {
                    setSelectedLead(l);
                    setIsEditingLead(false);
                    setEditLeadName(l.customer_name || '');
                    setEditLeadPhone(l.customer_phone || '');
                    setEditLeadItems(parseDetails(l.details));
                  }} 
                  className="bg-white p-8 rounded-[40px] border border-zinc-50 shadow-sm flex justify-between items-center group cursor-pointer hover:shadow-xl transition-all"
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-3 h-3 rounded-full ${l.status === 'Completed' ? 'bg-green-500' : l.status === 'Cancelled' ? 'bg-red-500' : 'bg-gold'}`} />
                    <div className="flex flex-col">
                      <span className="font-display font-black text-xl tracking-tighter">{l.order_id}</span>
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{l.customer_name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <span className="text-xl font-display font-black italic">{l.total_price} MAD</span>
                    <ExternalLink className="w-5 h-5 text-zinc-100 group-hover:text-gold transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'manage' && (
          <div className="space-y-8 animate-fade-in-up">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-display font-black uppercase tracking-tight">ARCHIVES DROPS</h2>
              <button onClick={() => { resetForm(); setActiveTab('add'); }} className="bg-black text-white px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-gold hover:text-black transition-all">
                LANCER UN DROP
              </button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {products.map(p => (
                <div key={p.id} className="bg-white rounded-[25px] md:rounded-[40px] overflow-hidden border border-zinc-100 shadow-sm group transition-all hover:shadow-xl">
                  <div className="aspect-[4/5] relative bg-zinc-50 overflow-hidden">
                    <img src={p.image_url?.[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      <button 
                        onClick={() => startEditProduct(p)}
                        className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg text-black hover:bg-gold transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleProductDelete(p.id)}
                        className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4 md:p-8">
                    <h4 className="text-xs md:text-lg font-display font-black uppercase tracking-tight leading-none mb-1 md:mb-2 truncate">{p.name}</h4>
                    <p className="text-[7px] md:text-[8px] font-black text-gold uppercase tracking-[0.4em] mb-2 md:mb-4">{p.category}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs md:text-lg font-display font-black italic">{p.price} MAD</span>
                      <div className={`w-2 h-2 rounded-full ${p.is_in_stock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'add' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up pb-32">
            <div className="bg-white p-10 md:p-14 rounded-[50px] shadow-sm border border-zinc-50 relative overflow-hidden">
              <div className="flex justify-between items-center mb-12">
                <h3 className="text-2xl font-display font-black uppercase tracking-tighter">INFORMATIONS</h3>
                <div className="flex items-center gap-4">
                  <span className="text-[8px] font-black uppercase text-zinc-400 tracking-widest">STATUT STOCK</span>
                  <button 
                    type="button" 
                    onClick={() => setFormIsInStock(!formIsInStock)}
                    className={`w-14 h-8 rounded-full relative transition-colors ${formIsInStock ? 'bg-green-500' : 'bg-zinc-200'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${formIsInStock ? 'left-7 shadow-lg' : 'left-1'}`} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-300">NOM DU PRODUIT</label>
                  <input type="text" value={formName} onChange={e => setFormName(e.target.value)} className="w-full bg-zinc-50 border-transparent border-b-2 focus:border-gold p-5 text-black font-black uppercase tracking-widest outline-none rounded-2xl transition-all" placeholder="Impact Zip Hoodie..." />
                </div>
                <div className="space-y-4">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-300">CATÉGORIE</label>
                  <select value={formCategory} onChange={e => setFormCategory(e.target.value)} className="w-full bg-zinc-50 border-transparent border-b-2 focus:border-gold p-5 text-black font-black uppercase tracking-widest outline-none rounded-2xl transition-all appearance-none cursor-pointer">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-300">PRIX (MAD)</label>
                  <input type="number" value={formPrice} onChange={e => setFormPrice(e.target.value)} className="w-full bg-zinc-50 border-transparent border-b-2 focus:border-gold p-5 text-black font-black outline-none rounded-2xl transition-all" placeholder="499" />
                </div>
                <div className="space-y-4">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-300">ANCIEN PRIX (PROMO)</label>
                  <input type="number" value={formOldPrice} onChange={e => setFormOldPrice(e.target.value)} className="w-full bg-zinc-50 border-transparent border-b-2 focus:border-gold p-5 text-black font-black outline-none rounded-2xl transition-all placeholder:text-red-200" placeholder="Prix d'avant" />
                </div>
              </div>
            </div>

            <div className="bg-white p-10 md:p-14 rounded-[50px] shadow-sm border border-zinc-50">
              <h3 className="text-2xl font-display font-black uppercase tracking-tighter mb-12">TAILLES & COULEURS</h3>
              
              <div className="bg-zinc-50/50 p-8 rounded-[40px] space-y-12">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-300 mb-6 block">[ VETEMENTS ]</span>
                  <div className="flex flex-wrap gap-3">
                    {CLOTHING_SIZES.map(s => (
                      <button 
                        key={s} 
                        type="button" 
                        onClick={() => setFormSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                        className={`w-16 h-16 rounded-2xl text-[11px] font-black transition-all flex items-center justify-center border-2 ${formSizes.includes(s) ? 'bg-black text-white border-black shadow-[0_10px_30px_rgba(0,0,0,0.2)]' : 'bg-white text-zinc-300 border-zinc-50'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-300 mb-6 block">[ CHAUSSURES ]</span>
                  <div className="grid grid-cols-5 md:grid-cols-7 gap-3">
                    {SHOE_SIZES.map(s => (
                      <button 
                        key={s} 
                        type="button" 
                        onClick={() => setFormSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                        className={`w-full aspect-square rounded-2xl text-[10px] font-black transition-all flex items-center justify-center border-2 ${formSizes.includes(s) ? 'bg-black text-white border-black shadow-[0_10px_30px_rgba(0,0,0,0.2)]' : 'bg-white text-zinc-300 border-zinc-50'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-12">
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-300 mb-8 block">PALETTE DE COULEURS OFFICIELLE</span>
                <div className="grid grid-cols-5 md:grid-cols-9 lg:grid-cols-11 gap-6 p-10 bg-zinc-50/50 rounded-[40px]">
                  {OFFICIAL_COLORS.map(c => (
                    <div key={c.name} className="flex flex-col items-center gap-3">
                      <button 
                        type="button" 
                        onClick={() => setFormColors(prev => prev.includes(c.name) ? prev.filter(x => x !== c.name) : [...prev, c.name])}
                        className={`w-14 h-14 rounded-full border-4 relative transition-all shadow-sm ${formColors.includes(c.name) ? 'border-black scale-110' : 'border-white'}`}
                        style={{ backgroundColor: c.hex }}
                      >
                        {formColors.includes(c.name) && (
                          <div className={`absolute inset-0 flex items-center justify-center ${c.name === 'WHITE' ? 'text-black' : 'text-white'}`}>
                            <Check className="w-6 h-6" strokeWidth={4} />
                          </div>
                        )}
                      </button>
                      <span className="text-[8px] font-black uppercase text-zinc-400 tracking-tighter">{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white p-10 md:p-14 rounded-[50px] shadow-sm border border-zinc-50">
              <h3 className="text-2xl font-display font-black uppercase tracking-tighter mb-12">GALERIE PHOTOS</h3>
              <div className="flex flex-wrap gap-6">
                {formImages.map((img, idx) => (
                  <div key={idx} className="relative w-36 h-48 rounded-3xl overflow-hidden group border border-zinc-100 shadow-sm">
                    <img src={img} className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => handleImageDelete(idx)}
                      className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>
                ))}
                
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-36 h-48 border-2 border-dashed border-zinc-100 rounded-3xl flex flex-col items-center justify-center gap-4 text-zinc-200 hover:border-gold hover:text-gold transition-all"
                >
                  <Camera className="w-8 h-8" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-center px-4">Ajouter Photo</span>
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" multiple accept="image/*" />
              </div>
            </div>

            <button 
              onClick={handleSaveProduct}
              disabled={isRefreshing}
              className="w-full bg-black text-white py-10 rounded-[40px] text-sm font-black uppercase tracking-[0.6em] shadow-2xl hover:bg-gold hover:text-black transition-all active:scale-95 disabled:opacity-50"
            >
              {editingId ? 'ENREGISTRER LES MODIFICATIONS' : 'LANCER LE DROP'}
            </button>
            <button 
              onClick={() => { resetForm(); setActiveTab('manage'); }}
              className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:text-black transition-colors"
            >
              Annuler et fermer
            </button>
          </div>
        )}
      </main>

      <AnimatePresence>
        {selectedLead && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedLead(null)} className="fixed inset-0 z-[5000] bg-black/60 backdrop-blur-xl no-print" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed right-0 top-0 bottom-0 z-[5001] w-full max-w-2xl bg-white shadow-2xl flex flex-col no-print">
              <div className="p-10 border-b flex justify-between items-center bg-white sticky top-0 z-10">
                <div>
                  <h3 className="text-3xl font-display font-black uppercase tracking-tighter">{selectedLead.order_id}</h3>
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">DOSSIER COMMANDE</p>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handlePrintSticker}
                    className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-400 hover:bg-black hover:text-white transition-all shadow-sm"
                  >
                    <Printer className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setIsEditingLead(!isEditingLead)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isEditingLead ? 'bg-gold text-white shadow-lg' : 'bg-zinc-50 text-zinc-400 hover:bg-zinc-100'}`}
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  {isEditingLead && (
                    <button 
                      onClick={handleSaveLeadChanges}
                      disabled={isSavingLead}
                      className="bg-black text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-gold transition-colors shadow-lg active:scale-95 disabled:opacity-50"
                    >
                      {isSavingLead ? <span className="animate-pulse">Calcul...</span> : <><Save className="w-4 h-4" /> Enregistrer</>}
                    </button>
                  )}
                  <button onClick={() => setSelectedLead(null)} className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center hover:bg-zinc-100"><X /></button>
                </div>
              </div>

              <div className="p-10 flex-1 overflow-y-auto space-y-12 pb-40">
                <div className="grid grid-cols-3 gap-3">
                  {LEAD_STATUSES.map(s => (
                    <button key={s} onClick={() => handleStatusUpdate(selectedLead.id, s)} className={`py-5 rounded-[25px] text-[10px] font-black uppercase tracking-widest transition-all ${selectedLead.status === s ? 'bg-black text-white' : 'bg-white text-zinc-300 border border-zinc-100'}`}>
                      {s === 'Pending' ? 'ATTENTE' : s === 'Completed' ? 'TERMINÉ' : 'ANNULÉ'}
                    </button>
                  ))}
                </div>

                <div className="bg-zinc-50 p-8 rounded-[40px] space-y-6">
                   <div className="flex items-center gap-4 text-zinc-400">
                      <Calendar className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Reçu le: {new Date(selectedLead.created_at).toLocaleString('fr-FR')}</span>
                   </div>
                   <div className="flex items-center gap-4 text-zinc-400">
                      <History className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Statut Actuel: <span className="text-black">{selectedLead.status}</span></span>
                   </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-4 text-gold"><User className="w-4 h-4" /><h4 className="text-[10px] font-black uppercase tracking-widest">CLIENT</h4></div>
                  <div className="bg-zinc-50 p-8 rounded-[40px] space-y-4">
                    <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
                      <span className="text-[9px] font-black text-zinc-300">NOM</span>
                      {isEditingLead ? (
                        <input 
                          type="text" 
                          value={editLeadName} 
                          onChange={e => setEditLeadName(e.target.value)} 
                          className="bg-white border border-zinc-200 px-4 py-2 rounded-xl text-sm font-black uppercase outline-none focus:border-gold w-1/2"
                        />
                      ) : (
                        <span className="text-sm font-black uppercase">{selectedLead.customer_name}</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-zinc-300">TEL</span>
                      {isEditingLead ? (
                        <input 
                          type="text" 
                          value={editLeadPhone} 
                          onChange={e => setEditLeadPhone(e.target.value)} 
                          className="bg-white border border-zinc-200 px-4 py-2 rounded-xl text-sm font-black outline-none focus:border-gold w-1/2"
                        />
                      ) : (
                        <a href={`tel:${selectedLead.customer_phone}`} className="text-sm font-black text-gold">{selectedLead.customer_phone}</a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4 text-gold"><MapPin className="w-4 h-4" /><h4 className="text-[10px] font-black uppercase tracking-widest">LOGISTIQUE</h4></div>
                  <button 
                    onClick={() => window.open(selectedLead.latitude ? `https://www.google.com/maps/search/?api=1&query=${selectedLead.latitude},${selectedLead.longitude}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedLead.gps_coordinates)}`, '_blank')}
                    className="w-full bg-black p-8 text-white rounded-[40px] flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-6">
                      <MapPin className="w-6 h-6 text-gold" />
                      <div className="text-left">
                        <span className="block text-[11px] font-black uppercase">Localiser la livraison</span>
                        <span className="block text-[8px] opacity-40 uppercase mt-1">Ouvrir dans Google Maps</span>
                      </div>
                    </div>
                    <ArrowUpRight className="opacity-40 group-hover:opacity-100" />
                  </button>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-gold"><Package className="w-4 h-4" /><h4 className="text-[10px] font-black uppercase tracking-widest">PANIER</h4></div>
                    {isEditingLead && (
                      <div className="relative group">
                        <button className="text-[10px] font-black uppercase tracking-widest text-gold hover:text-black flex items-center gap-2">
                          <Plus className="w-4 h-4" /> Ajouter Produit
                        </button>
                        <div className="absolute right-0 top-full mt-2 w-64 bg-white shadow-2xl rounded-2xl border border-zinc-100 p-4 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-20 max-h-64 overflow-y-auto">
                           {products.map(p => (
                             <button 
                                key={p.id} 
                                onClick={() => handleAddProductToLead(p)}
                                className="w-full text-left px-4 py-3 hover:bg-zinc-50 rounded-xl flex items-center gap-4 transition-colors"
                             >
                               <img src={p.image_url?.[0]} className="w-8 h-8 object-cover rounded-md" />
                               <span className="text-[10px] font-black uppercase truncate">{p.name}</span>
                             </button>
                           ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {editLeadItems.map((item, idx) => (
                      <div key={item.id} className="bg-white p-6 rounded-[35px] border border-zinc-100 flex items-center gap-6 relative overflow-hidden group">
                        <div className="w-20 h-24 bg-zinc-50 rounded-2xl overflow-hidden flex-shrink-0">
                          <img src={getProductImage(item.name)} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <h5 className="text-xs font-black uppercase tracking-tight truncate pr-8">{item.name}</h5>
                          <div className="flex gap-2 mt-2">
                            {isEditingLead ? (
                              <>
                                <select 
                                  value={item.size} 
                                  onChange={e => {
                                    const next = [...editLeadItems];
                                    next[idx].size = e.target.value;
                                    setEditLeadItems(next);
                                  }}
                                  className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-zinc-50 rounded-full text-black outline-none"
                                >
                                  {[...CLOTHING_SIZES, ...SHOE_SIZES].map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <select 
                                  value={item.color} 
                                  onChange={e => {
                                    const next = [...editLeadItems];
                                    next[idx].color = e.target.value;
                                    setEditLeadItems(next);
                                  }}
                                  className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-zinc-50 rounded-full text-black outline-none"
                                >
                                  {OFFICIAL_COLORS.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                </select>
                              </>
                            ) : (
                              <>
                                <span className="text-[8px] font-black uppercase tracking-widest px-3 py-1 bg-zinc-50 rounded-full text-zinc-400">{item.size}</span>
                                <span className="text-[8px] font-black uppercase tracking-widest px-3 py-1 bg-zinc-50 rounded-full text-zinc-400">{item.color}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {isEditingLead ? (
                            <div className="flex items-center gap-3">
                              <button onClick={() => {
                                const next = [...editLeadItems];
                                if (next[idx].qty > 1) {
                                  next[idx].qty--;
                                  setEditLeadItems(next);
                                }
                              }} className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center">-</button>
                              <span className="text-sm font-black">X{item.qty}</span>
                              <button onClick={() => {
                                const next = [...editLeadItems];
                                next[idx].qty++;
                                setEditLeadItems(next);
                              }} className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center">+</button>
                            </div>
                          ) : (
                            <span className="text-sm font-black italic text-zinc-300">X{item.qty}</span>
                          )}
                        </div>
                        {isEditingLead && (
                          <button 
                            onClick={() => {
                              setEditLeadItems(editLeadItems.filter((_, i) => i !== idx));
                            }}
                            className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    {editLeadItems.length === 0 && (
                      <div className="text-center py-10 opacity-20 text-[10px] font-black uppercase tracking-[0.5em]">Panier Vide</div>
                    )}
                  </div>
                  <div className="bg-black p-10 rounded-[45px] text-white flex justify-between items-center shadow-xl">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Total Commande</span>
                    <h4 className="text-3xl font-display font-black italic">{isEditingLead ? currentTotal : selectedLead.total_price} <span className="text-gold">MAD</span></h4>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>
        {`
          @media print {
            .no-print { display: none !important; }
            .print-only { display: block !important; }
            @page { margin: 0; size: auto; }
            body { background: white; }
          }
          .print-only { display: none; }
          .sticker-container {
            width: 80mm;
            padding: 10mm;
            font-family: 'Space Grotesk', sans-serif;
            color: black;
            background: white;
            border: 1px solid #eee;
          }
        `}
      </style>
      
      {selectedLead && (
        <div className="print-only fixed inset-0 bg-white z-[999999]">
          <div className="sticker-container mx-auto">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-display font-black uppercase tracking-tighter">SWOOP</h1>
              <div className="w-8 h-[2px] bg-black mx-auto my-2"></div>
              <p className="text-[10px] font-black uppercase tracking-widest">BON DE COMMANDE</p>
            </div>

            <div className="space-y-4 mb-6 border-b border-dashed border-zinc-200 pb-4">
              <div className="flex justify-between items-center text-[10px] font-black">
                <span className="text-zinc-400">ID:</span>
                <span>{selectedLead.order_id}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-black">
                <span className="text-zinc-400">DATE:</span>
                <span>{new Date(selectedLead.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>

            <div className="space-y-2 mb-6 border-b border-dashed border-zinc-200 pb-4">
              <div className="flex flex-col gap-1">
                <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">CLIENT:</span>
                <span className="text-xs font-black uppercase">{selectedLead.customer_name}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">TEL:</span>
                <span className="text-xs font-black">{selectedLead.customer_phone}</span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest block mb-2">ARTICLES:</span>
              {parseDetails(selectedLead.details).map((item, i) => (
                <div key={i} className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="text-[9px] font-black uppercase leading-tight">{item.name}</p>
                    <p className="text-[8px] font-bold text-zinc-500 uppercase">T: {item.size} • C: {item.color}</p>
                  </div>
                  <span className="text-[10px] font-black italic">X{item.qty}</span>
                </div>
              ))}
            </div>

            <div className="bg-zinc-50 p-4 rounded-xl flex justify-between items-center mb-8">
              <span className="text-[8px] font-black uppercase text-zinc-400">TOTAL</span>
              <span className="text-sm font-black italic">{selectedLead.total_price} MAD</span>
            </div>

            <div className="text-center space-y-4">
              <img 
                src="https://raw.githubusercontent.com/yahyabmk01/Aymen-Clothes/main/frame%20(1).png" 
                className="w-24 h-24 mx-auto object-contain"
                alt="SWOOP QR"
              />
              <p className="text-[9px] font-black uppercase tracking-widest leading-relaxed">
                MERCI POUR VOTRE CONFIANCE.<br/>
                <span className="text-zinc-400">FOLLOW US @aymen_shopv5_collection</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;