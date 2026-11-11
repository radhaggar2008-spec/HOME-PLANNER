import React, { useState } from 'react';
import { Order, ShipmentStatus, StoreProduct } from '../types';
import { TrackingMapVisualizer } from './TrackingMapVisualizer';
import { generateTrackingSteps } from '../data/mockOrders';
import { 
  Package, 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  Download, 
  Layers, 
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  ShoppingBag
} from 'lucide-react';

interface OrdersSectionProps {
  orders: Order[];
  onUpdateOrders: (orders: Order[]) => void;
  onVisualizeOrderIn3D: (order: Order) => void;
  onNavigateToStore: () => void;
}

export const OrdersSection: React.FC<OrdersSectionProps> = ({
  orders,
  onUpdateOrders,
  onVisualizeOrderIn3D,
  onNavigateToStore,
}) => {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(
    orders[0]?.id || null
  );
  const [activeTrackingTab, setActiveTrackingTab] = useState<'timeline' | 'map'>('timeline');

  // Advance simulation to next tracking stage for demo testing
  const handleAdvanceSimulation = (orderId: string) => {
    const statusSequence: ShipmentStatus[] = [
      'order_confirmed',
      'artisan_crafting',
      'dispatched_transit',
      'regional_hub',
      'out_for_delivery',
      'delivered',
    ];

    const updated = orders.map((ord) => {
      if (ord.id === orderId) {
        const curIdx = statusSequence.indexOf(ord.status);
        const nextIdx = Math.min(statusSequence.length - 1, curIdx + 1);
        const nextStatus = statusSequence[nextIdx];

        const { steps, progressPercent } = generateTrackingSteps(
          ord.originHub,
          ord.destinationCity,
          nextStatus
        );

        const statusLabels: Record<ShipmentStatus, string> = {
          order_confirmed: 'Order Confirmed',
          artisan_crafting: 'Handcrafting in Atelier',
          dispatched_transit: 'In Transit (Inter-State Freight)',
          regional_hub: 'Arrived at Regional Distribution Hub',
          out_for_delivery: 'Out for White-Glove Delivery',
          delivered: 'Delivered & Installed',
        };

        return {
          ...ord,
          status: nextStatus,
          statusLabel: statusLabels[nextStatus],
          routeProgressPercent: progressPercent,
          trackingSteps: steps,
        };
      }
      return ord;
    });

    onUpdateOrders(updated);
  };

  const handlePrintInvoice = (order: Order) => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E5DDD2] pb-6">
        <div>
          <div className="flex items-center gap-2 text-[#C26343] text-xs font-semibold uppercase tracking-wider mb-1.5">
            <Package className="w-4 h-4" />
            <span>Simulated Order History & White-Glove Tracking</span>
          </div>
          <h2 className="text-3xl font-serif font-bold text-stone-900 tracking-tight">
            My Orders & Sanctuary Deliveries
          </h2>
          <p className="mt-1 text-stone-600 text-sm">
            Track artisan woodwork joinery, transit across Indian highways, and real-time room installation.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-stone-500 bg-white border border-stone-200 px-3 py-1.5 rounded-lg shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>All Shipments Include 10-Yr Warranty & In-Room Assembly</span>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="py-20 bg-white border border-[#E5DDD2] rounded-2xl text-center p-8 space-y-4 max-w-lg mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-full bg-[#FAF5EC] text-[#C26343] mx-auto flex items-center justify-center border border-[#E8DFC8]">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-xl font-bold text-stone-900">
            No Orders Placed Yet
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            When you purchase furniture pieces in Indian Rupees, your simulated order tracking and live route maps will appear here.
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
        <div className="space-y-6">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;

            return (
              <div
                key={order.id}
                className="bg-white border border-[#E5DDD2] rounded-2xl overflow-hidden shadow-xs hover:shadow-sm transition-all"
              >
                {/* Order Summary Strip */}
                <div className="p-5 sm:p-6 border-b border-stone-200 bg-[#FAF7F2]/60 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600">
                    <div>
                      <span className="text-[11px] text-stone-400 block uppercase font-mono">Order ID</span>
                      <span className="font-mono font-bold text-stone-900 text-sm">{order.id}</span>
                    </div>
                    <span className="text-stone-300">|</span>
                    <div>
                      <span className="text-[11px] text-stone-400 block uppercase">Order Placed</span>
                      <span className="font-medium text-stone-800">{order.date}</span>
                    </div>
                    <span className="text-stone-300">|</span>
                    <div>
                      <span className="text-[11px] text-stone-400 block uppercase">Total Amount (₹)</span>
                      <span className="font-mono font-bold text-[#C26343] text-sm">
                        ₹{order.totalINR.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <span className="text-stone-300">|</span>
                    <div>
                      <span className="text-[11px] text-stone-400 block uppercase">Shipment Carrier</span>
                      <span className="font-medium text-stone-800">{order.carrier}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status Badge */}
                    <div className="flex items-center gap-2 px-3 py-1 bg-white border border-stone-300/80 rounded-lg text-xs font-medium text-stone-800 shadow-2xs">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          order.status === 'delivered'
                            ? 'bg-emerald-600'
                            : order.status === 'out_for_delivery'
                            ? 'bg-[#C26343]'
                            : 'bg-amber-600'
                        }`}
                      />
                      <span>{order.statusLabel}</span>
                    </div>

                    {/* Expand/Collapse Tracking */}
                    <button
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      className="px-3 py-1.5 bg-[#4A382D] hover:bg-[#3B2C23] text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Truck className="w-3.5 h-3.5 text-[#E7C797]" />
                      <span>{isExpanded ? 'Hide Tracking' : 'Track Shipment & Map'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Items Purchased List */}
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
                    Purchased Furniture ({order.items.length} {order.items.length === 1 ? 'item' : 'items'})
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {order.items.map((it, idx) => (
                      <div
                        key={idx}
                        className="flex gap-4 p-3.5 bg-[#FAF7F2] border border-stone-200 rounded-xl items-center"
                      >
                        <img
                          src={it.product.image}
                          alt={it.product.name}
                          className="w-16 h-16 rounded-lg object-cover bg-stone-100 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-stone-900 truncate">
                            {it.product.name}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                            <span>Qty: {it.quantity}</span>
                            <span>·</span>
                            <span className="capitalize">{it.finish || 'Solid Teak'}</span>
                            <span>·</span>
                            <span className="truncate">{it.product.origin}</span>
                          </div>
                          <div className="mt-1 font-mono text-xs font-bold text-[#C26343]">
                            ₹{(it.priceINR * it.quantity).toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Destination & Quick Actions */}
                  <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#C26343] shrink-0" />
                      <span>
                        Delivery to: <strong>{order.shippingAddress.fullName}</strong> — {order.shippingAddress.addressLine}, {order.shippingAddress.city} ({order.shippingAddress.pinCode})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onVisualizeOrderIn3D(order)}
                        className="px-3 py-1.5 border border-stone-300 hover:border-stone-800 text-stone-800 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Visualize in 3D</span>
                      </button>

                      <button
                        onClick={() => handlePrintInvoice(order)}
                        className="px-3 py-1.5 border border-stone-300 hover:border-stone-800 text-stone-800 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Tax Invoice</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Shipment Tracking Progress & Map */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 border-t border-stone-200 bg-[#FDFBF7] space-y-6 animate-in slide-in-from-top-2 duration-200">
                    {/* View Switcher: Timeline vs Map */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 bg-[#ECE5DA] p-1 rounded-xl text-xs font-medium">
                        <button
                          onClick={() => setActiveTrackingTab('timeline')}
                          className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                            activeTrackingTab === 'timeline'
                              ? 'bg-white text-stone-900 shadow-xs'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          Shipment Timeline
                        </button>
                        <button
                          onClick={() => setActiveTrackingTab('map')}
                          className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                            activeTrackingTab === 'map'
                              ? 'bg-white text-stone-900 shadow-xs'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          Interactive Route Map
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-stone-500">
                          Tracking No: <strong className="text-stone-800">{order.trackingNumber}</strong>
                        </span>
                        {order.status !== 'delivered' && (
                          <button
                            onClick={() => handleAdvanceSimulation(order.id)}
                            className="px-2.5 py-1 text-xs font-semibold text-[#C26343] hover:bg-[#C26343] hover:text-white border border-[#C26343] rounded-lg transition flex items-center gap-1 cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Simulate Progress</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Timeline View */}
                    {activeTrackingTab === 'timeline' ? (
                      <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-6 shadow-2xs">
                        <div className="relative border-l-2 border-[#D8CDC0] ml-3 space-y-6">
                          {order.trackingSteps.map((step, idx) => (
                            <div key={idx} className="relative pl-6">
                              {/* Circle indicator */}
                              <div
                                className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 transition ${
                                  step.completed
                                    ? 'bg-[#C26343] border-[#C26343]'
                                    : 'bg-white border-stone-300'
                                }`}
                              >
                                {step.completed && (
                                  <div className="w-1.5 h-1.5 bg-white rounded-full mx-auto mt-0.5" />
                                )}
                              </div>

                              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                                <h5
                                  className={`text-sm font-semibold ${
                                    step.current
                                      ? 'text-[#C26343]'
                                      : step.completed
                                      ? 'text-stone-900'
                                      : 'text-stone-400'
                                  }`}
                                >
                                  {step.title}
                                </h5>
                                <span className="text-[11px] font-mono text-stone-400">
                                  {step.timestamp}
                                </span>
                              </div>

                              <div className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-stone-400" />
                                <span>{step.location}</span>
                              </div>

                              <p className="text-xs text-stone-600 mt-1 bg-[#FAF7F2] p-2.5 rounded-lg border border-stone-100 leading-relaxed">
                                {step.note}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      /* Map View */
                      <TrackingMapVisualizer
                        order={order}
                        onAdvanceSimulation={() => handleAdvanceSimulation(order.id)}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
