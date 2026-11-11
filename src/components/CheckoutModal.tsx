import React, { useState } from 'react';
import { CartItem, UserProfile, Order } from '../types';
import { generateTrackingSteps } from '../data/mockOrders';
import confetti from 'canvas-confetti';
import { 
  X, 
  CheckCircle2, 
  CreditCard, 
  Smartphone, 
  Truck, 
  ShieldCheck, 
  Download, 
  ArrowLeft,
  Home,
  Navigation
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  userProfile?: UserProfile | null;
  onOrderSuccess: (newOrder: Order) => void;
  onTrackOrder?: (orderId: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  userProfile,
  onOrderSuccess,
  onTrackOrder,
}) => {
  const [fullName, setFullName] = useState(userProfile?.username || '');
  const [contact, setContact] = useState(userProfile?.contact || '');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState(userProfile?.city || 'Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [pinCode, setPinCode] = useState('560001');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod' | 'card'>('upi');
  const [upiId, setUpiId] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderId, setOrderId] = useState('');

  if (!isOpen) return null;

  const subtotalINR = cartItems.reduce(
    (acc, item) => acc + item.product.priceINR * item.quantity,
    0
  );
  const shippingINR = subtotalINR > 9999 ? 0 : 1200;
  const totalINR = subtotalINR + shippingINR;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPlacing(true);

    setTimeout(() => {
      const generatedId = `NIV-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderId(generatedId);

      const originHub = cartItems[0]?.product.category === 'Lighting'
        ? 'Moradabad Brass Workshop'
        : cartItems[0]?.product.material.toLowerCase().includes('mango')
        ? 'Saharanpur Wood Guild'
        : cartItems[0]?.product.material.toLowerCase().includes('nilambur')
        ? 'Nilambur Teak Estate'
        : 'Jodhpur Craft Guild';

      const newOrder: Order = {
        id: generatedId,
        date: 'Today',
        totalINR,
        subtotalINR,
        shippingINR,
        discountINR: 0,
        items: cartItems.map((ci) => ({
          product: ci.product,
          quantity: ci.quantity,
          finish: ci.selectedFinish,
          priceINR: ci.product.priceINR,
        })),
        shippingAddress: {
          fullName,
          contact,
          addressLine,
          city,
          state,
          pinCode,
        },
        paymentMethod,
        status: 'order_confirmed',
        statusLabel: 'Order Confirmed & Artisan Allocated',
        originHub,
        destinationCity: city,
        estimatedDeliveryDate: 'In 3-4 Days',
        carrier: 'Nivaas White Glove Logistics',
        trackingNumber: `ND-IN-${Math.floor(100000 + Math.random() * 900000)}`,
        routeProgressPercent: 18,
        trackingSteps: generateTrackingSteps(originHub, city, 'order_confirmed').steps,
      };

      setIsPlacing(false);
      setOrderConfirmed(true);

      // Fire festive celebratory confetti!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C26343', '#D4AF37', '#7C4A28', '#EBE5DA'],
      });

      onOrderSuccess(newOrder);
    }, 1000);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[#FAF7F2] border border-[#E5DDD2] rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-6 border-b border-stone-200 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h3 className="font-serif text-xl font-bold text-stone-900">
              {orderConfirmed ? 'Order Confirmed!' : 'Complete Your Furniture Order (₹ INR)'}
            </h3>
            <p className="text-xs text-stone-500">
              {orderConfirmed ? 'Thank you for designing with Nivaas.' : 'Pan-India Insured White Glove Delivery'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {orderConfirmed ? (
          /* Confirmation Screen */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-xs uppercase font-mono font-bold tracking-wider text-stone-400">
                Order Tracking ID
              </span>
              <h2 className="text-2xl font-mono font-bold text-[#C26343] mt-1">
                {orderId}
              </h2>
              <p className="text-sm text-stone-600 mt-2 max-w-md mx-auto">
                Congratulations, <strong className="text-stone-900">{fullName}</strong>! A confirmation message has been dispatched to{' '}
                <strong className="text-stone-900">{contact}</strong>.
              </p>
            </div>

            {/* Receipt Summary Box */}
            <div className="bg-white border border-stone-200 rounded-xl p-5 text-left text-xs space-y-3 max-w-md mx-auto">
              <div className="flex justify-between border-b border-stone-100 pb-2 font-semibold text-stone-800">
                <span>Delivery Address</span>
                <span className="font-normal text-stone-500">{city}, {pinCode}</span>
              </div>
              <p className="text-stone-600">
                {addressLine}, {city}, {state} - {pinCode}
              </p>
              
              <div className="border-t border-stone-100 pt-2 flex justify-between font-medium text-stone-700">
                <span>Payment Mode</span>
                <span className="uppercase font-semibold">
                  {paymentMethod === 'upi' ? 'UPI (Verified)' : paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Card'}
                </span>
              </div>

              <div className="border-t border-stone-100 pt-2 flex justify-between font-bold text-stone-900 text-sm">
                <span>Total Paid / Payable</span>
                <span className="font-mono text-[#C26343]">₹{totalINR.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handlePrintReceipt}
                className="px-4 py-2 border border-stone-300 text-stone-700 text-xs font-semibold rounded-lg hover:bg-stone-100 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Receipt</span>
              </button>

              {onTrackOrder && (
                <button
                  onClick={() => {
                    onClose();
                    onTrackOrder(orderId);
                  }}
                  className="px-4 py-2 bg-[#4A382D] hover:bg-[#3B2C23] text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#E7C797]" />
                  <span>Track Live Route Map</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="px-5 py-2 bg-[#C26343] hover:bg-[#B05537] text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to 3D Design</span>
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handlePlaceOrder} className="p-6 md:p-8 space-y-6">
            {/* Customer Details */}
            <div className="space-y-4">
              <h4 className="text-xs uppercase font-semibold tracking-wider text-stone-500 border-b border-stone-200 pb-1">
                1. Delivery & Contact Details
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Priya Iyer"
                    className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#C26343]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Phone / Email *
                  </label>
                  <input
                    type="text"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#C26343]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Complete Street Address (Flat / House / Apartment / Area) *
                </label>
                <input
                  type="text"
                  required
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="e.g. 402, Magnolia Enclave, 12th Main Road, Indiranagar"
                  className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#C26343]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-lg text-xs font-mono text-stone-800"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method in Indian Rupees */}
            <div className="space-y-4">
              <h4 className="text-xs uppercase font-semibold tracking-wider text-stone-500 border-b border-stone-200 pb-1">
                2. Select Indian Rupee Payment Mode
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label
                  className={`p-3.5 rounded-xl border flex flex-col justify-between cursor-pointer transition ${
                    paymentMethod === 'upi'
                      ? 'border-[#C26343] bg-white ring-2 ring-[#C26343]/20'
                      : 'border-stone-200 bg-white hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Smartphone className="w-4 h-4 text-[#C26343]" />
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      className="accent-[#C26343]"
                    />
                  </div>
                  <span className="text-xs font-semibold text-stone-800">
                    UPI Instant
                  </span>
                  <span className="text-[10px] text-stone-500 mt-0.5">
                    GPay, PhonePe, Paytm
                  </span>
                </label>

                <label
                  className={`p-3.5 rounded-xl border flex flex-col justify-between cursor-pointer transition ${
                    paymentMethod === 'cod'
                      ? 'border-[#C26343] bg-white ring-2 ring-[#C26343]/20'
                      : 'border-stone-200 bg-white hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Truck className="w-4 h-4 text-[#C26343]" />
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="accent-[#C26343]"
                    />
                  </div>
                  <span className="text-xs font-semibold text-stone-800">
                    Cash on Delivery
                  </span>
                  <span className="text-[10px] text-stone-500 mt-0.5">
                    Pay on White Glove Delivery
                  </span>
                </label>

                <label
                  className={`p-3.5 rounded-xl border flex flex-col justify-between cursor-pointer transition ${
                    paymentMethod === 'card'
                      ? 'border-[#C26343] bg-white ring-2 ring-[#C26343]/20'
                      : 'border-stone-200 bg-white hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <CreditCard className="w-4 h-4 text-[#C26343]" />
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="accent-[#C26343]"
                    />
                  </div>
                  <span className="text-xs font-semibold text-stone-800">
                    Cards & NetBanking
                  </span>
                  <span className="text-[10px] text-stone-500 mt-0.5">
                    RuPay, Visa, MC, HDFC/SBI
                  </span>
                </label>
              </div>

              {paymentMethod === 'upi' && (
                <div className="bg-white p-3.5 border border-stone-200 rounded-xl space-y-1.5">
                  <label className="block text-xs font-medium text-stone-700">
                    Enter UPI ID (VPA)
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. mobile@okaxis or name@ybl"
                    className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-stone-300 rounded text-xs"
                  />
                  <p className="text-[10px] text-stone-500">
                    A payment request of ₹{totalINR.toLocaleString('en-IN')} will be triggered on your UPI app.
                  </p>
                </div>
              )}
            </div>

            {/* Order Total & CTA */}
            <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] text-stone-500 block">Total Payable in Indian Rupees</span>
                <span className="text-xl font-bold font-mono text-[#C26343]">
                  ₹{totalINR.toLocaleString('en-IN')}
                </span>
              </div>

              <button
                type="submit"
                disabled={isPlacing}
                className="py-3 px-6 bg-[#C26343] hover:bg-[#B05537] text-white font-semibold text-sm rounded-xl shadow-md transition cursor-pointer disabled:opacity-75"
              >
                {isPlacing ? 'Securing Your Order...' : `Place Order (₹${totalINR.toLocaleString('en-IN')})`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
