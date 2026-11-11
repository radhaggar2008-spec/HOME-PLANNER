import React from 'react';
import { StoreProduct } from '../types';
import { STORE_PRODUCTS } from '../data/storeProducts';
import { Eye, ArrowUpRight, Sparkles, Compass } from 'lucide-react';

interface InspirationsViewProps {
  onLoadConcept: (conceptId: string) => void;
}

const INSPIRATION_GALLERY = [
  {
    id: 'kerala-courtyard',
    title: 'The Malabar Courtyard Home',
    location: 'Fort Kochi, Kerala',
    description: 'Centering around reclaimed timber colonnades, open central skylight, breathable natural cane armchairs, and earthen terracotta tile floors.',
    image: '/src/assets/images/hero_cozy_living_room_1794412001140.jpg',
    palette: ['#7C4A28', '#BD6443', '#EBE5DA', '#4A5538'],
    materials: 'Nilambur Teak, Moradabad Brass, Hand-Loomed Linen',
  },
  {
    id: 'japandi-mumbai',
    title: 'Warm Japandi Penthouse',
    location: 'Bandra West, Mumbai',
    description: 'Quiet architectural minimalism meeting tactile Indian craftsmanship. Soft curved mango wood tables, layered neutral wool, and warm afternoon light.',
    image: '/src/assets/images/store_artisan_coffee_table_1794412003224.jpg',
    palette: ['#DDD5C7', '#8E5A36', '#FAF7F2', '#2D241E'],
    materials: 'Solid Mango Wood, Raw Wool, Textured Cotton',
  },
  {
    id: 'bangalore-atelier',
    title: 'The Architect’s Garden Suite',
    location: 'Indiranagar, Bengaluru',
    description: 'Slender brass reading luminaires, fiddle leaf fig flora in hand-thrown clay planters, and low-slung conversation lounge seating.',
    image: '/src/assets/images/store_brass_floor_lamp_1794412001903.jpg',
    palette: ['#D4AF37', '#3A4B29', '#E5DDD0', '#694326'],
    materials: 'Spun Brass, Natural Rattan, Terracotta Potting',
  },
  {
    id: 'jaipur-terracotta',
    title: 'Sun-Drenched Sandstone Villa',
    location: 'Civil Lines, Jaipur',
    description: 'Fluted timber media credenzas, artisanal un-dyed wool carpets, and deep terracotta throw accents that glow under evening amber lighting.',
    image: '/src/assets/images/store_teak_lounge_chair_1794412002629.jpg',
    palette: ['#C26343', '#D6C4AD', '#4A3326', '#FFF8EC'],
    materials: 'Hand-Cut Sandstone, Sheesham Joinery, Bikaneri Wool',
  },
];

export const InspirationsView: React.FC<InspirationsViewProps> = ({
  onLoadConcept,
}) => {
  return (
    <div className="space-y-8">
      <div className="max-w-2xl">
        <div className="flex items-center gap-2 text-[#C26343] text-xs font-semibold uppercase tracking-wider mb-1.5">
          <Sparkles className="w-4 h-4" />
          <span>Curated Architectural Sanctuaries</span>
        </div>
        <h2 className="text-3xl font-serif font-bold text-stone-900 tracking-tight">
          Spatial Inspirations for Warm, Tactile Living
        </h2>
        <p className="mt-2 text-stone-600 text-sm leading-relaxed">
          Explore real homes crafted with organic materials, thoughtful circulation corridors, and warm Indian accents. Any concept can be immediately loaded into your interactive 3D studio.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {INSPIRATION_GALLERY.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-[#E5DDD2] rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 group flex flex-col justify-between"
          >
            <div>
              <div className="relative h-64 overflow-hidden bg-stone-100">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 bg-[#FAF7F2]/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-medium text-stone-800 shadow-xs">
                  {item.location}
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-serif text-xl font-bold text-stone-900 group-hover:text-[#C26343] transition">
                  {item.title}
                </h3>
                <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                  {item.description}
                </p>

                <div className="mt-4 pt-4 border-t border-stone-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-stone-500">
                    <span className="text-stone-400">Materials:</span>
                    <span className="font-medium text-stone-700">{item.materials}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-stone-400">Palette:</span>
                    <div className="flex items-center gap-1.5">
                      {item.palette.map((hex, i) => (
                        <span
                          key={i}
                          style={{ backgroundColor: hex }}
                          className="w-4 h-4 rounded-full border border-black/10 shadow-2xs"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0">
              <button
                onClick={() => onLoadConcept(item.id)}
                className="w-full py-2.5 px-4 bg-[#FAF7F2] hover:bg-[#C26343] text-stone-800 hover:text-white border border-stone-300 hover:border-transparent text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>Experience Layout in 3D Studio</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
