import React from 'react';
import { Order } from '../types';
import { Truck, MapPin, Sparkles, Navigation, Clock } from 'lucide-react';

interface TrackingMapVisualizerProps {
  order: Order;
  onAdvanceSimulation?: () => void;
}

// Coordinates for major Indian hubs mapped onto a 600x640 SVG canvas
const CITY_COORDINATES: Record<string, { x: number; y: number; label: string; state: string }> = {
  'Jodhpur Craft Guild': { x: 195, y: 220, label: 'Jodhpur', state: 'Rajasthan' },
  'Saharanpur Wood Guild': { x: 260, y: 155, label: 'Saharanpur', state: 'Uttar Pradesh' },
  'Moradabad Brass Workshop': { x: 280, y: 175, label: 'Moradabad', state: 'Uttar Pradesh' },
  'Nilambur Teak Estate': { x: 245, y: 530, label: 'Nilambur', state: 'Kerala' },
  'Bengaluru': { x: 265, y: 480, label: 'Bengaluru', state: 'Karnataka' },
  'Mumbai': { x: 185, y: 350, label: 'Mumbai', state: 'Maharashtra' },
  'Delhi NCR': { x: 250, y: 175, label: 'Delhi NCR', state: 'Delhi' },
  'Pune': { x: 200, y: 375, label: 'Pune', state: 'Maharashtra' },
  'Hyderabad': { x: 280, y: 390, label: 'Hyderabad', state: 'Telangana' },
  'Chennai': { x: 310, y: 495, label: 'Chennai', state: 'Tamil Nadu' },
  'Jaipur': { x: 225, y: 205, label: 'Jaipur', state: 'Rajasthan' },
  'Kolkata': { x: 440, y: 285, label: 'Kolkata', state: 'West Bengal' },
  'Kochi': { x: 235, y: 550, label: 'Kochi', state: 'Kerala' },
  'Ahmedabad': { x: 175, y: 275, label: 'Ahmedabad', state: 'Gujarat' },
};

export const TrackingMapVisualizer: React.FC<TrackingMapVisualizerProps> = ({
  order,
  onAdvanceSimulation,
}) => {
  // Determine origin and destination coords
  const origin = CITY_COORDINATES[order.originHub] || CITY_COORDINATES['Jodhpur Craft Guild'];
  const destination = CITY_COORDINATES[order.destinationCity] || CITY_COORDINATES['Bengaluru'];

  // Calculate quadratic bezier curve control point for curved realistic highway route
  const midX = (origin.x + destination.x) / 2 + (destination.x > origin.x ? 25 : -25);
  const midY = (origin.y + destination.y) / 2 - 15;

  const pathD = `M ${origin.x} ${origin.y} Q ${midX} ${midY} ${destination.x} ${destination.y}`;

  // Current position on the curve based on progressPercent (0 to 1)
  const t = Math.max(0.05, Math.min(0.98, order.routeProgressPercent / 100));
  // Quadratic bezier formula: B(t) = (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
  const currentX = (1 - t) * (1 - t) * origin.x + 2 * (1 - t) * t * midX + t * t * destination.x;
  const currentY = (1 - t) * (1 - t) * origin.y + 2 * (1 - t) * t * midY + t * t * destination.y;

  return (
    <div className="bg-[#FAF7F2] border border-[#E5DDD2] rounded-2xl p-5 md:p-6 shadow-xs space-y-4">
      {/* Map Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C26343]">
            <Navigation className="w-3.5 h-3.5" />
            <span>Live White-Glove Transit Route</span>
          </div>
          <h4 className="font-serif text-base font-bold text-stone-900 mt-0.5">
            {order.originHub} → {order.destinationCity}
          </h4>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-stone-200 rounded-lg text-xs font-mono text-stone-700 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-[#C26343]" />
            <span>ETA: {order.estimatedDeliveryDate}</span>
          </div>

          {onAdvanceSimulation && order.status !== 'delivered' && (
            <button
              onClick={onAdvanceSimulation}
              className="px-2.5 py-1 text-xs font-semibold bg-[#4A382D] hover:bg-[#3B2C23] text-white rounded-lg shadow-xs transition cursor-pointer"
            >
              Simulate Next Stage →
            </button>
          )}
        </div>
      </div>

      {/* SVG Stylized Architectural Map */}
      <div className="relative w-full h-80 sm:h-96 bg-[#F4EFEA] rounded-xl overflow-hidden border border-stone-200/80 flex items-center justify-center">
        {/* Subtle grid lines background */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#C26343_1px,transparent_1px)] [background-size:24px_24px]" />

        <svg
          viewBox="100 80 400 500"
          className="w-full h-full max-h-[460px] select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Linear gradient along route line */}
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C26343" />
              <stop offset="100%" stopColor="#7C4A28" />
            </linearGradient>

            {/* Filter for glowing pulse */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Stylized geometric background contour representing Indian subcontinental landmass */}
          <path
            d="M 230 110 L 290 120 L 330 180 L 420 220 L 460 270 L 430 320 L 370 380 L 320 480 L 250 560 L 210 500 L 160 380 L 140 280 L 170 200 Z"
            fill="#EFE8DE"
            stroke="#DCD2C4"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.8"
          />

          {/* Reference cities plotted quietly */}
          {Object.entries(CITY_COORDINATES).map(([key, coord]) => {
            const isOrigin = key === order.originHub;
            const isDestination = key === order.destinationCity;
            if (!isOrigin && !isDestination && coord.x >= 140 && coord.x <= 450) {
              return (
                <g key={key} opacity="0.45">
                  <circle cx={coord.x} cy={coord.y} r="2.5" fill="#8C7D70" />
                  <text
                    x={coord.x + 6}
                    y={coord.y + 3}
                    fontSize="9"
                    fill="#75675A"
                    fontFamily="sans-serif"
                  >
                    {coord.label}
                  </text>
                </g>
              );
            }
            return null;
          })}

          {/* Highway Route Arc (Backing shadow line) */}
          <path
            d={pathD}
            fill="none"
            stroke="#D8CDC0"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Completed portion of the route */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="3.5"
            strokeDasharray="6 4"
            className="animate-pulse"
          />

          {/* Origin Marker (Artisan Workshop) */}
          <g transform={`translate(${origin.x}, ${origin.y})`}>
            <circle r="7" fill="#7C4A28" />
            <circle r="14" fill="#7C4A28" opacity="0.2" />
            <text
              x="12"
              y="4"
              fontSize="11"
              fontWeight="bold"
              fill="#4A382D"
              fontFamily="sans-serif"
            >
              {origin.label} (Origin Atelier)
            </text>
          </g>

          {/* Destination Marker (Home Sanctuary) */}
          <g transform={`translate(${destination.x}, ${destination.y})`}>
            <circle r="7" fill="#C26343" />
            <circle r="16" fill="#C26343" opacity="0.25" />
            <text
              x="12"
              y="4"
              fontSize="11"
              fontWeight="bold"
              fill="#C26343"
              fontFamily="sans-serif"
            >
              {destination.label} (Your Home)
            </text>
          </g>

          {/* Live Vehicle Transit Dot on Path */}
          <g transform={`translate(${currentX}, ${currentY})`}>
            <circle r="11" fill="#C26343" opacity="0.3" filter="url(#glow)" />
            <circle r="6" fill="#FAF7F2" stroke="#C26343" strokeWidth="2.5" />
          </g>
        </svg>

        {/* Live Status Overlay Pill on Map */}
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-xl p-3 shadow-md text-xs space-y-1">
          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold text-stone-900 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#C26343]" />
              <span>Current Status: {order.statusLabel}</span>
            </span>
            <span className="font-mono font-bold text-[#C26343]">
              {order.routeProgressPercent}%
            </span>
          </div>

          <p className="text-[11px] text-stone-500">
            {order.status === 'delivered'
              ? 'Arrived and assembled at your sanctuary.'
              : order.status === 'out_for_delivery'
              ? `Delivery truck in ${order.destinationCity}. Arriving with 2 setup technicians.`
              : `Freight in transit from ${origin.label} towards ${destination.label}.`}
          </p>
        </div>
      </div>
    </div>
  );
};
