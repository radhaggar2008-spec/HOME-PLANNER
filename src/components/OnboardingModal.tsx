import React, { useState } from 'react';
import { UserProfile, Order } from '../types';
import { 
  Home, 
  Sparkles, 
  Phone, 
  Mail, 
  MapPin, 
  X, 
  Package, 
  Truck, 
  Clock, 
  ArrowRight,
  User,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProfile: (profile: UserProfile) => void;
  currentProfile?: UserProfile | null;
  isMandatory?: boolean;
  orders?: Order[];
  onTrackOrderInFullView?: (orderId: string) => void;
  onNavigateToStore?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onSaveProfile,
  currentProfile,
  isMandatory = false,
  orders = [],
  onTrackOrderInFullView,
  onNavigateToStore,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
  const [username, setUsername] = useState(currentProfile?.username || '');
  const [contactType, setContactType] = useState<'email' | 'phone'>(
    currentProfile?.contactType || 'email'
  );
  const [contact, setContact] = useState(currentProfile?.contact || '');
  const [city, setCity] = useState(currentProfile?.city || 'Bengaluru');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please provide your name or username to personalize your studio.');
      return;
    }
    if (!contact.trim()) {
      setError(`Please provide your ${contactType === 'email' ? 'email address' : 'phone number'}.`);
      return;
    }

    if (contactType === 'email' && !contact.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (contactType === 'phone' && contact.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setError('');
    onSaveProfile({
      username: username.trim(),
      contact: contact.trim(),
      contactType,
      city,
      isOnboarded: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl overflow-hidden bg-[#FAF7F2] border border-[#E5DDD2] rounded-2xl shadow-2xl transition-all max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Warm visual banner */}
        <div className="relative h-28 bg-[#4A382D] p-6 text-white flex flex-col justify-end overflow-hidden shrink-0">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#D6C2B0_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <div className="relative z-10 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 text-[#E7C797] text-xs font-medium uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sanctuary Membership</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-medium tracking-tight text-[#FAF7F2]">
                {currentProfile ? `Namaste, ${currentProfile.username.split(' ')[0]}` : 'Welcome to Nivaas'}
              </h2>
            </div>

            {currentProfile && (
              <span className="text-[11px] font-mono bg-white/10 px-2.5 py-1 rounded-md text-stone-200">
                City: {currentProfile.city || 'Pan-India'}
              </span>
            )}
          </div>

          {!isMandatory && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-stone-300 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tab Header if user is already onboarded */}
        {currentProfile && (
          <div className="flex items-center bg-[#ECE5DA] p-1 border-b border-stone-200 text-xs font-semibold shrink-0">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <User className="w-3.5 h-3.5 text-[#C26343]" />
              <span>Profile Settings</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Package className="w-3.5 h-3.5 text-[#C26343]" />
              <span>My Orders & Tracking ({orders.length})</span>
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1">
          {activeTab === 'profile' ? (
            /* Profile Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-sm text-stone-600 leading-relaxed">
                {currentProfile
                  ? 'Update your personal details, delivery pin codes, and communication preferences.'
                  : 'Welcome! To tailor your 3D floor plan layout, estimate local Indian Rupee pricing, and save your custom designs, please share your details.'}
              </p>

              {error && (
                <div className="p-3 text-xs font-medium text-amber-900 bg-amber-50 border border-amber-200 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Your Name / Username *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C26343] focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                    Contact Method *
                  </label>
                  <div className="flex items-center gap-1 bg-[#ECE5DA] p-0.5 rounded-lg text-xs">
                    <button
                      type="button"
                      onClick={() => setContactType('email')}
                      className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                        contactType === 'email'
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      Email
                    </button>
                    <button
                      type="button"
                      onClick={() => setContactType('phone')}
                      className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                        contactType === 'phone'
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      Phone (India)
                    </button>
                  </div>
                </div>

                <div className="relative">
                  {contactType === 'email' ? (
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3.5 w-4 h-4 text-stone-400" />
                      <input
                        type="email"
                        required
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="e.g. radhaggar2008@gmail.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C26343] focus:border-transparent transition"
                      />
                    </div>
                  ) : (
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-xs font-semibold text-stone-500">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="98765 43210"
                        maxLength={13}
                        className="w-full pl-12 pr-4 py-2.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C26343] focus:border-transparent transition"
                      />
                    </div>
                  )}
                </div>
                <p className="mt-1 text-[11px] text-stone-500">
                  Used strictly for your order receipts in ₹ and saved 3D plans.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  City (For Furniture Delivery & Estimates)
                </label>
                <div className="relative flex items-center">
                  <MapPin className="absolute left-3.5 w-4 h-4 text-stone-400" />
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#C26343] focus:border-transparent transition appearance-none cursor-pointer"
                  >
                    <option value="Bengaluru">Bengaluru, Karnataka</option>
                    <option value="Mumbai">Mumbai & MMR, Maharashtra</option>
                    <option value="Delhi NCR">Delhi NCR & Gurugram</option>
                    <option value="Pune">Pune, Maharashtra</option>
                    <option value="Hyderabad">Hyderabad, Telangana</option>
                    <option value="Chennai">Chennai, Tamil Nadu</option>
                    <option value="Jaipur">Jaipur, Rajasthan</option>
                    <option value="Kolkata">Kolkata, West Bengal</option>
                    <option value="Kochi">Kochi, Kerala</option>
                    <option value="Ahmedabad">Ahmedabad, Gujarat</option>
                    <option value="Other">Other Cities (Pan-India)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-6 text-sm font-semibold text-white bg-[#C26343] hover:bg-[#B05537] active:scale-[0.99] rounded-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Home className="w-4 h-4" />
                  <span>{currentProfile ? 'Save Changes' : 'Enter 3D Home Design Studio'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* My Orders Section in User Profile */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    Shipment Status & History
                  </h3>
                  <p className="text-xs text-stone-500">
                    Live tracking across craft ateliers and regional hubs.
                  </p>
                </div>
                {onTrackOrderInFullView && (
                  <button
                    onClick={() => {
                      onClose();
                      onTrackOrderInFullView(orders[0]?.id || '');
                    }}
                    className="text-xs font-semibold text-[#C26343] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Full Orders View</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {orders.length === 0 ? (
                <div className="py-12 text-center space-y-2 bg-white border border-stone-200 rounded-xl p-6">
                  <Package className="w-10 h-10 text-stone-400 mx-auto" />
                  <h4 className="text-sm font-semibold text-stone-800">No Orders Yet</h4>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto">
                    Purchased items from the store will appear here with live transit tracking.
                  </p>
                  {onNavigateToStore && (
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateToStore();
                      }}
                      className="mt-2 px-4 py-2 bg-[#C26343] text-white text-xs font-semibold rounded-lg shadow-xs"
                    >
                      Visit Furniture Store
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white border border-stone-200 p-4 rounded-xl shadow-2xs space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-mono font-bold text-stone-400">
                            {order.id} · {order.date}
                          </span>
                          <h4 className="text-xs font-bold text-stone-900 mt-0.5">
                            {order.items.map((i) => i.product.name).join(', ')}
                          </h4>
                          <span className="font-mono text-xs font-bold text-[#C26343]">
                            ₹{order.totalINR.toLocaleString('en-IN')}
                          </span>
                        </div>

                        <span
                          className={`px-2 py-0.5 text-[10px] font-semibold rounded-md ${
                            order.status === 'delivered'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-800'
                          }`}
                        >
                          {order.statusLabel}
                        </span>
                      </div>

                      {/* Mini Progress Bar */}
                      <div>
                        <div className="flex justify-between text-[10px] text-stone-500 mb-1">
                          <span>{order.originHub}</span>
                          <span className="font-mono">{order.routeProgressPercent}% completed</span>
                          <span>{order.destinationCity}</span>
                        </div>
                        <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#C26343] rounded-full transition-all duration-500"
                            style={{ width: `${order.routeProgressPercent}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-xs">
                        <span className="text-[11px] text-stone-500 font-mono">
                          ETA: {order.estimatedDeliveryDate}
                        </span>
                        {onTrackOrderInFullView && (
                          <button
                            onClick={() => {
                              onClose();
                              onTrackOrderInFullView(order.id);
                            }}
                            className="px-3 py-1 bg-[#4A382D] hover:bg-[#3B2C23] text-white text-[11px] font-semibold rounded-md shadow-2xs transition flex items-center gap-1 cursor-pointer"
                          >
                            <Truck className="w-3 h-3 text-[#E7C797]" />
                            <span>Track Route & Timeline</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
