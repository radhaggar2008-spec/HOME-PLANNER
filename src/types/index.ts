export interface UserProfile {
  username: string;
  contact: string;
  contactType: 'email' | 'phone';
  city?: string;
  isOnboarded: boolean;
}

export type FurnitureCategory = 'seating' | 'tables' | 'lighting' | 'storage' | 'beds' | 'decor';

export type MaterialFinish = 'teak' | 'walnut' | 'oak' | 'wenge' | 'linen' | 'velvet' | 'boucle' | 'cane' | 'brass';

export interface FloorPlanItem {
  id: string;
  name: string;
  category: FurnitureCategory;
  position: [number, number, number]; // x, y, z in Three.js coordinates
  rotation: number; // Y rotation in radians
  scale: [number, number, number];
  color: string; // hex
  finish: MaterialFinish;
  storeItemId?: string;
  isLightSource?: boolean;
  lightIntensity?: number;
  lightColor?: string;
  colorTemperatureK?: number; // Color temperature in Kelvin (e.g. 2000K to 5500K)
  dimensionsText: string;
}

export interface StoreProduct {
  id: string;
  name: string;
  category: 'Living Room' | 'Bedroom' | 'Seating' | 'Lighting' | 'Decor & Rugs';
  priceINR: number;
  originalPriceINR: number;
  rating: number;
  reviewsCount: number;
  dimensions: string;
  material: string;
  origin: string;
  description: string;
  image: string;
  modelType: 'sofa' | 'lounge-chair' | 'coffee-table' | 'floor-lamp' | 'area-rug' | 'bed' | 'credenza' | 'dining-table' | 'planter';
  inStock: boolean;
  tags: string[];
}

export interface CartItem {
  product: StoreProduct;
  quantity: number;
  selectedFinish?: string;
}

export interface ColorSwatch {
  name: string;
  hex: string;
  role: string;
}

export interface AIInteriorSuggestion {
  styleName: string;
  tagline: string;
  description: string;
  colorPalette: ColorSwatch[];
  architecturalNotes: string;
  circulationTip: string;
  lightingPlan: string;
  recommendedFurniture: {
    name: string;
    category: FurnitureCategory;
    placement: string;
    estimatedINR: number;
    storeItemId?: string;
    modelType: 'sofa' | 'lounge-chair' | 'coffee-table' | 'floor-lamp' | 'area-rug' | 'bed' | 'credenza' | 'dining-table' | 'planter';
    recommendedFinish: MaterialFinish;
    colorHex: string;
  }[];
}

export type ActiveTab = '3d-studio' | 'ai-planner' | 'store' | 'inspirations' | 'wishlist' | 'orders';

export type CameraPreset = 'perspective' | 'top-down' | 'cozy-corner' | 'front';
export type AmbiancePreset = 'golden-hour' | 'cozy-evening' | 'bright-morning';

export type ShipmentStatus = 
  | 'order_confirmed' 
  | 'artisan_crafting' 
  | 'dispatched_transit' 
  | 'regional_hub' 
  | 'out_for_delivery' 
  | 'delivered';

export interface TrackingStep {
  step: ShipmentStatus;
  title: string;
  location: string;
  timestamp: string;
  completed: boolean;
  current: boolean;
  note: string;
}

export interface OrderItem {
  product: StoreProduct;
  quantity: number;
  finish?: string;
  priceINR: number;
}

export interface Order {
  id: string;
  date: string;
  totalINR: number;
  subtotalINR: number;
  shippingINR: number;
  discountINR: number;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    contact: string;
    addressLine: string;
    city: string;
    state: string;
    pinCode: string;
  };
  paymentMethod: 'upi' | 'cod' | 'card';
  status: ShipmentStatus;
  statusLabel: string;
  originHub: string;
  destinationCity: string;
  estimatedDeliveryDate: string;
  carrier: string;
  trackingNumber: string;
  trackingSteps: TrackingStep[];
  routeProgressPercent: number; // 0 to 100
}
