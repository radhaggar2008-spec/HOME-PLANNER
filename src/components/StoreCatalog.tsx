import React, { useState } from 'react';
import { StoreProduct } from '../types';
import { STORE_PRODUCTS } from '../data/storeProducts';
import { 
  ShoppingBag, 
  Search, 
  Sparkles, 
  Check, 
  Truck, 
  ShieldCheck, 
  Layers,
  Star,
  Eye,
  Heart,
  SlidersHorizontal,
  RotateCcw,
  IndianRupee
} from 'lucide-react';

interface StoreCatalogProps {
  onAddToCart: (product: StoreProduct) => void;
  onVisualizeIn3D: (product: StoreProduct) => void;
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  onNavigateToWishlist?: () => void;
}

type PricePreset = 'all' | 'under-10k' | '10k-25k' | '25k-50k' | 'above-50k' | 'custom-slider';

export const StoreCatalog: React.FC<StoreCatalogProps> = ({
  onAddToCart,
  onVisualizeIn3D,
  wishlistIds,
  onToggleWishlist,
  onNavigateToWishlist,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  // Price Filter States
  const [pricePreset, setPricePreset] = useState<PricePreset>('all');
  const [maxPriceLimit, setMaxPriceLimit] = useState<number>(65000);
  const [showSlider, setShowSlider] = useState<boolean>(false);

  const categories = ['All', 'Living Room', 'Seating', 'Bedroom', 'Lighting', 'Decor & Rugs'];

  const pricePresetsList: { id: PricePreset; label: string; sub?: string }[] = [
    { id: 'all', label: 'All Budgets' },
    { id: 'under-10k', label: 'Under ₹10,000' },
    { id: '10k-25k', label: '₹10,000 – ₹25,000' },
    { id: '25k-50k', label: '₹25,000 – ₹50,000' },
    { id: 'above-50k', label: 'Above ₹50,000' },
  ];

  // Filtering products
  const filteredProducts = STORE_PRODUCTS.filter((product) => {
    // Category match
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;

    // Search query match
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.material.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.origin.toLowerCase().includes(searchQuery.toLowerCase());

    // Price range match
    let matchesPrice = true;
    if (pricePreset === 'under-10k') {
      matchesPrice = product.priceINR < 10000;
    } else if (pricePreset === '10k-25k') {
      matchesPrice = product.priceINR >= 10000 && product.priceINR <= 25000;
    } else if (pricePreset === '25k-50k') {
      matchesPrice = product.priceINR > 25000 && product.priceINR <= 50000;
    } else if (pricePreset === 'above-50k') {
      matchesPrice = product.priceINR > 50000;
    } else if (pricePreset === 'custom-slider') {
      matchesPrice = product.priceINR <= maxPriceLimit;
    }

    return matchesCategory && matchesSearch && matchesPrice;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.priceINR - b.priceINR;
    if (sortBy === 'price-desc') return b.priceINR - a.priceINR;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  const handleAdd = (product: StoreProduct) => {
    onAddToCart(product);
    setAddedIds((prev) => new Set(prev).add(product.id));
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }, 2000);
  };

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setPricePreset('all');
    setMaxPriceLimit(65000);
    setShowSlider(false);
  };

  const isPriceFilterActive = pricePreset !== 'all';

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Editorial Store Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-[#4A382D] text-white p-8 md:p-12 shadow-sm">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#D6C2B0_1px,transparent_1px)] [background-size:20px_20px]" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-[#E7C797] text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Artisanal Living in Indian Rupees (₹)</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#FAF7F2] tracking-tight">
            Handcrafted Solid Teak, Brass & Organic Linens
          </h2>
          <p className="mt-3 text-stone-300 text-sm md:text-base leading-relaxed">
            Every piece is designed for enduring warmth and architectural calm. Handcrafted by master woodworkers across Jodhpur, Nilambur, and Moradabad. Fully configurable in our interactive 3D studio.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-6 text-xs text-stone-300 border-t border-stone-600/60 pt-4">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#E7C797]" />
              <span>Complimentary White-Glove Delivery Across India</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#E7C797]" />
              <span>10-Year Solid Hardwood Structural Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Filter & Controls Section */}
      <div className="bg-white border border-[#E5DDD2] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        {/* Row 1: Category Tabs + Search + Sort */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#C26343] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search, Sort, and Wishlist quick link */}
          <div className="flex items-center gap-2.5">
            {onNavigateToWishlist && (
              <button
                onClick={onNavigateToWishlist}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#F2ECE2] border border-stone-200 rounded-lg text-xs font-medium text-stone-700 transition cursor-pointer whitespace-nowrap"
              >
                <Heart className={`w-3.5 h-3.5 ${wishlistIds.length > 0 ? 'fill-[#C26343] text-[#C26343]' : 'text-stone-500'}`} />
                <span>Wishlist ({wishlistIds.length})</span>
              </button>
            )}

            <div className="relative flex items-center w-full md:w-52">
              <Search className="absolute left-3 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pieces..."
                className="w-full pl-9 pr-3 py-1.5 bg-[#FAF7F2] border border-stone-200 rounded-lg text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#C26343]"
              />
            </div>

            <div className="relative shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="pl-3 pr-8 py-1.5 bg-[#FAF7F2] border border-stone-200 rounded-lg text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#C26343] cursor-pointer"
              >
                <option value="featured">Featured Curations</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Row 2: Price Range Filter (Buttons & Slider) */}
        <div className="pt-3 border-t border-stone-100 space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Price Preset Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-stone-500 uppercase tracking-wider mr-1.5 shrink-0">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#C26343]" />
                <span>Budget:</span>
              </div>

              {pricePresetsList.map((preset) => {
                const isActive = pricePreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setPricePreset(preset.id);
                      if (preset.id !== 'custom-slider') setShowSlider(false);
                    }}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                      isActive
                        ? 'bg-[#4A382D] text-white shadow-2xs font-semibold'
                        : 'bg-[#FAF7F2] text-stone-700 hover:bg-stone-200/80 border border-stone-200/60'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}

              {/* Custom Slider Toggle Button */}
              <button
                onClick={() => {
                  setShowSlider(!showSlider);
                  if (!showSlider) setPricePreset('custom-slider');
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                  pricePreset === 'custom-slider'
                    ? 'bg-[#C26343] text-white shadow-2xs font-semibold'
                    : 'bg-[#FAF7F2] text-stone-700 hover:bg-stone-200/80 border border-stone-200/60'
                }`}
              >
                <span>Slider</span>
                <span className="text-[10px] opacity-75">
                  (≤ ₹{maxPriceLimit.toLocaleString('en-IN')})
                </span>
              </button>

              {/* Reset Filter Button */}
              {isPriceFilterActive && (
                <button
                  onClick={() => {
                    setPricePreset('all');
                    setShowSlider(false);
                    setMaxPriceLimit(65000);
                  }}
                  className="px-2 py-1 text-stone-500 hover:text-stone-800 text-xs flex items-center gap-1 transition cursor-pointer"
                  title="Clear price filter"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Live Count Indicator */}
            <div className="text-xs text-stone-500 flex items-center gap-2 shrink-0">
              <span>
                Showing <strong className="text-stone-900 font-semibold">{filteredProducts.length}</strong>{' '}
                {filteredProducts.length === 1 ? 'piece' : 'pieces'}
              </span>
              {isPriceFilterActive && (
                <span className="text-[#C26343] font-mono text-[11px] bg-[#FAF5EC] px-2 py-0.5 rounded border border-[#EADBCA]">
                  Filtered by INR Budget
                </span>
              )}
            </div>
          </div>

          {/* Interactive Range Slider (when Slider mode is active or toggled) */}
          {showSlider && (
            <div className="bg-[#FAF7F2] border border-[#E5DDD2] rounded-xl p-3.5 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600 font-medium">
                  Custom Maximum Budget:
                </span>
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-base font-bold text-[#C26343]">
                    ₹{maxPriceLimit.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-stone-400">max</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-stone-400">₹3,000</span>
                <input
                  type="range"
                  min="3000"
                  max="65000"
                  step="1000"
                  value={maxPriceLimit}
                  onChange={(e) => {
                    setMaxPriceLimit(Number(e.target.value));
                    setPricePreset('custom-slider');
                  }}
                  className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#C26343]"
                />
                <span className="text-[10px] font-mono text-stone-400">₹65,000</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Cards Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-20 bg-white border border-[#E5DDD2] rounded-2xl text-center p-8 space-y-4 max-w-lg mx-auto shadow-xs">
          <div className="w-14 h-14 rounded-full bg-[#FAF5EC] text-[#C26343] mx-auto flex items-center justify-center border border-[#E8DFC8]">
            <IndianRupee className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-xl font-bold text-stone-900">
            No Furniture Found in this Budget Range
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            We couldn't find pieces matching your price range and category filters. Try expanding your maximum budget or clearing the search.
          </p>
          <div className="pt-2">
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 bg-[#C26343] hover:bg-[#B05537] text-white text-xs font-semibold rounded-xl shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const isAdded = addedIds.has(product.id);
            const isWishlisted = wishlistIds.includes(product.id);
            const discountPercent = Math.round(
              ((product.originalPriceINR - product.priceINR) / product.originalPriceINR) * 100
            );

            return (
              <div
                key={product.id}
                className="bg-white border border-[#E5DDD2] rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Product Image Frame */}
                  <div className="relative h-64 bg-[#F5EFE6] overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Clean unboxed tag */}
                    <div className="absolute top-3 left-3 bg-[#FAF7F2]/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-medium text-stone-800 shadow-xs">
                      {product.tags[0] || 'Artisanal'}
                    </div>

                    {/* Wishlist Heart Icon Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWishlist(product.id);
                      }}
                      aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                      title={isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
                      className={`absolute top-3 right-3 p-2 rounded-full shadow-md backdrop-blur-xs transition-all duration-200 cursor-pointer ${
                        isWishlisted
                          ? 'bg-white text-[#C26343] scale-105'
                          : 'bg-white/80 hover:bg-white text-stone-600 hover:text-[#C26343] hover:scale-110'
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isWishlisted ? 'fill-[#C26343] text-[#C26343] scale-110' : ''
                        }`}
                      />
                    </button>

                    {discountPercent > 0 && (
                      <div className="absolute top-12 left-3 bg-[#4A382D] text-[#FAF7F2] px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                        {discountPercent}% OFF
                      </div>
                    )}

                    {/* Quick 3D Preview Overlay Button */}
                    <button
                      onClick={() => onVisualizeIn3D(product)}
                      className="absolute bottom-3 right-3 bg-white/95 hover:bg-white text-stone-800 px-3 py-1.5 rounded-lg text-xs font-medium shadow-md flex items-center gap-1.5 backdrop-blur-xs opacity-90 hover:opacity-100 transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#C26343]" />
                      <span>View in 3D</span>
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-5">
                    <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                      <span className="uppercase tracking-wider text-[11px] font-medium text-stone-400">
                        {product.category}
                      </span>
                      <div className="flex items-center gap-1 text-stone-700 font-mono text-[11px]">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>{product.rating}</span>
                        <span className="text-stone-400">({product.reviewsCount})</span>
                      </div>
                    </div>

                    <h3 className="font-serif text-base font-bold text-stone-900 group-hover:text-[#C26343] transition line-clamp-1">
                      {product.name}
                    </h3>

                    <p className="text-xs text-stone-600 line-clamp-2 mt-1 leading-relaxed">
                      {product.description}
                    </p>

                    <div className="mt-3 pt-3 border-t border-stone-100 flex flex-col gap-1 text-[11px] text-stone-500">
                      <div className="truncate font-mono">
                        <span className="text-stone-400">Dim:</span> {product.dimensions}
                      </div>
                      <div className="truncate">
                        <span className="text-stone-400">Material:</span> {product.material}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Purchase Footer */}
                <div className="p-5 pt-0">
                  <div className="flex items-baseline justify-between mb-3">
                    <div>
                      <span className="text-lg font-bold font-mono text-stone-900">
                        ₹{product.priceINR.toLocaleString('en-IN')}
                      </span>
                      <span className="ml-2 text-xs line-through text-stone-400 font-mono">
                        ₹{product.originalPriceINR.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-500">Incl. all taxes</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onVisualizeIn3D(product)}
                      className="py-2.5 px-3 border border-stone-300 hover:border-stone-800 text-stone-800 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>3D Studio</span>
                    </button>

                    <button
                      onClick={() => handleAdd(product)}
                      className={`py-2.5 px-3 text-xs font-semibold rounded-lg shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        isAdded
                          ? 'bg-emerald-700 text-white'
                          : 'bg-[#C26343] hover:bg-[#B05537] text-white'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add to Bag</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
