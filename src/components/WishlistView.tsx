import React from 'react';
import { StoreProduct } from '../types';
import { 
  Heart, 
  ShoppingBag, 
  Eye, 
  Trash2, 
  ArrowRight, 
  Sparkles,
  Layers,
  Star
} from 'lucide-react';

interface WishlistViewProps {
  wishlistProducts: StoreProduct[];
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: StoreProduct) => void;
  onVisualizeIn3D: (product: StoreProduct) => void;
  onNavigateToStore: () => void;
  onAddAllWishlistToCart: () => void;
}

export const WishlistView: React.FC<WishlistViewProps> = ({
  wishlistProducts,
  onToggleWishlist,
  onAddToCart,
  onVisualizeIn3D,
  onNavigateToStore,
  onAddAllWishlistToCart,
}) => {
  const totalWishlistINR = wishlistProducts.reduce(
    (acc, prod) => acc + prod.priceINR,
    0
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E5DDD2] pb-6">
        <div>
          <div className="flex items-center gap-2 text-[#C26343] text-xs font-semibold uppercase tracking-wider mb-1.5">
            <Heart className="w-4 h-4 fill-[#C26343]" />
            <span>Curated Wishlist</span>
          </div>
          <h2 className="text-3xl font-serif font-bold text-stone-900 tracking-tight">
            My Saved Pieces & Sanctuaries
          </h2>
          <p className="mt-1 text-stone-600 text-sm">
            {wishlistProducts.length === 0
              ? 'Save your preferred handcrafted furniture to inspect in 3D or purchase later.'
              : `You have saved ${wishlistProducts.length} ${
                  wishlistProducts.length === 1 ? 'handcrafted piece' : 'handcrafted pieces'
                } in Indian Rupees.`}
          </p>
        </div>

        {wishlistProducts.length > 0 && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[11px] text-stone-400 block">Wishlist Value</span>
              <span className="font-mono text-lg font-bold text-stone-900">
                ₹{totalWishlistINR.toLocaleString('en-IN')}
              </span>
            </div>
            <button
              onClick={onAddAllWishlistToCart}
              className="px-4 py-2.5 bg-[#4A382D] hover:bg-[#3B2C23] text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#E7C797]" />
              <span>Move All to Bag</span>
            </button>
          </div>
        )}
      </div>

      {/* Empty State */}
      {wishlistProducts.length === 0 ? (
        <div className="py-20 bg-white border border-[#E5DDD2] rounded-2xl text-center p-8 space-y-4 max-w-lg mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-full bg-[#FAF5EC] text-[#C26343] mx-auto flex items-center justify-center border border-[#E8DFC8]">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-xl font-bold text-stone-900">
            Your Wishlist is Empty
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Click the heart icon on any piece in the store or from your AI 3D recommendations to save it here for easy planning and checkout.
          </p>
          <div className="pt-2">
            <button
              onClick={onNavigateToStore}
              className="px-5 py-2.5 bg-[#C26343] hover:bg-[#B05537] text-white text-xs font-semibold rounded-xl shadow-xs transition inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Explore Curated Store</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* Wishlist Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white border border-[#E5DDD2] rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Image & Quick Action */}
                <div className="relative h-64 bg-[#F5EFE6] overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Wishlist Remove Button */}
                  <button
                    onClick={() => onToggleWishlist(product.id)}
                    title="Remove from Wishlist"
                    className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-[#C26343] rounded-full shadow-md backdrop-blur-xs transition cursor-pointer"
                  >
                    <Heart className="w-4 h-4 fill-[#C26343]" />
                  </button>

                  {/* Clean unboxed tag */}
                  <div className="absolute top-3 left-3 bg-[#FAF7F2]/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-medium text-stone-800 shadow-xs">
                    {product.category}
                  </div>

                  {/* View in 3D Button */}
                  <button
                    onClick={() => onVisualizeIn3D(product)}
                    className="absolute bottom-3 right-3 bg-white/95 hover:bg-white text-stone-800 px-3 py-1.5 rounded-lg text-xs font-medium shadow-md flex items-center gap-1.5 backdrop-blur-xs transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#C26343]" />
                    <span>View in 3D</span>
                  </button>
                </div>

                {/* Details */}
                <div className="p-5">
                  <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                    <span className="text-[11px] font-medium text-stone-400">
                      {product.origin}
                    </span>
                    <div className="flex items-center gap-1 text-stone-700 font-mono text-[11px]">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>{product.rating}</span>
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
                  <span className="text-[11px] text-stone-500">In Stock</span>
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
                    onClick={() => onAddToCart(product)}
                    className="py-2.5 px-3 text-xs font-semibold bg-[#C26343] hover:bg-[#B05537] text-white rounded-lg shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add to Bag</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
