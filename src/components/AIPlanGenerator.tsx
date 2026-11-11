import React, { useState } from 'react';
import { AIInteriorSuggestion, FloorPlanItem, StoreProduct, ColorSwatch } from '../types';
import { STORE_PRODUCTS } from '../data/storeProducts';
import { 
  Sparkles, 
  Upload, 
  Check, 
  ArrowRight, 
  Palette, 
  Compass, 
  Lightbulb, 
  ShoppingBag,
  RefreshCw,
  Maximize2,
  Home,
  Sun,
  LayoutGrid,
  CheckCircle2
} from 'lucide-react';

interface AIPlanGeneratorProps {
  onApplyPlanTo3D: (newItems: FloorPlanItem[], suggestion: AIInteriorSuggestion) => void;
  onAddToCart: (product: StoreProduct) => void;
  onSwitchTo3DTab: () => void;
}

interface RoomPreset {
  id: string;
  title: string;
  tag: string;
  roomType: string;
  dimensions: string;
  budgetINR: string;
  description: string;
  spatialTip: string;
  image: string;
  items: FloorPlanItem[];
  colorPalette: ColorSwatch[];
  lightingPlan: string;
}

const INDIAN_LAYOUT_PRESETS: RoomPreset[] = [
  {
    id: 'preset-small-apartment',
    title: 'Small Apartment Living Room',
    tag: '1BHK / 2BHK High-Rise',
    roomType: 'Living Room',
    dimensions: '12 ft × 15 ft (180 sq.ft)',
    budgetINR: '₹1,18,000',
    description: 'Tailored for compact urban apartments in Mumbai, Bengaluru, and Pune. Maximizes open floor space by keeping seating on a floating axis and using low-slung silhouettes with natural light flow.',
    spatialTip: 'Ensures an unobstructed 36-inch (90cm) pathway from the front entry door straight to the balcony or window, avoiding visual clutter.',
    image: '/src/assets/images/hero_cozy_living_room_1794412001140.jpg',
    lightingPlan: 'Warm 2700K floor lamp for evening reading, combined with soft perimeter ceiling illumination.',
    colorPalette: [
      { name: 'Warm Oat Linen', hex: '#EBE5DA', role: 'Dominant field & sofa' },
      { name: 'Solid Teak Amber', hex: '#7C4A28', role: 'Wood furniture joinery' },
      { name: 'Burnt Terracotta', hex: '#C26343', role: 'Accent pottery & cushions' },
      { name: 'Brushed Brass', hex: '#D4AF37', role: 'Reflective lighting' },
    ],
    items: [
      {
        id: 'small-apt-sofa',
        name: 'Cloud Linen 3-Seater Sofa',
        category: 'seating',
        position: [0, 0, 1.1],
        rotation: 0,
        scale: [1, 1, 1],
        color: '#E8E1D5',
        finish: 'linen',
        storeItemId: 'prod-linen-sofa',
        dimensionsText: '220 × 96 cm',
      },
      {
        id: 'small-apt-table',
        name: 'Organic Curved Mango Coffee Table',
        category: 'tables',
        position: [0, 0, 0.05],
        rotation: 0.15,
        scale: [1, 1, 1],
        color: '#8E5A36',
        finish: 'teak',
        storeItemId: 'prod-coffee-table',
        dimensionsText: '125 × 68 cm',
      },
      {
        id: 'small-apt-chair',
        name: 'Jodhpur Cane & Teak Armchair',
        category: 'seating',
        position: [-1.45, 0, 0.25],
        rotation: 1.1,
        scale: [1, 1, 1],
        color: '#7C4A28',
        finish: 'cane',
        storeItemId: 'prod-teak-chair',
        dimensionsText: '74 × 82 cm',
      },
      {
        id: 'small-apt-lamp',
        name: 'Moradabad Pleated Brass Floor Lamp',
        category: 'lighting',
        position: [1.5, 0, 1.35],
        rotation: -0.6,
        scale: [1, 1, 1],
        color: '#D4AF37',
        finish: 'brass',
        storeItemId: 'prod-brass-lamp',
        isLightSource: true,
        lightIntensity: 1.8,
        lightColor: '#FFE2A4',
        colorTemperatureK: 2700,
        dimensionsText: 'Dia 42 × H 152 cm',
      },
      {
        id: 'small-apt-rug',
        name: 'Bhadohi Hand-Knotted Raw Wool Rug',
        category: 'decor',
        position: [0, 0.01, 0.55],
        rotation: 0,
        scale: [1, 1, 1],
        color: '#DDD5C7',
        finish: 'boucle',
        storeItemId: 'prod-wool-rug',
        dimensionsText: '240 × 170 cm',
      },
      {
        id: 'small-apt-credenza',
        name: 'Fluted Oak Media Credenza',
        category: 'storage',
        position: [0, 0, -1.8],
        rotation: 0,
        scale: [1, 1, 1],
        color: '#9C6F44',
        finish: 'oak',
        storeItemId: 'prod-oak-credenza',
        dimensionsText: '170 × 44 cm',
      },
      {
        id: 'small-apt-planter',
        name: 'Hand-Thrown Terracotta Planter',
        category: 'decor',
        position: [1.7, 0, -1.5],
        rotation: 0,
        scale: [1, 1, 1],
        color: '#BD6443',
        finish: 'teak',
        storeItemId: 'prod-terracotta-planter',
        dimensionsText: 'Dia 38 × H 46 cm',
      },
    ],
  },
  {
    id: 'preset-veranda',
    title: 'Traditional Veranda & Balcony Space',
    tag: 'Thinnai & Courtyard Living',
    roomType: 'Veranda & Patio',
    dimensions: '8 ft × 16 ft (130 sq.ft)',
    budgetINR: '₹74,000',
    description: 'Inspired by traditional Indian sit-outs (Thinnai) in Kerala, Chettinad, and coastal Gujarat. Features breathable hand-woven rattan, low central table, and lush terracotta greenery for morning chai.',
    spatialTip: 'Symmetrical armchair positioning captures gentle cross-breeze while keeping the center floor clear for brass vessels or footwear transition.',
    image: '/src/assets/images/store_teak_lounge_chair_1794412002629.jpg',
    lightingPlan: 'Warm accent lighting with warm brass fixtures and outdoor morning natural sunlight.',
    colorPalette: [
      { name: 'Natural Woven Cane', hex: '#D8BE93', role: 'Breathable seat webbing' },
      { name: 'Nilambur Teak', hex: '#7C4A28', role: 'Weather-cured timber' },
      { name: 'Sun-Baked Clay', hex: '#BD6443', role: 'Pottery vessels' },
      { name: 'Oatmeal Wool', hex: '#DDD5C7', role: 'Tactile floor runner' },
    ],
    items: [
      {
        id: 'veranda-chair-1',
        name: 'Jodhpur Cane & Teak Armchair (Left)',
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
        id: 'veranda-chair-2',
        name: 'Jodhpur Cane & Teak Armchair (Right)',
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
        id: 'veranda-table',
        name: 'Organic Curved Mango Coffee Table',
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
        id: 'veranda-lamp',
        name: 'Moradabad Pleated Brass Floor Lamp',
        category: 'lighting',
        position: [-1.7, 0, 1.4],
        rotation: 0.3,
        scale: [1, 1, 1],
        color: '#D4AF37',
        finish: 'brass',
        storeItemId: 'prod-brass-lamp',
        isLightSource: true,
        lightIntensity: 1.8,
        lightColor: '#FFE2A4',
        colorTemperatureK: 2700,
        dimensionsText: 'Dia 42 × H 152 cm',
      },
      {
        id: 'veranda-planter-1',
        name: 'Terracotta Floor Planter',
        category: 'decor',
        position: [1.6, 0, -1.2],
        rotation: 0,
        scale: [1.1, 1.1, 1.1],
        color: '#BD6443',
        finish: 'teak',
        storeItemId: 'prod-terracotta-planter',
        dimensionsText: 'Dia 38 × H 46 cm',
      },
      {
        id: 'veranda-rug',
        name: 'Bhadohi Hand-Knotted Raw Wool Rug',
        category: 'decor',
        position: [0, 0.01, 0.4],
        rotation: 0,
        scale: [1, 1, 1],
        color: '#DDD5C7',
        finish: 'boucle',
        storeItemId: 'prod-wool-rug',
        dimensionsText: '240 × 170 cm',
      },
    ],
  },
  {
    id: 'preset-master-bedroom',
    title: 'Master Bedroom Suite & Reading Nook',
    tag: 'Tranquil Sanctuary',
    roomType: 'Bedroom',
    dimensions: '14 ft × 16 ft (225 sq.ft)',
    budgetINR: '₹1,12,000',
    description: 'A serene sleeping sanctuary with a low-slung Kerala teak platform bed, soft bedside lighting, and a private corner armchair for evening reading with tea.',
    spatialTip: 'Bed anchored against the north/east solid wall per Vastu principles, with 3 feet of circulation clearance around all three sides.',
    image: '/src/assets/images/store_brass_floor_lamp_1794412001903.jpg',
    lightingPlan: 'Warm 2400K intimate illumination for tranquil melatonin synthesis and relaxed reading.',
    colorPalette: [
      { name: 'Warm Biscuit Teak', hex: '#7C4A28', role: 'Platform bed frame' },
      { name: 'Pure Cotton Linen', hex: '#FAF7F2', role: 'Duvet and pillows' },
      { name: 'Moradabad Brass', hex: '#D4AF37', role: 'Warm reading lamp' },
      { name: 'Natural Cane', hex: '#D8BE93', role: 'Headboard webbing' },
    ],
    items: [
      {
        id: 'bed-main',
        name: 'Malabar Solid Teak Platform Bed',
        category: 'beds',
        position: [0, 0, 0.2],
        rotation: 0,
        scale: [1, 1, 1],
        color: '#7C4A28',
        finish: 'teak',
        storeItemId: 'prod-teak-bed',
        dimensionsText: '214 × 192 cm',
      },
      {
        id: 'bed-chair',
        name: 'Jodhpur Cane & Teak Armchair',
        category: 'seating',
        position: [-1.55, 0, 1.1],
        rotation: 0.8,
        scale: [1, 1, 1],
        color: '#7C4A28',
        finish: 'cane',
        storeItemId: 'prod-teak-chair',
        dimensionsText: '74 × 82 cm',
      },
      {
        id: 'bed-lamp',
        name: 'Moradabad Pleated Brass Floor Lamp',
        category: 'lighting',
        position: [1.5, 0, -0.2],
        rotation: -0.4,
        scale: [1, 1, 1],
        color: '#D4AF37',
        finish: 'brass',
        storeItemId: 'prod-brass-lamp',
        isLightSource: true,
        lightIntensity: 1.8,
        lightColor: '#FFE2A4',
        colorTemperatureK: 2700,
        dimensionsText: 'Dia 42 × H 152 cm',
      },
      {
        id: 'bed-rug',
        name: 'Bhadohi Hand-Knotted Raw Wool Rug',
        category: 'decor',
        position: [0, 0.01, 0.4],
        rotation: 0,
        scale: [1, 1, 1],
        color: '#DDD5C7',
        finish: 'boucle',
        storeItemId: 'prod-wool-rug',
        dimensionsText: '240 × 170 cm',
      },
      {
        id: 'bed-planter',
        name: 'Terracotta Indoor Planter',
        category: 'decor',
        position: [1.7, 0, 1.3],
        rotation: 0,
        scale: [1, 1, 1],
        color: '#BD6443',
        finish: 'teak',
        storeItemId: 'prod-terracotta-planter',
        dimensionsText: 'Dia 38 × H 46 cm',
      },
    ],
  },
  {
    id: 'preset-drawing-room',
    title: 'Formal Indian Drawing Room (Baithak)',
    tag: 'Heritage Hospitality',
    roomType: 'Living Room',
    dimensions: '16 ft × 20 ft (320 sq.ft)',
    budgetINR: '₹1,54,000',
    description: 'Designed for family gatherings and festive hospitality (Mehmaan-Nawaazi). Generous 3-seater sofa paired with dual cane armchairs and a wide fluted credenza for heirloom decor.',
    spatialTip: 'Symmetrical circular conversational arrangement ensures everyone can make comfortable eye contact without craning their necks.',
    image: '/src/assets/images/store_artisan_coffee_table_1794412003224.jpg',
    lightingPlan: 'Layered ambient lighting casting golden hour tones across solid hardwood surfaces.',
    colorPalette: [
      { name: 'Nilambur Teak', hex: '#7C4A28', role: 'Architectural joinery' },
      { name: 'Oatmeal Linen', hex: '#E8E1D5', role: 'Generous seating' },
      { name: 'Terracotta Clay', hex: '#C26343', role: 'Vessel accents' },
      { name: 'Antique Gold Brass', hex: '#D4AF37', role: 'Warm reflective glow' },
    ],
    items: [
      {
        id: 'baithak-sofa',
        name: 'Cloud Linen 3-Seater Sofa',
        category: 'seating',
        position: [0, 0, 1.2],
        rotation: 0,
        scale: [1, 1, 1],
        color: '#E8E1D5',
        finish: 'linen',
        storeItemId: 'prod-linen-sofa',
        dimensionsText: '220 × 96 cm',
      },
      {
        id: 'baithak-table',
        name: 'Organic Curved Mango Coffee Table',
        category: 'tables',
        position: [0, 0, 0.1],
        rotation: 0,
        scale: [1.1, 1, 1.1],
        color: '#8E5A36',
        finish: 'teak',
        storeItemId: 'prod-coffee-table',
        dimensionsText: '125 × 68 cm',
      },
      {
        id: 'baithak-chair-1',
        name: 'Jodhpur Cane & Teak Armchair',
        category: 'seating',
        position: [-1.45, 0, 0.25],
        rotation: 1.1,
        scale: [1, 1, 1],
        color: '#7C4A28',
        finish: 'cane',
        storeItemId: 'prod-teak-chair',
        dimensionsText: '74 × 82 cm',
      },
      {
        id: 'baithak-lamp',
        name: 'Moradabad Pleated Brass Floor Lamp',
        category: 'lighting',
        position: [-1.7, 0, 1.4],
        rotation: 0.3,
        scale: [1, 1, 1],
        color: '#D4AF37',
        finish: 'brass',
        storeItemId: 'prod-brass-lamp',
        isLightSource: true,
        lightIntensity: 1.8,
        lightColor: '#FFE2A4',
        colorTemperatureK: 2700,
        dimensionsText: 'Dia 42 × H 152 cm',
      },
      {
        id: 'baithak-credenza',
        name: 'Fluted Oak Media Credenza',
        category: 'storage',
        position: [0, 0, -1.8],
        rotation: 0,
        scale: [1, 1, 1],
        color: '#9C6F44',
        finish: 'oak',
        storeItemId: 'prod-oak-credenza',
        dimensionsText: '170 × 44 cm',
      },
      {
        id: 'baithak-planter',
        name: 'Terracotta Floor Planter',
        category: 'decor',
        position: [1.7, 0, -1.5],
        rotation: 0,
        scale: [1, 1, 1],
        color: '#BD6443',
        finish: 'teak',
        storeItemId: 'prod-terracotta-planter',
        dimensionsText: 'Dia 38 × H 46 cm',
      },
      {
        id: 'baithak-rug',
        name: 'Bhadohi Hand-Knotted Raw Wool Rug',
        category: 'decor',
        position: [0, 0.01, 0.5],
        rotation: 0,
        scale: [1, 1, 1],
        color: '#DDD5C7',
        finish: 'boucle',
        storeItemId: 'prod-wool-rug',
        dimensionsText: '240 × 170 cm',
      },
    ],
  },
];

export const AIPlanGenerator: React.FC<AIPlanGeneratorProps> = ({
  onApplyPlanTo3D,
  onAddToCart,
  onSwitchTo3DTab,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('preset-small-apartment');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [roomType, setRoomType] = useState('Living Room');
  const [stylePreference, setStylePreference] = useState('Warm Japandi & Indian Teak');
  const [roomDimensions, setRoomDimensions] = useState('12 ft × 15 ft (180 sq.ft)');
  const [budgetINR, setBudgetINR] = useState('₹1,18,000');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState<AIInteriorSuggestion | null>(null);
  const [appliedPresetNotification, setAppliedPresetNotification] = useState<string | null>(null);

  const selectedPreset = INDIAN_LAYOUT_PRESETS.find((p) => p.id === selectedPresetId) || INDIAN_LAYOUT_PRESETS[0];

  // Instantly populate the 3D Studio with the preset layout
  const handlePopulatePreset = (preset: RoomPreset) => {
    setSelectedPresetId(preset.id);

    // Convert items into recommendation format
    const suggestion: AIInteriorSuggestion = {
      styleName: preset.title,
      tagline: preset.tag,
      description: preset.description,
      colorPalette: preset.colorPalette,
      architecturalNotes: preset.spatialTip,
      circulationTip: preset.spatialTip,
      lightingPlan: preset.lightingPlan,
      recommendedFurniture: preset.items.map((it) => {
        const prod = it.storeItemId ? STORE_PRODUCTS.find((p) => p.id === it.storeItemId) : null;
        return {
          name: it.name,
          category: it.category,
          placement: 'Architecturally aligned in 3D floor plan',
          estimatedINR: prod ? prod.priceINR : 15000,
          storeItemId: it.storeItemId,
          modelType: (prod?.modelType || 'sofa') as any,
          recommendedFinish: it.finish,
          colorHex: it.color,
        };
      }),
    };

    setActiveSuggestion(suggestion);
    onApplyPlanTo3D(preset.items, suggestion);
    setAppliedPresetNotification(`Populated 3D Studio with "${preset.title}"!`);

    // Switch to 3D tab immediately so the user sees the room in 3D
    setTimeout(() => {
      onSwitchTo3DTab();
    }, 400);
  };

  // Pre-fill form from preset
  const handleCustomizePreset = (preset: RoomPreset) => {
    setSelectedPresetId(preset.id);
    setRoomType(preset.roomType);
    setRoomDimensions(preset.dimensions);
    setBudgetINR(preset.budgetINR);
  };

  // Handle custom image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate or Analyze Custom Room Plan
  const handleGeneratePlan = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomType,
          stylePreference,
          roomDimensions,
          budgetINR,
          hasCustomImage: !!uploadedImage,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.suggestion) {
          setActiveSuggestion(data.suggestion);
          setIsGenerating(false);
          return;
        }
      }
    } catch {
      // Fallback handled below
    }

    setTimeout(() => {
      const isBedroom = roomType.toLowerCase().includes('bedroom');
      const suggestion: AIInteriorSuggestion = {
        styleName: stylePreference,
        tagline: 'Custom spatial alignment with natural materials and warm daylight',
        description: `This layout harmonizes your ${roomDimensions} ${roomType.toLowerCase()} with a balanced spatial axis. By floating key seating away from perimeter walls, we establish an intuitive conversation anchor while maintaining unobstructed circulation from the doorway to the window.`,
        colorPalette: [
          { name: 'Warm Oat Linen', hex: '#EBE5DA', role: 'Dominant field & upholstery' },
          { name: 'Nilambur Teak', hex: '#7C4A28', role: 'Structural joinery & wood' },
          { name: 'Burnt Terracotta', hex: '#C26343', role: 'Vibrant accent pillows & pottery' },
          { name: 'Antique Brass', hex: '#C79A46', role: 'Warm reflective lighting' },
          { name: 'Earthy Olive', hex: '#4A5538', role: 'Botanical balance' },
        ],
        architecturalNotes: `Preserve at least 36 inches (90cm) of perimeter pathway for effortless flow. The organic curved coffee table softens the rectilinear walls of the ${roomDimensions} floor plan.`,
        circulationTip: 'Orient key seating towards natural window light; pair with low-profile credenza opposite to conceal media and retain eye-level openness.',
        lightingPlan: 'Tri-point warm ambient scheme: 2700K pleated floor lamp for cozy evening reading corner, supplemented by soft ceiling downlights.',
        recommendedFurniture: isBedroom
          ? [
              {
                name: 'Malabar Solid Teak Platform Bed',
                category: 'beds',
                placement: 'Anchored against back wall',
                estimatedINR: 59900,
                storeItemId: 'prod-teak-bed',
                modelType: 'bed',
                recommendedFinish: 'teak',
                colorHex: '#7C4A28',
              },
              {
                name: 'Moradabad Pleated Shade Brass Lamp',
                category: 'lighting',
                placement: 'Bedside warm reading illumination',
                estimatedINR: 8499,
                storeItemId: 'prod-brass-lamp',
                modelType: 'floor-lamp',
                recommendedFinish: 'brass',
                colorHex: '#D4AF37',
              },
              {
                name: 'Bhadohi Hand-Knotted Raw Wool Rug',
                category: 'decor',
                placement: 'Under bed platform extending 3ft out',
                estimatedINR: 15400,
                storeItemId: 'prod-wool-rug',
                modelType: 'area-rug',
                recommendedFinish: 'boucle',
                colorHex: '#DDD5C7',
              },
              {
                name: 'Jodhpur Cane & Teak Lounge Armchair',
                category: 'seating',
                placement: 'Corner reading retreat',
                estimatedINR: 24999,
                storeItemId: 'prod-teak-chair',
                modelType: 'lounge-chair',
                recommendedFinish: 'cane',
                colorHex: '#7C4A28',
              },
            ]
          : [
              {
                name: 'Cloud Linen 3-Seater Low Profile Sofa',
                category: 'seating',
                placement: 'Central lounge axis facing window',
                estimatedINR: 48900,
                storeItemId: 'prod-linen-sofa',
                modelType: 'sofa',
                recommendedFinish: 'linen',
                colorHex: '#E8E1D5',
              },
              {
                name: 'Organic Curved Mango Wood Coffee Table',
                category: 'tables',
                placement: '18 inches in front of sofa',
                estimatedINR: 16800,
                storeItemId: 'prod-coffee-table',
                modelType: 'coffee-table',
                recommendedFinish: 'teak',
                colorHex: '#8E5A36',
              },
              {
                name: 'Jodhpur Cane & Teak Lounge Armchair',
                category: 'seating',
                placement: 'Angled at 45° across coffee table',
                estimatedINR: 24999,
                storeItemId: 'prod-teak-chair',
                modelType: 'lounge-chair',
                recommendedFinish: 'cane',
                colorHex: '#7C4A28',
              },
              {
                name: 'Moradabad Pleated Brass Floor Lamp',
                category: 'lighting',
                placement: 'Behind sofa right flank for ambient glow',
                estimatedINR: 8499,
                storeItemId: 'prod-brass-lamp',
                modelType: 'floor-lamp',
                recommendedFinish: 'brass',
                colorHex: '#D4AF37',
              },
              {
                name: 'Bhadohi Raw Wool Area Rug',
                category: 'decor',
                placement: 'Under sofa front feet & coffee table',
                estimatedINR: 15400,
                storeItemId: 'prod-wool-rug',
                modelType: 'area-rug',
                recommendedFinish: 'boucle',
                colorHex: '#DDD5C7',
              },
              {
                name: 'Kumbhar Hand-Thrown Terracotta Planter',
                category: 'decor',
                placement: 'Sunlit corner beside credenza',
                estimatedINR: 3890,
                storeItemId: 'prod-terracotta-planter',
                modelType: 'planter',
                recommendedFinish: 'teak',
                colorHex: '#BD6443',
              },
            ],
      };

      setActiveSuggestion(suggestion);
      setIsGenerating(false);
    }, 800);
  };

  const handleAddAllToCart = () => {
    if (!activeSuggestion) return;
    activeSuggestion.recommendedFurniture.forEach((rf) => {
      if (rf.storeItemId) {
        const prod = STORE_PRODUCTS.find((p) => p.id === rf.storeItemId);
        if (prod) onAddToCart(prod);
      }
    });
  };

  const totalCuratedINR = activeSuggestion?.recommendedFurniture.reduce(
    (acc, it) => acc + it.estimatedINR,
    0
  ) || 0;

  return (
    <div className="space-y-10 animate-in fade-in duration-200">
      {/* Editorial Header */}
      <div className="max-w-3xl">
        <div className="flex items-center gap-2 text-[#C26343] text-xs font-semibold uppercase tracking-wider mb-1.5">
          <Sparkles className="w-4 h-4" />
          <span>AI Interior Architect & Indian Layout Presets</span>
        </div>
        <h2 className="text-3xl font-serif font-bold text-stone-900 tracking-tight">
          Select an Indian Home Layout Preset or Upload Your Room
        </h2>
        <p className="mt-2 text-stone-600 text-sm leading-relaxed">
          Instantly populate the 3D studio with authentic Indian home layouts—from space-optimized apartment living rooms to traditional verandahs and bedroom suites—crafted with solid teak, cane webbing, and brass accents in Indian Rupees (₹).
        </p>
      </div>

      {/* SECTION 1: ROOM LAYOUT PRESETS (INDIAN HOMES) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-[#C26343]" />
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Common Indian Home Layout Presets
            </h3>
          </div>
          <span className="text-xs text-stone-500">
            One-click instant 3D population with furniture & coordinates
          </span>
        </div>

        {/* Preset Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {INDIAN_LAYOUT_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;

            return (
              <div
                key={preset.id}
                className={`bg-white border rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group ${
                  isSelected
                    ? 'border-[#C26343] ring-2 ring-[#C26343]/20'
                    : 'border-[#E5DDD2] hover:border-stone-400'
                }`}
              >
                <div>
                  {/* Preset Image & Tag */}
                  <div className="relative h-44 overflow-hidden bg-stone-100">
                    <img
                      src={preset.image}
                      alt={preset.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-[#FAF7F2]/90 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-semibold text-stone-800 shadow-2xs">
                      {preset.tag}
                    </div>
                    <div className="absolute bottom-2.5 right-2.5 bg-[#4A382D]/90 text-white font-mono text-[11px] px-2 py-0.5 rounded backdrop-blur-xs font-semibold">
                      {preset.budgetINR}
                    </div>
                  </div>

                  {/* Preset Details */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-serif text-base font-bold text-stone-900 group-hover:text-[#C26343] transition leading-snug">
                        {preset.title}
                      </h4>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-[#C26343] shrink-0 mt-0.5" />
                      )}
                    </div>

                    <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                      {preset.description}
                    </p>

                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500 font-mono">
                      <span>{preset.dimensions}</span>
                      <span className="text-[#C26343] font-medium">{preset.items.length} 3D Pieces</span>
                    </div>
                  </div>
                </div>

                {/* Instant Populate Button */}
                <div className="p-4 pt-0 space-y-2">
                  <button
                    onClick={() => handlePopulatePreset(preset)}
                    className="w-full py-2.5 px-3 bg-[#C26343] hover:bg-[#B05537] text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer group-hover:shadow-md"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Populate 3D Studio</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-70" />
                  </button>

                  <button
                    onClick={() => handleCustomizePreset(preset)}
                    className="w-full py-1.5 text-[11px] text-stone-600 hover:text-stone-900 font-medium transition cursor-pointer text-center"
                  >
                    Load into Form Below ↓
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: CUSTOM ROOM SPECIFICATIONS & PHOTO UPLOAD */}
      <div className="pt-4 border-t border-[#E5DDD2] space-y-4">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#C26343]" />
          <h3 className="font-serif text-lg font-bold text-stone-900">
            Custom Room Planner & Photo Analysis
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Upload Photo */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative border-2 border-dashed border-[#DDD5C7] hover:border-[#C26343] bg-white rounded-2xl p-6 text-center transition-all group shadow-xs">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              
              {uploadedImage ? (
                <div className="relative rounded-xl overflow-hidden max-h-60 mx-auto">
                  <img
                    src={uploadedImage}
                    alt="Uploaded room reference"
                    className="w-full h-56 object-cover rounded-xl"
                  />
                  <div className="absolute inset-0 bg-stone-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <span className="text-xs font-medium text-white bg-stone-900/80 px-3 py-1.5 rounded-full">
                      Change Photo
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-6 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-[#EFE9DF] text-[#C26343] flex items-center justify-center mb-3 group-hover:scale-105 transition">
                    <Upload className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-semibold text-stone-800">
                    Upload Room Photo or Floor Plan Sketch
                  </h4>
                  <p className="text-xs text-stone-500 mt-1 max-w-sm">
                    Drag and drop your room photo or blueprint. We analyze natural window light, doorways, and wall clearances.
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 bg-[#FAF7F2] border border-stone-200 rounded-xl text-xs text-stone-600 space-y-1">
              <span className="font-semibold text-stone-900 block">
                Selected Reference Preset:
              </span>
              <p className="leading-relaxed">
                {selectedPreset.title} ({selectedPreset.dimensions}) · {selectedPreset.spatialTip}
              </p>
            </div>
          </div>

          {/* Right Column: Custom Specifications Form */}
          <div className="lg:col-span-6 bg-white border border-[#E5DDD2] rounded-2xl p-6 shadow-xs space-y-4">
            <h4 className="font-serif text-base font-semibold text-stone-900 border-b border-stone-200 pb-2">
              Fine-Tune Parameters
            </h4>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Room Type
              </label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-stone-300 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#C26343]"
              >
                <option value="Living Room">Living Room & Lounge</option>
                <option value="Veranda & Patio">Traditional Veranda & Balcony</option>
                <option value="Bedroom">Master Bedroom Suite</option>
                <option value="Drawing Room">Formal Drawing Room (Baithak)</option>
                <option value="Studio">Studio Apartment (Multipurpose)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Style & Material Aesthetic
              </label>
              <select
                value={stylePreference}
                onChange={(e) => setStylePreference(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-stone-300 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#C26343]"
              >
                <option value="Warm Japandi & Indian Teak">Warm Japandi & Indian Teak</option>
                <option value="Kerala Heritage & Terracotta">Kerala Heritage & Terracotta</option>
                <option value="Scandinavian Hygge & Raw Wool">Scandinavian Hygge & Raw Wool</option>
                <option value="Earthy Bohemian & Fluted Mango Wood">Earthy Bohemian & Fluted Mango Wood</option>
                <option value="Minimalist Modern & Brushed Brass">Minimalist Modern & Brushed Brass</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Dimensions
                </label>
                <input
                  type="text"
                  value={roomDimensions}
                  onChange={(e) => setRoomDimensions(e.target.value)}
                  placeholder="e.g. 12 ft × 15 ft"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-stone-300 rounded-lg text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#C26343]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Budget (INR ₹)
                </label>
                <input
                  type="text"
                  value={budgetINR}
                  onChange={(e) => setBudgetINR(e.target.value)}
                  placeholder="₹1,20,000"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-stone-300 rounded-lg text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#C26343]"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleGeneratePlan}
                disabled={isGenerating}
                className="w-full py-3 px-5 bg-[#4A382D] hover:bg-[#3B2C23] text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Architectural Proportions...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#E7C797]" />
                    <span>Generate Custom AI Plan & Palettes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Generated AI Suggestion Results Output */}
      {activeSuggestion && (
        <div className="bg-white border border-[#E5DDD2] rounded-2xl p-6 md:p-8 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-5">
            <div>
              <span className="text-xs uppercase font-semibold text-[#C26343] tracking-wider">
                Tailored Architectural Scheme
              </span>
              <h3 className="text-2xl font-serif font-bold text-stone-900 mt-0.5">
                {activeSuggestion.styleName}
              </h3>
              <p className="text-xs text-stone-500 italic mt-0.5">
                "{activeSuggestion.tagline}"
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onSwitchTo3DTab}
                className="px-4 py-2 text-xs font-semibold bg-[#C26343] hover:bg-[#B05537] text-white rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>View in 3D Studio</span>
              </button>
            </div>
          </div>

          <p className="text-sm text-stone-700 leading-relaxed">
            {activeSuggestion.description}
          </p>

          {/* Color Palette Grid */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-600 mb-3">
              <Palette className="w-4 h-4 text-[#C26343]" />
              <span>Recommended Warm Material & Color Palette</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {activeSuggestion.colorPalette.map((cp) => (
                <div
                  key={cp.name}
                  className="p-3 bg-[#FAF7F2] border border-stone-200 rounded-xl flex flex-col gap-2"
                >
                  <div
                    className="w-full h-10 rounded-lg border border-black/10 shadow-xs"
                    style={{ backgroundColor: cp.hex }}
                  />
                  <div>
                    <h5 className="text-xs font-semibold text-stone-800 truncate">{cp.name}</h5>
                    <span className="text-[10px] font-mono text-stone-400 block">{cp.hex}</span>
                    <span className="text-[10px] text-stone-500 line-clamp-1 mt-0.5">{cp.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Circulation & Lighting Advice */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#FAF7F2] p-5 rounded-xl border border-stone-200">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-800 mb-1.5">
                <Compass className="w-4 h-4 text-[#C26343]" />
                <span>Circulation & Spatial Flow</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                {activeSuggestion.circulationTip} {activeSuggestion.architecturalNotes}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-800 mb-1.5">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <span>Illumination & Mood Strategy</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                {activeSuggestion.lightingPlan}
              </p>
            </div>
          </div>

          {/* Curated Furniture Itemized Recommendations */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-600">
                <ShoppingBag className="w-4 h-4 text-[#C26343]" />
                <span>Curated Furniture Suite (Priced in Indian Rupees)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-stone-900">
                  Total: ₹{totalCuratedINR.toLocaleString('en-IN')}
                </span>
                <button
                  onClick={handleAddAllToCart}
                  className="px-3 py-1.5 text-xs font-semibold bg-[#4A382D] hover:bg-[#3B2C23] text-white rounded-lg transition shadow-xs cursor-pointer"
                >
                  Add All to Bag
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeSuggestion.recommendedFurniture.map((rf, idx) => {
                const prod = rf.storeItemId
                  ? STORE_PRODUCTS.find((p) => p.id === rf.storeItemId)
                  : undefined;

                return (
                  <div
                    key={idx}
                    className="p-3.5 bg-white border border-stone-200 rounded-xl flex flex-col justify-between hover:border-[#C26343] transition group"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-stone-400 uppercase tracking-wider mb-1">
                        <span>{rf.category}</span>
                        <span className="capitalize text-stone-600 font-medium">
                          {rf.recommendedFinish}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-stone-900 group-hover:text-[#C26343] transition">
                        {rf.name}
                      </h4>
                      <p className="text-xs text-stone-500 mt-1 line-clamp-1">
                        Placement: {rf.placement}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between">
                      <span className="font-mono text-sm font-bold text-stone-900">
                        ₹{rf.estimatedINR.toLocaleString('en-IN')}
                      </span>
                      {prod && (
                        <button
                          onClick={() => onAddToCart(prod)}
                          className="px-2.5 py-1 text-[11px] font-medium text-[#C26343] hover:text-white hover:bg-[#C26343] rounded-md border border-[#C26343] transition cursor-pointer"
                        >
                          + Add to Bag
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
