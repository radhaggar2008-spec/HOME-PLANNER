import { Order, ShipmentStatus, StoreProduct, TrackingStep } from '../types';
import { STORE_PRODUCTS } from './storeProducts';

export function generateTrackingSteps(
  originHub: string,
  destinationCity: string,
  currentStatus: ShipmentStatus
): { steps: TrackingStep[]; progressPercent: number } {
  const statusOrder: ShipmentStatus[] = [
    'order_confirmed',
    'artisan_crafting',
    'dispatched_transit',
    'regional_hub',
    'out_for_delivery',
    'delivered',
  ];

  const currentIndex = statusOrder.indexOf(currentStatus);
  const progressPercent = Math.round(((currentIndex + 1) / statusOrder.length) * 100);

  const steps: TrackingStep[] = [
    {
      step: 'order_confirmed',
      title: 'Order Confirmed & Artisan Allocated',
      location: `${originHub}, India`,
      timestamp: '08 Nov 2026, 10:30 AM',
      completed: currentIndex >= 0,
      current: currentStatus === 'order_confirmed',
      note: 'Master craftsman assigned. Kiln-dried hardwood billets pre-inspected for grain alignment.',
    },
    {
      step: 'artisan_crafting',
      title: 'Precision Joinery & Natural Wax Finish',
      location: `${originHub} Woodcraft Studio`,
      timestamp: '09 Nov 2026, 04:15 PM',
      completed: currentIndex >= 1,
      current: currentStatus === 'artisan_crafting',
      note: 'Hand-shaped mortise & tenon joints assembled. Organic beeswax hand-rubbed finish applied.',
    },
    {
      step: 'dispatched_transit',
      title: 'Dispatched via White-Glove Freight',
      location: 'Central Inter-State Freight Terminal',
      timestamp: '10 Nov 2026, 08:45 AM',
      completed: currentIndex >= 2,
      current: currentStatus === 'dispatched_transit',
      note: 'Custom air-cushioned wooden crating secured. Temperature & humidity monitored transit.',
    },
    {
      step: 'regional_hub',
      title: `Arrived at Regional Distribution Hub`,
      location: `${destinationCity} Logistics Center`,
      timestamp: '11 Nov 2026, 06:20 AM',
      completed: currentIndex >= 3,
      current: currentStatus === 'regional_hub',
      note: 'Barcode scanned and quality verified. Scheduled for white-glove home delivery slot.',
    },
    {
      step: 'out_for_delivery',
      title: 'Out for Delivery & In-Home Placement',
      location: `${destinationCity} Local Area`,
      timestamp: 'Today, 09:15 AM',
      completed: currentIndex >= 4,
      current: currentStatus === 'out_for_delivery',
      note: 'Delivery vehicle en route with 2 technicians for uncrating and room placement.',
    },
    {
      step: 'delivered',
      title: 'Delivered & Installed in Sanctuary',
      location: destinationCity,
      timestamp: 'Estimated Today by 5:00 PM',
      completed: currentIndex >= 5,
      current: currentStatus === 'delivered',
      note: 'Packaging materials retrieved for eco-recycling. 10-year warranty certificate signed.',
    },
  ];

  return { steps, progressPercent };
}

export const INITIAL_MOCK_ORDERS: Order[] = [
  {
    id: 'NIV-849201',
    date: '08 Nov 2026',
    totalINR: 33498,
    subtotalINR: 33498,
    shippingINR: 0,
    discountINR: 0,
    items: [
      {
        product: STORE_PRODUCTS[0], // Jodhpur Cane & Teak Chair
        quantity: 1,
        finish: 'teak',
        priceINR: 24999,
      },
      {
        product: STORE_PRODUCTS[1], // Moradabad Brass Lamp
        quantity: 1,
        finish: 'brass',
        priceINR: 8499,
      },
    ],
    shippingAddress: {
      fullName: 'Aarav Sharma',
      contact: '+91 98765 43210',
      addressLine: 'Flat 402, Magnolia Enclave, 12th Main Road, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pinCode: '560038',
    },
    paymentMethod: 'upi',
    status: 'out_for_delivery',
    statusLabel: 'Out for White-Glove Delivery',
    originHub: 'Jodhpur Craft Guild',
    destinationCity: 'Bengaluru',
    estimatedDeliveryDate: 'Today (by 5:00 PM)',
    carrier: 'Nivaas White Glove Logistics',
    trackingNumber: 'ND-IN-849201',
    routeProgressPercent: 82,
    trackingSteps: generateTrackingSteps('Jodhpur Craft Guild', 'Bengaluru', 'out_for_delivery').steps,
  },
  {
    id: 'NIV-720489',
    date: '28 Oct 2026',
    totalINR: 16800,
    subtotalINR: 16800,
    shippingINR: 0,
    discountINR: 0,
    items: [
      {
        product: STORE_PRODUCTS[2], // Curved Mango Wood Coffee Table
        quantity: 1,
        finish: 'teak',
        priceINR: 16800,
      },
    ],
    shippingAddress: {
      fullName: 'Aarav Sharma',
      contact: '+91 98765 43210',
      addressLine: 'Flat 402, Magnolia Enclave, 12th Main Road, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pinCode: '560038',
    },
    paymentMethod: 'card',
    status: 'delivered',
    statusLabel: 'Delivered to Living Room',
    originHub: 'Saharanpur Wood Guild',
    destinationCity: 'Bengaluru',
    estimatedDeliveryDate: '02 Nov 2026',
    carrier: 'Blue Dart Premium Freight',
    trackingNumber: 'ND-IN-720489',
    routeProgressPercent: 100,
    trackingSteps: generateTrackingSteps('Saharanpur Wood Guild', 'Bengaluru', 'delivered').steps,
  },
];
