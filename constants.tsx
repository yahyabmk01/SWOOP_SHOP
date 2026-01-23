import { Product, Feature } from './types';

export const WHATSAPP_NUMBER = "+212600000000"; 
export const BRAND_NAME = "SWOOP";

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Oversized Hoodie 'Legacy'",
    price: 499,
    image: "https://picsum.photos/seed/hoodie1/800/1000",
    category: "Hoodies"
  },
  {
    id: 2,
    name: "Cargo Pants 'Nomad' Black",
    price: 399,
    image: "https://picsum.photos/seed/cargo1/800/1000",
    category: "Pants"
  },
  {
    id: 3,
    name: "Graphic Tee 'Cyber' Edition",
    price: 249,
    image: "https://picsum.photos/seed/tee1/800/1000",
    category: "T-Shirts"
  },
  {
    id: 4,
    name: "Varsity Jacket 'Atlas'",
    price: 899,
    image: "https://picsum.photos/seed/jacket1/800/1000",
    category: "Outerwear"
  },
  {
    id: 5,
    name: "SWOOP Signature Cap",
    price: 199,
    image: "https://picsum.photos/seed/cap1/800/1000",
    category: "Accessories"
  },
  {
    id: 6,
    name: "Joggers 'Stealth' Gold-Trim",
    price: 349,
    image: "https://picsum.photos/seed/joggers1/800/1000",
    category: "Pants"
  },
  {
    id: 7,
    name: "STREET BUNDLE #01",
    price: 999,
    image: "https://picsum.photos/seed/bundle1/800/1000",
    category: "Packs"
  }
];

export const FEATURES: Feature[] = [
  {
    id: 1,
    icon: "fa-gem",
    title: "Qualité Supérieure",
    description: "Des matériaux premium sélectionnés pour leur durabilité et leur confort exceptionnel."
  },
  {
    id: 2,
    icon: "fa-truck-fast",
    title: "Livraison Rapide",
    description: "Expédition partout au Maroc sous 24h à 48h. Suivi de colis en temps réel."
  },
  {
    id: 3,
    icon: "fa-wallet",
    title: "Paiement Sécurisé",
    description: "Paiement à la livraison partout au Maroc ou par carte bancaire sécurisée."
  },
  {
    id: 4,
    icon: "fa-crown",
    title: "Design Exclusif",
    description: "Éditions limitées conçues par nos designers pour un style unique et urbain."
  }
];