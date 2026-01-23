
import React, { useState } from 'react';

const Footer: React.FC = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const LegalModal = ({ title, content }: { title: string, content: string }) => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setActiveModal(null)} />
      <div className="relative bg-white w-full max-w-2xl max-h-[80vh] overflow-y-auto p-12 rounded-3xl shadow-2xl">
        <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 text-zinc-400 hover:text-black">
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>
        <h2 className="text-3xl font-display font-black uppercase mb-8 tracking-tighter">{title}</h2>
        <div className="text-zinc-500 text-sm leading-relaxed space-y-4 whitespace-pre-line">
          {content}
        </div>
      </div>
    </div>
  );

  const infoContent = {
    faq: "• Comment commander ?\nAjoutez vos articles au panier et finalisez via WhatsApp. Un agent confirmera votre taille.\n\n• Les tailles taillent-elles normalement ?\nNos hoodies sont 'Oversized'. Prenez votre taille habituelle pour un look large.\n\n• Puis-je modifier ma commande ?\nTant que le colis n'est pas expédié, contactez-nous sur WhatsApp.",
    shipping: "• Délais : 24h à 48h jours ouvrables.\n• Villes : Partout au Maroc.\n• Tarif : Livraison fixe à 35 MAD (Gratuite dès 800 MAD d'achat).\n• Suivi : Vous recevrez un SMS de notre transporteur dès l'expédition.",
    returns: "• Échanges : Autorisés sous 7 jours pour problème de taille (produit non porté, étiquette intacte).\n• Remboursements : Uniquement en cas de défaut de fabrication.\n• Frais de retour : À la charge du client pour les échanges de taille."
  };

  return (
    <footer id="footer" className="bg-white border-t border-zinc-200 py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="text-3xl font-bold tracking-tighter text-black mb-6">
              SWOOP<span className="text-gold">.</span>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              La destination ultime pour le streetwear premium au Maroc. Redéfinir l'élégance urbaine à travers chaque drop.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.instagram.com/aymen_shopv5_collection/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center bg-zinc-50 border border-zinc-200 text-black hover:text-white hover:bg-black transition-all duration-300 rounded-full shadow-sm"
              >
                <i className="fa-brands fa-instagram"></i>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-black font-bold uppercase tracking-widest text-sm mb-6">Boutique</h4>
            <ul className="space-y-4 text-zinc-500 text-sm">
              <li><a href="#boutique" className="hover:text-black transition-colors">Toutes les pièces</a></li>
              <li><a href="#boutique" className="hover:text-black transition-colors">Nouveautés</a></li>
              <li><a href="#boutique" className="hover:text-black transition-colors">Hoodies & Sweats</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-black font-bold uppercase tracking-widest text-sm mb-6">Informations</h4>
            <ul className="space-y-4 text-zinc-500 text-sm">
              <li><button onClick={() => setActiveModal('Livraison')} className="hover:text-black transition-colors">Livraison & Suivi</button></li>
              <li><button onClick={() => setActiveModal('Retours')} className="hover:text-black transition-colors">Échanges & Retours</button></li>
              <li><button onClick={() => setActiveModal('FAQ')} className="hover:text-black transition-colors">FAQ</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-black font-bold uppercase tracking-widest text-sm mb-6">Mouvement</h4>
            <p className="text-zinc-400 text-xs uppercase tracking-widest leading-loose">
              Basé à Casablanca.<br/>
              Expédition nationale.<br/>
              Support WhatsApp 7j/7.<br/>
              Paiement à la livraison.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-200 flex flex-col md:flex-row justify-between items-center text-zinc-400 text-[10px] uppercase tracking-[0.2em]">
          <p>© {new Date().getFullYear()} SWOOP CLOTHING MAROC. ALL RIGHTS RESERVED.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <button onClick={() => setActiveModal('Privacy')} className="hover:text-black transition-colors">Confidentialité</button>
            <button onClick={() => setActiveModal('Terms')} className="hover:text-black transition-colors">Conditions de Vente</button>
          </div>
        </div>
      </div>

      {activeModal === 'Livraison' && <LegalModal title="Livraison" content={infoContent.shipping} />}
      {activeModal === 'Retours' && <LegalModal title="Retours & Échanges" content={infoContent.returns} />}
      {activeModal === 'FAQ' && <LegalModal title="Foire Aux Questions" content={infoContent.faq} />}
      {activeModal === 'Privacy' && <LegalModal title="Confidentialité" content="Vos données sont utilisées uniquement pour le traitement de vos commandes. Nous ne partageons aucune information personnelle avec des tiers à des fins commerciales." />}
      {activeModal === 'Terms' && <LegalModal title="Conditions de Vente" content="Toute commande passée sur SWOOP implique l'acceptation sans réserve des conditions de vente. Les prix sont affichés en MAD. Le paiement s'effectue à la réception du colis." />}
    </footer>
  );
};

export default Footer;
