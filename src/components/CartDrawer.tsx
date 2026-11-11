import React, { useState } from 'react';
import { CartItem, UserProfile } from '../types';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Tag, 
  Check, 
  Truck, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
  userProfile?: UserProfile | null;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  userProfile,
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState('');
  const [pinCode, setPinCode] = useState(userProfile?.city ? '400001' : '560001');

  if (!isOpen) return null;

  const subtotalINR = cartItems.reduce(
    (acc, item) => acc + item.product.priceINR * item.quantity,
    0
  );

  const discountINR = appliedPromo === 'WARMHOME10' || appliedPromo === 'NAMASTE10'
    ? Math.round(subtotalINR * 0.1)
    : 0;

  const shippingINR = subtotalINR > 9999 || subtotalINR === 0 ? 0 : 1200;
  const totalINR = Math.max(0, subtotalINR - discountINR + shippingINR);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = promoCode.trim().toUpperCase();
    if (clean === 'WARMHOME10' || clean === 'NAMASTE10' || clean === 'COZY10') {
      setAppliedPromo('WARMHOME10');
      setPromoError('');
    } else {
      setPromoError('Invalid code. Try "WARMHOME10" for 10% off.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="flex-1" onClick={onClose} />

      <div 
        className="w-full max-w-md bg-[#FAF7F2] h-full shadow-2xl flex flex-col justify-between border-l border-[#E5DDD2] animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#C26343]" />
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Your Curated Bag
            </h3>
            <span className="text-xs font-mono font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cartItems.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#EFE9DF] text-stone-400 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="font-serif text-base font-semibold text-stone-800">
                Your bag is empty
              </h4>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Explore our handcrafted furniture catalog or apply an AI-suggested 3D floor plan layout to add items.
              </p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.product.id}
                className="bg-white border border-stone-200 p-3.5 rounded-xl shadow-2xs flex gap-3.5 items-center"
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-20 h-20 rounded-lg object-cover bg-stone-100 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <h5 className="text-xs font-semibold text-stone-900 truncate">
                      {item.product.name}
                    </h5>
                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="text-stone-400 hover:text-red-600 p-1 transition"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[11px] text-stone-500 mt-0.5 capitalize">
                    Finish: {item.selectedFinish || 'Natural Wood'}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between">
                    {/* Stepper */}
                    <div className="flex items-center border border-stone-200 rounded-md bg-stone-50">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="px-2 py-0.5 text-stone-600 hover:bg-stone-200 text-xs transition"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2.5 text-xs font-mono font-medium text-stone-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="px-2 py-0.5 text-stone-600 hover:bg-stone-200 text-xs transition"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="font-mono text-xs font-bold text-stone-900">
                      ₹{(item.product.priceINR * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}

          {cartItems.length > 0 && (
            <div className="space-y-3 pt-2">
              {/* Delivery PIN Code Notice */}
              <div className="bg-[#FAF7F2] border border-stone-200 p-3 rounded-lg flex items-center justify-between text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#C26343]" />
                  <span>Delivering to India: PIN</span>
                </div>
                <input
                  type="text"
                  value={pinCode}
                  maxLength={6}
                  onChange={(e) => setPinCode(e.target.value)}
                  className="w-20 text-center font-mono py-1 px-1.5 border border-stone-300 rounded bg-white text-xs"
                />
              </div>

              {/* Promo Code Box */}
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-2.5 w-3.5 h-3.5 text-stone-400" />
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Coupon (e.g. WARMHOME10)"
                    className="w-full pl-8 pr-3 py-2 bg-white border border-stone-300 rounded-lg text-xs uppercase placeholder:normal-case focus:outline-none focus:ring-1 focus:ring-[#C26343]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-[#4A382D] hover:bg-[#3B2C23] text-white text-xs font-medium rounded-lg transition cursor-pointer"
                >
                  Apply
                </button>
              </form>

              {appliedPromo && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-2 rounded-lg">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Coupon 'WARMHOME10' applied: 10% discount!</span>
                </div>
              )}

              {promoError && (
                <p className="text-[11px] text-amber-800">{promoError}</p>
              )}
            </div>
          )}
        </div>

        {/* Footer & Calculations */}
        {cartItems.length > 0 && (
          <div className="p-5 border-t border-stone-200 bg-white space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-mono">₹{subtotalINR.toLocaleString('en-IN')}</span>
              </div>

              {discountINR > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Special 10% Discount</span>
                  <span className="font-mono">-₹{discountINR.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-stone-600">
                <span>White-Glove Delivery</span>
                <span className="font-mono">
                  {shippingINR === 0 ? (
                    <span className="text-emerald-700 font-semibold uppercase text-[10px]">
                      FREE
                    </span>
                  ) : (
                    `₹${shippingINR.toLocaleString('en-IN')}`
                  )}
                </span>
              </div>

              <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-bold text-stone-900">
                <span>Total Amount (INR)</span>
                <span className="font-mono text-base text-[#C26343]">
                  ₹{totalINR.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-[10px] text-stone-400 text-right">
                Includes all GST & pan-India transit insurance
              </p>
            </div>

            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full py-3 px-4 bg-[#C26343] hover:bg-[#B05537] text-white font-semibold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
