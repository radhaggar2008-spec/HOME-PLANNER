import React, { useState, useEffect } from 'react';
import { 
  UserProfile, 
  FloorPlanItem, 
  StoreProduct, 
  CartItem, 
  ActiveTab, 
  AIInteriorSuggestion,
  Order 
} from './types';
import { INITIAL_FLOOR_PLAN_ITEMS, STORE_PRODUCTS } from './data/storeProducts';
import { INITIAL_MOCK_ORDERS } from './data/mockOrders';
import { OnboardingModal } from './components/OnboardingModal';
import { ThreeFloorPlanViewer } from './components/ThreeFloorPlanViewer';
import { AIPlanGenerator } from './components/AIPlanGenerator';
import { StoreCatalog } from './components/StoreCatalog';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { InspirationsView } from './components/InspirationsView';
import { WishlistView } from './components/WishlistView';
import { OrdersSection } from './components/OrdersSection';
import { 
  ShoppingBag, 
  User, 
  Sparkles, 
  Compass, 
  Sliders, 
  Layers, 
  ArrowRight,
  Shield,
  Heart,
  Package,
  Truck,
  HelpCircle
} from 'lucide-react';

export default function App() {
  // User Onboarding State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('nivaas_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => !userProfile);

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('3d-studio');

  // Compute user-specific storage keys
  const getStorageKey = (prefix: string, username?: string) => {
    return username 
      ? `nivaas_${prefix}_${username.toLowerCase().replace(/\s+/g, '_')}` 
      : `nivaas_${prefix}_guest`;
  };

  // User-Specific Wishlist State (synced to localStorage)
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const key = getStorageKey('wishlist', userProfile?.username);
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
      return ['prod-teak-chair', 'prod-brass-lamp'];
    } catch {
      return ['prod-teak-chair', 'prod-brass-lamp'];
    }
  });

  // User-Specific Orders State (synced to localStorage)
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const key = getStorageKey('orders', userProfile?.username);
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
      return INITIAL_MOCK_ORDERS;
    } catch {
      return INITIAL_MOCK_ORDERS;
    }
  });

  // Switch or reload user data when user profile changes
  useEffect(() => {
    try {
      const wKey = getStorageKey('wishlist', userProfile?.username);
      const savedWishlist = localStorage.getItem(wKey);
      if (savedWishlist) setWishlistIds(JSON.parse(savedWishlist));

      const oKey = getStorageKey('orders', userProfile?.username);
      const savedOrders = localStorage.getItem(oKey);
      if (savedOrders) setOrders(JSON.parse(savedOrders));
    } catch (e) {
      console.warn('Error loading user data:', e);
    }
  }, [userProfile?.username]);

  // Persist user-specific wishlist
  useEffect(() => {
    try {
      const key = getStorageKey('wishlist', userProfile?.username);
      localStorage.setItem(key, JSON.stringify(wishlistIds));
    } catch (e) {
      console.warn('Error saving user wishlist:', e);
    }
  }, [wishlistIds, userProfile?.username]);

  // Persist user-specific orders
  useEffect(() => {
    try {
      const key = getStorageKey('orders', userProfile?.username);
      localStorage.setItem(key, JSON.stringify(orders));
    } catch (e) {
      console.warn('Error saving user orders:', e);
    }
  }, [orders, userProfile?.username]);

  // Toggle product in wishlist
  const handleToggleWishlist = (productId: string) => {
    setWishlistIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // 3D Floor Plan Items State
  const [floorPlanItems, setFloorPlanItems] = useState<FloorPlanItem[]>(() => {
    try {
      const saved = localStorage.getItem('nivaas_floor_plan_items');
      return saved ? JSON.parse(saved) : INITIAL_FLOOR_PLAN_ITEMS;
    } catch {
      return INITIAL_FLOOR_PLAN_ITEMS;
    }
  });

  // Shopping Bag / Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('nivaas_cart_items');
      return saved ? JSON.parse(saved) : [
        // Seed with a welcoming first piece for instant discovery
        { product: STORE_PRODUCTS[0], quantity: 1, selectedFinish: 'teak' }
      ];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Sync state to local storage
  useEffect(() => {
    try {
      if (userProfile) {
        localStorage.setItem('nivaas_user_profile', JSON.stringify(userProfile));
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [userProfile]);

  useEffect(() => {
    try {
      localStorage.setItem('nivaas_floor_plan_items', JSON.stringify(floorPlanItems));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [floorPlanItems]);

  useEffect(() => {
    try {
      localStorage.setItem('nivaas_cart_items', JSON.stringify(cartItems));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [cartItems]);

  // Cart operations
  const handleAddToCart = (product: StoreProduct, finish?: string) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, selectedFinish: finish || 'Natural Teak' }];
    });
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleAddAllWishlistToCart = () => {
    const productsToAdd = STORE_PRODUCTS.filter((p) => wishlistIds.includes(p.id));
    productsToAdd.forEach((p) => handleAddToCart(p));
    setIsCartOpen(true);
  };

  const handleOrderSuccess = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    setCartItems([]);
  };

  const handleVisualizeOrderIn3D = (order: Order) => {
    // Convert order items to 3D models
    const new3DItems: FloorPlanItem[] = order.items.map((it, idx) => {
      let pos: [number, number, number] = [idx * 0.9 - 0.45, 0, 0.2];
      if (it.product.modelType === 'sofa') pos = [0, 0, 1.1];
      else if (it.product.modelType === 'coffee-table') pos = [0, 0, 0.05];
      else if (it.product.modelType === 'lounge-chair') pos = [-1.45, 0, 0.25];
      else if (it.product.modelType === 'floor-lamp') pos = [1.5, 0, 1.35];

      return {
        id: `purchased-${order.id}-${idx}`,
        name: it.product.name,
        category: it.product.category === 'Lighting' ? 'lighting' : it.product.category === 'Seating' ? 'seating' : 'tables',
        position: pos,
        rotation: 0,
        scale: [1, 1, 1],
        color: it.product.category === 'Lighting' ? '#D4AF37' : '#8E5A36',
        finish: (it.finish as any) || 'teak',
        storeItemId: it.product.id,
        dimensionsText: it.product.dimensions,
        isLightSource: it.product.category === 'Lighting',
        lightIntensity: 1.8,
        lightColor: '#FFE2A4',
      };
    });

    setFloorPlanItems(new3DItems);
    setActiveTab('3d-studio');
  };

  const handleVisualizeIn3D = (product: StoreProduct) => {
    const alreadyInScene = floorPlanItems.some((it) => it.storeItemId === product.id);
    if (!alreadyInScene) {
      const newItem: FloorPlanItem = {
        id: `item-${Date.now()}`,
        name: product.name,
        category: product.category === 'Lighting' ? 'lighting' : product.category === 'Seating' ? 'seating' : product.category === 'Bedroom' ? 'beds' : 'tables',
        position: [0.1, 0, 0.1],
        rotation: 0,
        scale: [1, 1, 1],
        color: product.category === 'Lighting' ? '#D4AF37' : '#8E5A36',
        finish: product.category === 'Lighting' ? 'brass' : 'teak',
        storeItemId: product.id,
        dimensionsText: product.dimensions,
        isLightSource: product.category === 'Lighting',
        lightIntensity: 1.8,
        lightColor: '#FFE2A4',
      };
      setFloorPlanItems((prev) => [...prev, newItem]);
    }
    setActiveTab('3d-studio');
  };

  const handleApplyAIPlan = (newItems: FloorPlanItem[], _suggestion: AIInteriorSuggestion) => {
    setFloorPlanItems(newItems);
    setActiveTab('3d-studio');
  };

  const handleLoadInspirationConcept = (conceptId: string) => {
    if (conceptId === 'kerala-courtyard') {
      setFloorPlanItems([
        {
          id: 'item-chair-kerala-1',
          name: 'Jodhpur Cane & Teak Armchair',
          category: 'seating',
          position: [-1.2, 0, 0.4],
          rotation: 0.8,
          scale: [1, 1, 1],
          color: '#7C4A28',
          finish: 'cane',
          storeItemId: 'prod-teak-chair',
          dimensionsText: '74 × 82 cm',
        },
        {
          id: 'item-chair-kerala-2',
          name: 'Pair Teak Armchair',
          category: 'seating',
          position: [1.2, 0, 0.4],
          rotation: -0.8,
          scale: [1, 1, 1],
          color: '#7C4A28',
          finish: 'cane',
          storeItemId: 'prod-teak-chair',
          dimensionsText: '74 × 82 cm',
        },
        {
          id: 'item-table-kerala',
          name: 'Organic Teak Coffee Table',
          category: 'tables',
          position: [0, 0, 0.2],
          rotation: 0,
          scale: [1.1, 1, 1.1],
          color: '#8E5A36',
          finish: 'teak',
          storeItemId: 'prod-coffee-table',
          dimensionsText: '125 × 68 cm',
        },
        {
          id: 'item-lamp-kerala',
          name: 'Moradabad Brass Floor Lamp',
          category: 'lighting',
          position: [-1.7, 0, 1.4],
          rotation: 0.3,
          scale: [1, 1, 1],
          color: '#D4AF37',
          finish: 'brass',
          storeItemId: 'prod-brass-lamp',
          isLightSource: true,
          dimensionsText: 'Dia 42 × H 152 cm',
        },
        {
          id: 'item-rug-kerala',
          name: 'Hand-Knotted Raw Wool Rug',
          category: 'decor',
          position: [0, 0.01, 0.5],
          rotation: 0,
          scale: [1, 1, 1],
          color: '#DDD5C7',
          finish: 'boucle',
          storeItemId: 'prod-wool-rug',
          dimensionsText: '240 × 170 cm',
        },
      ]);
    } else {
      setFloorPlanItems(INITIAL_FLOOR_PLAN_ITEMS);
    }
    setActiveTab('3d-studio');
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistProducts = STORE_PRODUCTS.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D241E] flex flex-col font-sans selection:bg-[#EADBC8] selection:text-stone-900">
      {/* Onboarding & User Profile Dialog */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onSaveProfile={(profile) => setUserProfile(profile)}
        currentProfile={userProfile}
        isMandatory={!userProfile}
        orders={orders}
        onTrackOrderInFullView={(orderId) => {
          setActiveTab('orders');
        }}
        onNavigateToStore={() => setActiveTab('store')}
      />

      {/* Cart Slide-Over Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        userProfile={userProfile}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        userProfile={userProfile}
        onOrderSuccess={handleOrderSuccess}
        onTrackOrder={(orderId) => {
          setActiveTab('orders');
        }}
      />

      {/* Strict Top Bar Contract: Zone 1 (Wordmark) - Zone 2 (Nav Links) - Zone 3 (Primary Action Group) */}
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 border-b border-[#E5DDD2] backdrop-blur-md px-6 md:px-12 py-3.5 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element in display face, whitespace-nowrap shrink-0) */}
        <button
          onClick={() => setActiveTab('3d-studio')}
          className="text-2xl font-serif font-bold tracking-tight text-stone-900 whitespace-nowrap shrink-0 text-left hover:text-[#C26343] transition cursor-pointer"
        >
          Nivaas
        </button>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
          <button
            onClick={() => setActiveTab('3d-studio')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeTab === '3d-studio'
                ? 'text-stone-950 border-b-2 border-[#C26343] font-semibold'
                : 'hover:text-stone-950'
            }`}
          >
            3D Studio
          </button>
          <button
            onClick={() => setActiveTab('ai-planner')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeTab === 'ai-planner'
                ? 'text-stone-950 border-b-2 border-[#C26343] font-semibold'
                : 'hover:text-stone-950'
            }`}
          >
            AI Planner
          </button>
          <button
            onClick={() => setActiveTab('store')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeTab === 'store'
                ? 'text-stone-950 border-b-2 border-[#C26343] font-semibold'
                : 'hover:text-stone-950'
            }`}
          >
            Curated Store (₹)
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'orders'
                ? 'text-stone-950 border-b-2 border-[#C26343] font-semibold'
                : 'hover:text-stone-950'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-[#C26343]" />
            <span>My Orders</span>
            {orders.length > 0 && (
              <span className="text-[11px] font-mono font-bold text-[#C26343]">
                ({orders.length})
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'wishlist'
                ? 'text-stone-950 border-b-2 border-[#C26343] font-semibold'
                : 'hover:text-stone-950'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${wishlistIds.length > 0 ? 'fill-[#C26343] text-[#C26343]' : ''}`} />
            <span>Wishlist</span>
            {wishlistIds.length > 0 && (
              <span className="text-[11px] font-mono font-bold text-[#C26343]">
                ({wishlistIds.length})
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('inspirations')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeTab === 'inspirations'
                ? 'text-stone-950 border-b-2 border-[#C26343] font-semibold'
                : 'hover:text-stone-950'
            }`}
          >
            Inspirations
          </button>
        </nav>

        {/* Zone 3: Primary Action Group (Profile Greeting, Wishlist, Orders & Bag) */}
        <div className="flex items-center gap-3 shrink-0">
          {userProfile ? (
            <button
              onClick={() => setIsOnboardingOpen(true)}
              title="Profile & Orders"
              className="hidden sm:flex items-center gap-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap shrink-0"
            >
              <User className="w-3.5 h-3.5 text-stone-500" />
              <span>Namaste, {userProfile.username.split(' ')[0]}</span>
            </button>
          ) : (
            <button
              onClick={() => setIsOnboardingOpen(true)}
              className="text-xs font-medium text-stone-700 hover:text-stone-950 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Sign In
            </button>
          )}

          {/* Quick Orders Tracking Shortcut */}
          <button
            onClick={() => setActiveTab('orders')}
            title="My Orders & Tracking"
            className={`relative p-2 rounded-lg transition cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#EADBC8] text-[#C26343]'
                : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100'
            }`}
          >
            <Package className="w-4 h-4 text-stone-700" />
            {orders.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#4A382D] text-white text-[10px] font-mono font-bold rounded-full flex items-center justify-center">
                {orders.length}
              </span>
            )}
          </button>

          {/* Quick Wishlist Icon */}
          <button
            onClick={() => setActiveTab('wishlist')}
            title="View Wishlist"
            className={`relative p-2 rounded-lg transition cursor-pointer ${
              activeTab === 'wishlist'
                ? 'bg-[#EADBC8] text-[#C26343]'
                : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100'
            }`}
          >
            <Heart className={`w-4 h-4 ${wishlistIds.length > 0 ? 'fill-[#C26343] text-[#C26343]' : ''}`} />
            {wishlistIds.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C26343] text-white text-[10px] font-mono font-bold rounded-full flex items-center justify-center">
                {wishlistIds.length}
              </span>
            )}
          </button>

          {/* Shopping Bag Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-[#4A382D] hover:bg-[#3B2C23] text-white text-xs font-semibold rounded-lg shadow-xs transition whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#E7C797]" />
            <span>Bag</span>
            <span className="bg-[#C26343] text-white px-1.5 py-0.2 rounded-full font-mono text-[11px]">
              {totalCartCount}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Tab Strip */}
      <div className="flex md:hidden items-center justify-around bg-white border-b border-stone-200 px-2 py-2 text-xs font-medium text-stone-600 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('3d-studio')}
          className={`py-1 px-2 rounded-md whitespace-nowrap ${
            activeTab === '3d-studio' ? 'bg-[#EFE9DF] text-[#C26343] font-bold' : ''
          }`}
        >
          3D Studio
        </button>
        <button
          onClick={() => setActiveTab('ai-planner')}
          className={`py-1 px-2 rounded-md whitespace-nowrap ${
            activeTab === 'ai-planner' ? 'bg-[#EFE9DF] text-[#C26343] font-bold' : ''
          }`}
        >
          AI Planner
        </button>
        <button
          onClick={() => setActiveTab('store')}
          className={`py-1 px-2 rounded-md whitespace-nowrap ${
            activeTab === 'store' ? 'bg-[#EFE9DF] text-[#C26343] font-bold' : ''
          }`}
        >
          Store (₹)
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-1 px-2 rounded-md whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'orders' ? 'bg-[#EFE9DF] text-[#C26343] font-bold' : ''
          }`}
        >
          <Truck className="w-3 h-3 text-[#C26343]" />
          <span>Orders ({orders.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`py-1 px-2 rounded-md whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'wishlist' ? 'bg-[#EFE9DF] text-[#C26343] font-bold' : ''
          }`}
        >
          <Heart className={`w-3 h-3 ${wishlistIds.length > 0 ? 'fill-[#C26343]' : ''}`} />
          <span>Saved ({wishlistIds.length})</span>
        </button>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Tab 1: 3D Floor Plan Studio */}
        {activeTab === '3d-studio' && (
          <div className="space-y-6">
            {/* Viewport Subtitle & Editorial Kicker */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
                  Interactive 3D Floor Plan & Customizer
                </h1>
                <p className="text-xs sm:text-sm text-stone-600 mt-1">
                  Touch screen responsive: rotate, pinch-zoom, and adjust wood finishes & fabrics. Buy matching pieces in Indian Rupees.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('ai-planner')}
                  className="px-3.5 py-1.5 bg-white border border-stone-300 hover:border-stone-400 text-stone-800 text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C26343]" />
                  <span>AI Room Suggestions</span>
                </button>
                <button
                  onClick={() => setActiveTab('store')}
                  className="px-3.5 py-1.5 bg-[#C26343] hover:bg-[#B05537] text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Shop Store</span>
                </button>
              </div>
            </div>

            {/* Three.js 3D Viewport with Touch Gesture Controls */}
            <ThreeFloorPlanViewer
              items={floorPlanItems}
              onItemsChange={setFloorPlanItems}
              onAddToCart={handleAddToCart}
              onNavigateToStore={(_prodId) => {
                setActiveTab('store');
              }}
            />

            {/* Architectural Trust & Craft Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#E5DDD2] text-stone-600 text-xs">
              <div className="p-4 bg-white border border-stone-200 rounded-xl">
                <h5 className="font-semibold text-stone-900 mb-1 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#C26343]" />
                  <span>True-to-Scale PBR Physics</span>
                </h5>
                <p className="text-stone-500 leading-relaxed">
                  Furniture models feature exact architectural dimensions (1 unit = 1 meter) with realistic warm ambient contact shadows.
                </p>
              </div>

              <div className="p-4 bg-white border border-stone-200 rounded-xl">
                <h5 className="font-semibold text-stone-900 mb-1 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#C26343]" />
                  <span>Touch D-Pad & Swatches</span>
                </h5>
                <p className="text-stone-500 leading-relaxed">
                  Tap any piece in the 3D scene to activate touch position joysticks, 22.5° rotation steppers, and solid timber swatches.
                </p>
              </div>

              <div className="p-4 bg-white border border-stone-200 rounded-xl">
                <h5 className="font-semibold text-stone-900 mb-1 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#C26343]" />
                  <span>Direct Indian Rupee Checkout</span>
                </h5>
                <p className="text-stone-500 leading-relaxed">
                  Every 3D model links directly to our verified Indian artisans in Jodhpur, Nilambur, and Moradabad with free white-glove delivery.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: AI Floor Plan & Style Suggestion Generator */}
        {activeTab === 'ai-planner' && (
          <AIPlanGenerator
            onApplyPlanTo3D={handleApplyAIPlan}
            onAddToCart={handleAddToCart}
            onSwitchTo3DTab={() => setActiveTab('3d-studio')}
          />
        )}

        {/* Tab 3: Curated Furniture Store in Indian Rupees */}
        {activeTab === 'store' && (
          <StoreCatalog
            onAddToCart={handleAddToCart}
            onVisualizeIn3D={handleVisualizeIn3D}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onNavigateToWishlist={() => setActiveTab('wishlist')}
          />
        )}

        {/* Tab 4: My Orders & Shipment Tracking */}
        {activeTab === 'orders' && (
          <OrdersSection
            orders={orders}
            onUpdateOrders={setOrders}
            onVisualizeOrderIn3D={handleVisualizeOrderIn3D}
            onNavigateToStore={() => setActiveTab('store')}
          />
        )}

        {/* Tab 5: My Wishlist */}
        {activeTab === 'wishlist' && (
          <WishlistView
            wishlistProducts={wishlistProducts}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onVisualizeIn3D={handleVisualizeIn3D}
            onNavigateToStore={() => setActiveTab('store')}
            onAddAllWishlistToCart={handleAddAllWishlistToCart}
          />
        )}

        {/* Tab 6: Curated Inspirations */}
        {activeTab === 'inspirations' && (
          <InspirationsView
            onLoadConcept={handleLoadInspirationConcept}
          />
        )}
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="mt-auto border-t border-[#E5DDD2] bg-[#FAF7F2] py-8 text-stone-500 text-xs">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-serif font-bold text-stone-800 text-sm">Nivaas</span>
            <span>·</span>
            <span>Warm 3D Home Planning & Artisanal Furniture</span>
          </div>

          <div className="flex items-center gap-6">
            <span>Prices in Indian Rupees (₹)</span>
            <span>·</span>
            <span>Crafted with Indian Hardwoods & Brass</span>
            <span>·</span>
            <button
              onClick={() => setIsOnboardingOpen(true)}
              className="text-[#C26343] hover:underline cursor-pointer"
            >
              Account Details & Orders
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
