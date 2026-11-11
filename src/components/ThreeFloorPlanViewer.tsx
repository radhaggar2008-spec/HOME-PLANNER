import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { FloorPlanItem, MaterialFinish, CameraPreset, AmbiancePreset, StoreProduct } from '../types';
import { STORE_PRODUCTS } from '../data/storeProducts';
import { 
  RotateCw, 
  Move, 
  Trash2, 
  Plus, 
  Eye, 
  Sun, 
  Moon, 
  Compass, 
  ShoppingBag, 
  Check, 
  ChevronUp, 
  ChevronDown,
  Layers,
  Sparkles,
  Maximize2,
  Lightbulb,
  SlidersHorizontal,
  Flame,
  Power
} from 'lucide-react';
import { 
  LIGHTING_TEMPERATURE_PRESETS, 
  kelvinToHex, 
  getTemperatureLabel, 
  getIntensityLabel 
} from '../utils/lighting';

interface ThreeFloorPlanViewerProps {
  items: FloorPlanItem[];
  onItemsChange: (items: FloorPlanItem[]) => void;
  onAddToCart: (product: StoreProduct, finish?: string) => void;
  onNavigateToStore: (productId?: string) => void;
}

export const ThreeFloorPlanViewer: React.FC<ThreeFloorPlanViewerProps> = ({
  items,
  onItemsChange,
  onAddToCart,
  onNavigateToStore,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(items[0]?.id || null);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('perspective');
  const [ambiance, setAmbiance] = useState<AmbiancePreset>('golden-hour');
  const [isHudCollapsed, setIsHudCollapsed] = useState(false);
  const [itemControlTab, setItemControlTab] = useState<'lighting' | 'materials'>('lighting');
  const [addedNotification, setAddedNotification] = useState<string | null>(null);

  // References to keep Three.js state stable
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const furnitureGroupsRef = useRef<Map<string, THREE.Group>>(new Map());
  const selectionRingRef = useRef<THREE.Mesh | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const lampLightRef = useRef<THREE.PointLight | null>(null);

  // Pointer & Gesture tracking
  const isPointerDownRef = useRef(false);
  const pointerStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraAnglesRef = useRef({ theta: Math.PI / 4, phi: Math.PI / 3, radius: 7.5 });
  const touchDistanceStartRef = useRef<number | null>(null);

  const selectedItem = items.find((it) => it.id === selectedItemId);
  const matchedStoreProduct = selectedItem?.storeItemId 
    ? STORE_PRODUCTS.find((p) => p.id === selectedItem.storeItemId) 
    : undefined;

  const selectedIsLightSource = Boolean(selectedItem?.isLightSource || selectedItem?.category === 'lighting');
  const lightingPiece = items.find((it) => it.isLightSource || it.category === 'lighting');

  // Sync tab mode when selected piece changes
  useEffect(() => {
    if (selectedItem?.isLightSource || selectedItem?.category === 'lighting') {
      setItemControlTab('lighting');
    } else {
      setItemControlTab('materials');
    }
  }, [selectedItemId]);

  // Architectural Dimensions: Procedural room floor is 5.8m × 5.8m = 33.64 m²
  const SQ_METERS_TO_SQ_FT = 10.76391;
  const TOTAL_ROOM_AREA_SQ_FT = 362.1;

  // Calculate total occupied floor footprint (sq ft) based on placed furniture dimensions and individual scale
  const occupiedAreaSqFt = items.reduce((total, item) => {
    const storeProd = item.storeItemId ? STORE_PRODUCTS.find(p => p.id === item.storeItemId) : null;
    const modelType = storeProd?.modelType || (item.category === 'lighting' ? 'floor-lamp' : item.category === 'tables' ? 'coffee-table' : 'sofa');

    let widthM = 1.0;
    let depthM = 1.0;

    switch (modelType) {
      case 'sofa':
        widthM = 2.20;
        depthM = 0.96;
        break;
      case 'coffee-table':
        widthM = 1.25;
        depthM = 0.68;
        break;
      case 'lounge-chair':
        widthM = 0.74;
        depthM = 0.82;
        break;
      case 'floor-lamp':
        widthM = 0.44;
        depthM = 0.44;
        break;
      case 'credenza':
        widthM = 1.70;
        depthM = 0.44;
        break;
      case 'planter':
        widthM = 0.38;
        depthM = 0.38;
        break;
      case 'bed':
        widthM = 2.14;
        depthM = 1.92;
        break;
      case 'area-rug':
        widthM = 2.40;
        depthM = 1.70;
        break;
      default:
        widthM = 1.0;
        depthM = 1.0;
    }

    const scaleFactor = (item.scale[0] || 1) * (item.scale[2] || 1);
    return total + widthM * depthM * scaleFactor * SQ_METERS_TO_SQ_FT;
  }, 0);

  const occupancyPercent = Math.min(100, Math.round((occupiedAreaSqFt / TOTAL_ROOM_AREA_SQ_FT) * 100));
  const freeCirculationSqFt = Math.max(0, TOTAL_ROOM_AREA_SQ_FT - occupiedAreaSqFt);

  // Create procedural wood floor texture
  const createWoodFloorTexture = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Warm natural oak base
    ctx.fillStyle = '#E8DFD0';
    ctx.fillRect(0, 0, 1024, 1024);

    // Draw planks
    const plankHeight = 64;
    const plankCount = 1024 / plankHeight;

    for (let i = 0; i < plankCount; i++) {
      const y = i * plankHeight;
      // Slight tone shift per plank
      const toneVariation = (Math.sin(i * 13) * 0.5 + 0.5) * 16 - 8;
      ctx.fillStyle = `rgb(${225 + toneVariation}, ${212 + toneVariation}, ${192 + toneVariation})`;
      ctx.fillRect(0, y, 1024, plankHeight - 2);

      // Plank seam line
      ctx.fillStyle = 'rgba(120, 100, 80, 0.25)';
      ctx.fillRect(0, y + plankHeight - 2, 1024, 2);

      // Vertical stagger seams
      const staggerOffset = (i % 3) * 340;
      for (let x = staggerOffset; x < 1024; x += 380) {
        ctx.fillRect(x, y, 2, plankHeight - 2);
      }

      // Fine wood grain lines
      ctx.strokeStyle = 'rgba(140, 115, 90, 0.08)';
      ctx.lineWidth = 1;
      for (let g = 0; g < 4; g++) {
        ctx.beginPath();
        const gy = y + 8 + g * 12 + Math.sin(g) * 3;
        ctx.moveTo(0, gy);
        ctx.bezierCurveTo(300, gy + 3, 700, gy - 2, 1024, gy + 1);
        ctx.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);

  // Material builder helper based on finish and color
  const getMaterialForFinish = useCallback((finish: MaterialFinish, colorHex: string) => {
    switch (finish) {
      case 'teak':
        return new THREE.MeshStandardMaterial({
          color: new THREE.Color(colorHex || '#7C4A28'),
          roughness: 0.5,
          metalness: 0.05,
        });
      case 'walnut':
        return new THREE.MeshStandardMaterial({
          color: new THREE.Color(colorHex || '#4A3326'),
          roughness: 0.45,
          metalness: 0.05,
        });
      case 'oak':
        return new THREE.MeshStandardMaterial({
          color: new THREE.Color(colorHex || '#C4A47C'),
          roughness: 0.6,
          metalness: 0.02,
        });
      case 'brass':
        return new THREE.MeshStandardMaterial({
          color: new THREE.Color(colorHex || '#D4AF37'),
          roughness: 0.25,
          metalness: 0.85,
        });
      case 'cane':
        return new THREE.MeshStandardMaterial({
          color: new THREE.Color(colorHex || '#CDB083'),
          roughness: 0.8,
          metalness: 0.0,
        });
      case 'velvet':
        return new THREE.MeshStandardMaterial({
          color: new THREE.Color(colorHex || '#5B4033'),
          roughness: 0.85,
          metalness: 0.1,
        });
      case 'linen':
      case 'boucle':
      default:
        return new THREE.MeshStandardMaterial({
          color: new THREE.Color(colorHex || '#E5DDD0'),
          roughness: 0.9,
          metalness: 0.0,
        });
    }
  }, []);

  // Procedural Model Generators (Composite THREE.Group 3-12 parts)
  const buildProceduralFurniture = useCallback((item: FloorPlanItem) => {
    const group = new THREE.Group();
    group.name = item.id;
    group.userData = { id: item.id };

    const mainMat = getMaterialForFinish(item.finish, item.color);
    const woodTrimMat = getMaterialForFinish('teak', '#694326');
    const brassMat = getMaterialForFinish('brass', '#D4AF37');
    const fabricMat = getMaterialForFinish('linen', item.color);

    const storeProd = item.storeItemId ? STORE_PRODUCTS.find(p => p.id === item.storeItemId) : null;
    const modelType = storeProd?.modelType || (item.category === 'lighting' ? 'floor-lamp' : item.category === 'tables' ? 'coffee-table' : 'sofa');

    if (modelType === 'sofa') {
      // 1. Plinth wood base
      const baseGeo = new THREE.BoxGeometry(2.1, 0.1, 0.9);
      const baseMesh = new THREE.Mesh(baseGeo, woodTrimMat);
      baseMesh.position.y = 0.05;
      baseMesh.castShadow = true;
      baseMesh.receiveShadow = true;
      group.add(baseMesh);

      // 2. Thick plush seat bench
      const seatGeo = new THREE.BoxGeometry(2.06, 0.28, 0.86);
      const seatMesh = new THREE.Mesh(seatGeo, fabricMat);
      seatMesh.position.y = 0.24;
      seatMesh.castShadow = true;
      group.add(seatMesh);

      // 3. Backrest cushion
      const backGeo = new THREE.BoxGeometry(2.06, 0.45, 0.24);
      const backMesh = new THREE.Mesh(backGeo, fabricMat);
      backMesh.position.set(0, 0.52, -0.32);
      backMesh.castShadow = true;
      group.add(backMesh);

      // 4 & 5. Left and Right Armrests
      const armGeo = new THREE.BoxGeometry(0.2, 0.38, 0.86);
      const leftArm = new THREE.Mesh(armGeo, fabricMat);
      leftArm.position.set(-0.95, 0.38, 0);
      leftArm.castShadow = true;
      group.add(leftArm);

      const rightArm = new THREE.Mesh(armGeo, fabricMat);
      rightArm.position.set(0.95, 0.38, 0);
      rightArm.castShadow = true;
      group.add(rightArm);

      // 6 & 7. Accent pillows (Terracotta and Oat)
      const pillowGeo = new THREE.BoxGeometry(0.35, 0.35, 0.12);
      const pillowMat1 = new THREE.MeshStandardMaterial({ color: '#C26343', roughness: 0.85 }); // terracotta
      const pillow1 = new THREE.Mesh(pillowGeo, pillowMat1);
      pillow1.position.set(-0.65, 0.44, -0.18);
      pillow1.rotation.y = 0.18;
      pillow1.castShadow = true;
      group.add(pillow1);

      const pillowMat2 = new THREE.MeshStandardMaterial({ color: '#DFD8CC', roughness: 0.9 });
      const pillow2 = new THREE.Mesh(pillowGeo, pillowMat2);
      pillow2.position.set(0.65, 0.44, -0.18);
      pillow2.rotation.y = -0.15;
      pillow2.castShadow = true;
      group.add(pillow2);
    } 
    else if (modelType === 'coffee-table') {
      // 1. Organic curved tabletop
      const topGeo = new THREE.CylinderGeometry(0.62, 0.62, 0.06, 32);
      topGeo.scale(1.25, 1, 0.8); // oval organic pebble shape
      const topMesh = new THREE.Mesh(topGeo, mainMat);
      topMesh.position.y = 0.38;
      topMesh.castShadow = true;
      topMesh.receiveShadow = true;
      group.add(topMesh);

      // 2, 3, 4. Three fluted pillar legs
      const legGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.35, 16);
      const legPositions = [
        [-0.45, 0.175, 0.15],
        [0.45, 0.175, 0.15],
        [0, 0.175, -0.28],
      ];
      legPositions.forEach(([lx, ly, lz]) => {
        const leg = new THREE.Mesh(legGeo, mainMat);
        leg.position.set(lx, ly, lz);
        leg.castShadow = true;
        group.add(leg);
      });

      // 5. Stylized book on table
      const bookGeo = new THREE.BoxGeometry(0.24, 0.025, 0.18);
      const bookMat = new THREE.MeshStandardMaterial({ color: '#E8E1D5', roughness: 0.7 });
      const bookMesh = new THREE.Mesh(bookGeo, bookMat);
      bookMesh.position.set(0.12, 0.42, 0.02);
      bookMesh.rotation.y = 0.25;
      group.add(bookMesh);

      // 6. Ceramic cup
      const cupGeo = new THREE.CylinderGeometry(0.04, 0.035, 0.06, 16);
      const cupMat = new THREE.MeshStandardMaterial({ color: '#FAF7F2', roughness: 0.3 });
      const cupMesh = new THREE.Mesh(cupGeo, cupMat);
      cupMesh.position.set(-0.2, 0.44, -0.05);
      group.add(cupMesh);
    }
    else if (modelType === 'lounge-chair') {
      // 1. Angled legs frame (4 legs)
      const legGeo = new THREE.CylinderGeometry(0.025, 0.02, 0.4, 12);
      const legCoords = [
        [-0.32, 0.2, 0.3],
        [0.32, 0.2, 0.3],
        [-0.28, 0.2, -0.28],
        [0.28, 0.2, -0.28],
      ];
      legCoords.forEach(([lx, ly, lz]) => {
        const leg = new THREE.Mesh(legGeo, woodTrimMat);
        leg.position.set(lx, ly, lz);
        leg.rotation.z = lx > 0 ? -0.1 : 0.1;
        leg.castShadow = true;
        group.add(leg);
      });

      // 2. Teak frame perimeter
      const seatFrameGeo = new THREE.BoxGeometry(0.68, 0.05, 0.68);
      const seatFrame = new THREE.Mesh(seatFrameGeo, woodTrimMat);
      seatFrame.position.y = 0.36;
      seatFrame.castShadow = true;
      group.add(seatFrame);

      // 3. Thick cozy cushion
      const seatCushionGeo = new THREE.BoxGeometry(0.62, 0.14, 0.62);
      const cushionMesh = new THREE.Mesh(seatCushionGeo, fabricMat);
      cushionMesh.position.y = 0.45;
      cushionMesh.castShadow = true;
      group.add(cushionMesh);

      // 4. Cane woven backrest
      const backGeo = new THREE.BoxGeometry(0.64, 0.48, 0.04);
      const caneMat = getMaterialForFinish('cane', '#D8BE93');
      const backMesh = new THREE.Mesh(backGeo, caneMat);
      backMesh.position.set(0, 0.65, -0.32);
      backMesh.rotation.x = -0.18;
      backMesh.castShadow = true;
      group.add(backMesh);

      // 5 & 6. Wooden Armrests
      const armGeo = new THREE.BoxGeometry(0.06, 0.03, 0.52);
      const lArm = new THREE.Mesh(armGeo, woodTrimMat);
      lArm.position.set(-0.35, 0.54, 0);
      lArm.castShadow = true;
      group.add(lArm);

      const rArm = new THREE.Mesh(armGeo, woodTrimMat);
      rArm.position.set(0.35, 0.54, 0);
      rArm.castShadow = true;
      group.add(rArm);
    }
    else if (modelType === 'floor-lamp') {
      const activeIntensity = typeof item.lightIntensity === 'number' ? item.lightIntensity : 1.8;
      const lightHex = item.lightColor || (item.colorTemperatureK ? kelvinToHex(item.colorTemperatureK) : '#FFDF9E');

      // 1. Heavy circular brass base
      const baseGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.025, 32);
      const baseMesh = new THREE.Mesh(baseGeo, brassMat);
      baseMesh.position.y = 0.0125;
      baseMesh.castShadow = true;
      group.add(baseMesh);

      // 2. Slim brass vertical rod
      const rodGeo = new THREE.CylinderGeometry(0.015, 0.015, 1.45, 16);
      const rodMesh = new THREE.Mesh(rodGeo, brassMat);
      rodMesh.position.y = 0.74;
      rodMesh.castShadow = true;
      group.add(rodMesh);

      // 3. Angled articulation joint
      const jointGeo = new THREE.SphereGeometry(0.03, 16, 16);
      const jointMesh = new THREE.Mesh(jointGeo, brassMat);
      jointMesh.position.set(0, 1.48, 0);
      group.add(jointMesh);

      // 4. Pleated paper cone shade
      const shadeGeo = new THREE.ConeGeometry(0.26, 0.32, 28, 1, true);
      const shadeMat = new THREE.MeshStandardMaterial({
        color: '#FFF8EC',
        roughness: 0.6,
        side: THREE.DoubleSide,
        emissive: new THREE.Color(lightHex),
        emissiveIntensity: activeIntensity > 0 ? Math.min(1.4, 0.15 + activeIntensity * 0.35) : 0,
      });
      const shadeMesh = new THREE.Mesh(shadeGeo, shadeMat);
      shadeMesh.position.set(0, 1.34, 0);
      shadeMesh.castShadow = true;
      group.add(shadeMesh);

      // 5. Internal Point Light (cozy glow)
      if (activeIntensity > 0) {
        const pLight = new THREE.PointLight(new THREE.Color(lightHex), activeIntensity * 1.5, 6.0, 1.8);
        pLight.position.set(0, 1.32, 0);
        pLight.castShadow = true;
        pLight.shadow.bias = -0.002;
        group.add(pLight);
        lampLightRef.current = pLight;
      }
    }
    else if (modelType === 'area-rug') {
      // Tactile rug with subtle thickness and edge fringe
      const rugGeo = new THREE.BoxGeometry(2.4, 0.015, 1.7);
      const rugMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(item.color || '#DDD5C7'),
        roughness: 0.95,
        metalness: 0.0,
      });
      const rugMesh = new THREE.Mesh(rugGeo, rugMat);
      rugMesh.position.y = 0.008;
      rugMesh.receiveShadow = true;
      group.add(rugMesh);

      // Fringe details along edges
      const fringeGeo = new THREE.BoxGeometry(2.44, 0.008, 0.05);
      const fringeMat = new THREE.MeshStandardMaterial({ color: '#C8BFB2', roughness: 0.9 });
      const topFringe = new THREE.Mesh(fringeGeo, fringeMat);
      topFringe.position.set(0, 0.004, 0.86);
      group.add(topFringe);

      const bottomFringe = new THREE.Mesh(fringeGeo, fringeMat);
      bottomFringe.position.set(0, 0.004, -0.86);
      group.add(bottomFringe);
    }
    else if (modelType === 'credenza') {
      // 1. Main credenza cabinet
      const bodyGeo = new THREE.BoxGeometry(1.7, 0.42, 0.44);
      const bodyMesh = new THREE.Mesh(bodyGeo, mainMat);
      bodyMesh.position.y = 0.35;
      bodyMesh.castShadow = true;
      bodyMesh.receiveShadow = true;
      group.add(bodyMesh);

      // 2, 3, 4, 5. 4 Tapered angled wooden legs
      const legGeo = new THREE.CylinderGeometry(0.025, 0.018, 0.16, 12);
      const legs = [
        [-0.75, 0.08, 0.16],
        [0.75, 0.08, 0.16],
        [-0.75, 0.08, -0.16],
        [0.75, 0.08, -0.16],
      ];
      legs.forEach(([lx, ly, lz]) => {
        const leg = new THREE.Mesh(legGeo, woodTrimMat);
        leg.position.set(lx, ly, lz);
        leg.castShadow = true;
        group.add(leg);
      });

      // 6. Ceramic vase on credenza
      const vaseGeo = new THREE.CylinderGeometry(0.04, 0.065, 0.18, 16);
      const vaseMat = new THREE.MeshStandardMaterial({ color: '#E8E1D5', roughness: 0.4 });
      const vaseMesh = new THREE.Mesh(vaseGeo, vaseMat);
      vaseMesh.position.set(-0.45, 0.65, 0);
      group.add(vaseMesh);
    }
    else if (modelType === 'planter') {
      // 1. Terracotta clay pot
      const potGeo = new THREE.CylinderGeometry(0.24, 0.18, 0.42, 24);
      const potMat = new THREE.MeshStandardMaterial({ color: '#BD6443', roughness: 0.9 });
      const potMesh = new THREE.Mesh(potGeo, potMat);
      potMesh.position.y = 0.21;
      potMesh.castShadow = true;
      group.add(potMesh);

      // 2. Dark soil circle
      const soilGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.02, 24);
      const soilMat = new THREE.MeshStandardMaterial({ color: '#2B1E16', roughness: 1.0 });
      const soilMesh = new THREE.Mesh(soilGeo, soilMat);
      soilMesh.position.y = 0.41;
      group.add(soilMesh);

      // 3. Plant stem
      const stemGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.75, 12);
      const stemMat = new THREE.MeshStandardMaterial({ color: '#3A4B29', roughness: 0.7 });
      const stemMesh = new THREE.Mesh(stemGeo, stemMat);
      stemMesh.position.y = 0.75;
      group.add(stemMesh);

      // 4, 5, 6, 7. Fiddle leaf foliage leaves
      const leafGeo = new THREE.SphereGeometry(0.16, 12, 12);
      leafGeo.scale(1.4, 0.1, 0.8);
      const leafMat = new THREE.MeshStandardMaterial({ color: '#2F4F24', roughness: 0.5 });
      const leafHeights = [0.65, 0.85, 1.05, 1.2];
      leafHeights.forEach((h, idx) => {
        const leaf = new THREE.Mesh(leafGeo, leafMat);
        leaf.position.set(Math.sin(idx * 2) * 0.12, h, Math.cos(idx * 2) * 0.12);
        leaf.rotation.y = idx * 1.5;
        leaf.rotation.z = (idx % 2 === 0 ? 1 : -1) * 0.35;
        leaf.castShadow = true;
        group.add(leaf);
      });
    }
    else if (modelType === 'bed') {
      // Platform base
      const bedBaseGeo = new THREE.BoxGeometry(2.0, 0.25, 2.1);
      const bedBase = new THREE.Mesh(bedBaseGeo, woodTrimMat);
      bedBase.position.y = 0.125;
      bedBase.castShadow = true;
      group.add(bedBase);

      // Headboard
      const headboardGeo = new THREE.BoxGeometry(2.0, 0.85, 0.1);
      const headboard = new THREE.Mesh(headboardGeo, woodTrimMat);
      headboard.position.set(0, 0.55, -1.0);
      headboard.castShadow = true;
      group.add(headboard);

      // Thick comfortable mattress
      const mattressGeo = new THREE.BoxGeometry(1.8, 0.28, 1.9);
      const mattress = new THREE.Mesh(mattressGeo, fabricMat);
      mattress.position.set(0, 0.38, 0.02);
      mattress.castShadow = true;
      group.add(mattress);

      // Folded duvet
      const duvetGeo = new THREE.BoxGeometry(1.82, 0.12, 1.3);
      const duvetMat = new THREE.MeshStandardMaterial({ color: '#D5C4AF', roughness: 0.9 });
      const duvet = new THREE.Mesh(duvetGeo, duvetMat);
      duvet.position.set(0, 0.46, 0.32);
      duvet.castShadow = true;
      group.add(duvet);

      // Two plush pillows
      const pGeo = new THREE.BoxGeometry(0.65, 0.14, 0.4);
      const pMat = new THREE.MeshStandardMaterial({ color: '#FAF7F2', roughness: 0.95 });
      const p1 = new THREE.Mesh(pGeo, pMat);
      p1.position.set(-0.48, 0.54, -0.65);
      p1.rotation.x = 0.15;
      group.add(p1);

      const p2 = new THREE.Mesh(pGeo, pMat);
      p2.position.set(0.48, 0.54, -0.65);
      p2.rotation.x = 0.15;
      group.add(p2);
    }
    else {
      // Fallback clean architectural piece
      const cubeGeo = new THREE.BoxGeometry(1, 0.7, 1);
      const cubeMesh = new THREE.Mesh(cubeGeo, mainMat);
      cubeMesh.position.y = 0.35;
      cubeMesh.castShadow = true;
      group.add(cubeMesh);
    }

    // If any other furniture item has isLightSource enabled, attach a localized ambient accent glow
    if (item.isLightSource && modelType !== 'floor-lamp') {
      const activeIntensity = typeof item.lightIntensity === 'number' ? item.lightIntensity : 1.8;
      const lightHex = item.lightColor || (item.colorTemperatureK ? kelvinToHex(item.colorTemperatureK) : '#FFDF9E');
      if (activeIntensity > 0) {
        const pLight = new THREE.PointLight(new THREE.Color(lightHex), activeIntensity * 1.2, 5.0, 1.8);
        pLight.position.set(0, 0.75, 0);
        pLight.castShadow = true;
        pLight.shadow.bias = -0.002;
        group.add(pLight);
      }
    }

    // Set instance coordinates
    group.position.set(item.position[0], item.position[1], item.position[2]);
    group.rotation.y = item.rotation;
    group.scale.set(item.scale[0], item.scale[1], item.scale[2]);

    return group;
  }, [getMaterialForFinish]);

  // Update Three.js scene objects when items change
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove existing furniture groups
    furnitureGroupsRef.current.forEach((grp) => {
      scene.remove(grp);
    });
    furnitureGroupsRef.current.clear();

    // Rebuild furniture items
    items.forEach((item) => {
      const group = buildProceduralFurniture(item);
      scene.add(group);
      furnitureGroupsRef.current.set(item.id, group);
    });

    // Update selection ring position
    if (selectionRingRef.current) {
      if (selectedItemId) {
        const selItem = items.find((it) => it.id === selectedItemId);
        if (selItem) {
          selectionRingRef.current.visible = true;
          selectionRingRef.current.position.set(selItem.position[0], 0.015, selItem.position[2]);
          selectionRingRef.current.rotation.y = selItem.rotation;
        } else {
          selectionRingRef.current.visible = false;
        }
      } else {
        selectionRingRef.current.visible = false;
      }
    }
  }, [items, selectedItemId, buildProceduralFurniture]);

  // Ambiance Lighting Adjustment
  useEffect(() => {
    if (!dirLightRef.current || !hemiLightRef.current || !sceneRef.current) return;

    if (ambiance === 'golden-hour') {
      dirLightRef.current.color.setHex(0xFFD3A3); // warm 3000K sunset
      dirLightRef.current.intensity = 2.4;
      dirLightRef.current.position.set(4.5, 6, 3.5);
      hemiLightRef.current.color.setHex(0xFFE9D0);
      hemiLightRef.current.groundColor.setHex(0x524133);
      hemiLightRef.current.intensity = 1.1;
      sceneRef.current.background = new THREE.Color('#FAF5EC');
    } else if (ambiance === 'cozy-evening') {
      dirLightRef.current.color.setHex(0xE09355); // rich amber evening
      dirLightRef.current.intensity = 1.2;
      dirLightRef.current.position.set(3, 4, 3);
      hemiLightRef.current.color.setHex(0xD8A878);
      hemiLightRef.current.groundColor.setHex(0x2D211A);
      hemiLightRef.current.intensity = 0.7;
      sceneRef.current.background = new THREE.Color('#2C241E');
    } else {
      // bright-morning
      dirLightRef.current.color.setHex(0xFFF8F0); // fresh daylight
      dirLightRef.current.intensity = 2.6;
      dirLightRef.current.position.set(5, 7.5, 2.5);
      hemiLightRef.current.color.setHex(0xEAF3FF);
      hemiLightRef.current.groundColor.setHex(0x8C7A68);
      hemiLightRef.current.intensity = 1.2;
      sceneRef.current.background = new THREE.Color('#F6F7F8');
    }
  }, [ambiance]);

  // Camera presets transition
  useEffect(() => {
    if (!cameraRef.current) return;
    if (cameraPreset === 'top-down') {
      cameraAnglesRef.current = { theta: 0.001, phi: 0.05, radius: 9.0 };
    } else if (cameraPreset === 'cozy-corner') {
      cameraAnglesRef.current = { theta: Math.PI / 2.8, phi: Math.PI / 3.4, radius: 6.2 };
    } else if (cameraPreset === 'front') {
      cameraAnglesRef.current = { theta: 0, phi: Math.PI / 2.5, radius: 7.0 };
    } else {
      // perspective
      cameraAnglesRef.current = { theta: Math.PI / 4.2, phi: Math.PI / 3.2, radius: 7.8 };
    }
  }, [cameraPreset]);

  // Setup Three.js scene once on mount
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 580;

    // Detect software gl
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('#FAF5EC');

    // Soft architectural fog
    scene.fog = new THREE.FogExp2('#FAF5EC', 0.045);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 50);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.replaceChildren(renderer.domElement);

    // Studio Environment Reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Balanced Lighting Rig
    const dirLight = new THREE.DirectionalLight(0xFFD3A3, 2.4);
    dirLight.position.set(4.5, 6, 3.5);
    dirLight.castShadow = !isSoftwareGl;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 20;
    dirLight.shadow.camera.left = -4.5;
    dirLight.shadow.camera.right = 4.5;
    dirLight.shadow.camera.top = 4.5;
    dirLight.shadow.camera.bottom = -4.5;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    const hemiLight = new THREE.HemisphereLight(0xFFE9D0, 0x524133, 1.1);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    // Room Architecture (Cutaway Floor Plan: Floor + 2 Walls + Baseboards)
    const floorTexture = createWoodFloorTexture();
    const floorGeo = new THREE.PlaneGeometry(5.8, 5.8);
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTexture || undefined,
      color: 0xFFFFFF,
      roughness: 0.65,
      metalness: 0.02,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Back Wall (warm limewash plaster look)
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xF2ECE2,
      roughness: 0.9,
      metalness: 0.0,
    });

    const backWallGeo = new THREE.BoxGeometry(5.8, 2.6, 0.16);
    const backWall = new THREE.Mesh(backWallGeo, wallMat);
    backWall.position.set(0, 1.3, -2.98);
    backWall.receiveShadow = true;
    scene.add(backWall);

    // Left Wall
    const leftWallGeo = new THREE.BoxGeometry(0.16, 2.6, 5.8);
    const leftWall = new THREE.Mesh(leftWallGeo, wallMat);
    leftWall.position.set(-2.98, 1.3, 0);
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    // Baseboards (wooden trim along wall base)
    const baseboardMat = new THREE.MeshStandardMaterial({ color: 0x543B2A, roughness: 0.6 });
    const bbBackGeo = new THREE.BoxGeometry(5.8, 0.12, 0.04);
    const bbBack = new THREE.Mesh(bbBackGeo, baseboardMat);
    bbBack.position.set(0, 0.06, -2.88);
    scene.add(bbBack);

    const bbLeftGeo = new THREE.BoxGeometry(0.04, 0.12, 5.8);
    const bbLeft = new THREE.Mesh(bbLeftGeo, baseboardMat);
    bbLeft.position.set(-2.88, 0.06, 0);
    scene.add(bbLeft);

    // Arched Wall Art / Decorative Canvas on Back Wall
    const artGeo = new THREE.BoxGeometry(1.6, 1.0, 0.03);
    const artMat = new THREE.MeshStandardMaterial({ color: 0xD6C4AD, roughness: 0.8 });
    const artMesh = new THREE.Mesh(artGeo, artMat);
    artMesh.position.set(-0.8, 1.6, -2.87);
    scene.add(artMesh);

    // Selection Ring (Floor Grounding Indicator)
    const ringGeo = new THREE.RingGeometry(0.65, 0.72, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xC26343,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.visible = false;
    scene.add(ringMesh);
    selectionRingRef.current = ringMesh;

    // Raycasting for object selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerSelect = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // Check intersections with furniture groups
      const clickableMeshes: THREE.Object3D[] = [];
      furnitureGroupsRef.current.forEach((grp) => {
        grp.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            clickableMeshes.push(child);
          }
        });
      });

      const intersects = raycaster.intersectObjects(clickableMeshes, false);
      if (intersects.length > 0) {
        let parent: THREE.Object3D | null = intersects[0].object;
        while (parent && !parent.userData.id) {
          parent = parent.parent;
        }
        if (parent && parent.userData.id) {
          setSelectedItemId(parent.userData.id);
        }
      }
    };

    // Touch & Pointer event handlers
    const dom = renderer.domElement;

    const onPointerDown = (e: PointerEvent) => {
      isPointerDownRef.current = true;
      pointerStartRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isPointerDownRef.current) return;
      const dx = e.clientX - pointerStartRef.current.x;
      const dy = e.clientY - pointerStartRef.current.y;
      pointerStartRef.current = { x: e.clientX, y: e.clientY };

      cameraAnglesRef.current.theta -= dx * 0.007;
      cameraAnglesRef.current.phi = Math.max(
        0.05,
        Math.min(Math.PI / 2 - 0.05, cameraAnglesRef.current.phi - dy * 0.007)
      );
    };

    const onPointerUp = (e: PointerEvent) => {
      const movedDist = Math.hypot(
        e.clientX - pointerStartRef.current.x,
        e.clientY - pointerStartRef.current.y
      );
      if (movedDist < 5) {
        handlePointerSelect(e.clientX, e.clientY);
      }
      isPointerDownRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraAnglesRef.current.radius = Math.max(
        3.5,
        Math.min(13, cameraAnglesRef.current.radius + e.deltaY * 0.006)
      );
    };

    // Touch gesture pinch-to-zoom
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        touchDistanceStartRef.current = dist;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && touchDistanceStartRef.current !== null) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const delta = touchDistanceStartRef.current - dist;
        touchDistanceStartRef.current = dist;
        cameraAnglesRef.current.radius = Math.max(
          3.5,
          Math.min(13, cameraAnglesRef.current.radius + delta * 0.012)
        );
      }
    };

    const onTouchEnd = () => {
      touchDistanceStartRef.current = null;
    };

    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('touchstart', onTouchStart);
    dom.addEventListener('touchmove', onTouchMove);
    dom.addEventListener('touchend', onTouchEnd);

    // Resize handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 580;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animId = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Smooth camera spherical coordinates
      const { theta, phi, radius } = cameraAnglesRef.current;
      const targetX = radius * Math.sin(phi) * Math.sin(theta);
      const targetY = radius * Math.cos(phi);
      const targetZ = radius * Math.sin(phi) * Math.cos(theta);

      camera.position.x += (targetX - camera.position.x) * 0.12;
      camera.position.y += (targetY - camera.position.y) * 0.12;
      camera.position.z += (targetZ - camera.position.z) * 0.12;
      camera.lookAt(0, 0.45, 0);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('touchstart', onTouchStart);
      dom.removeEventListener('touchmove', onTouchMove);
      dom.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [createWoodFloorTexture]);

  // Touch screen controls for the selected furniture
  const moveItem = (dx: number, dz: number) => {
    if (!selectedItemId) return;
    const updated = items.map((it) => {
      if (it.id === selectedItemId) {
        const nx = Math.max(-2.3, Math.min(2.3, it.position[0] + dx));
        const nz = Math.max(-2.3, Math.min(2.3, it.position[2] + dz));
        return {
          ...it,
          position: [nx, it.position[1], nz] as [number, number, number],
        };
      }
      return it;
    });
    onItemsChange(updated);
  };

  const rotateItem = (deltaRad: number) => {
    if (!selectedItemId) return;
    const updated = items.map((it) => {
      if (it.id === selectedItemId) {
        return {
          ...it,
          rotation: (it.rotation + deltaRad) % (Math.PI * 2),
        };
      }
      return it;
    });
    onItemsChange(updated);
  };

  const changeItemFinish = (finish: MaterialFinish, colorHex: string) => {
    if (!selectedItemId) return;
    const updated = items.map((it) => {
      if (it.id === selectedItemId) {
        return {
          ...it,
          finish,
          color: colorHex,
        };
      }
      return it;
    });
    onItemsChange(updated);
  };

  const changeItemScale = (multiplier: number) => {
    if (!selectedItemId) return;
    const updated = items.map((it) => {
      if (it.id === selectedItemId) {
        const nextScale = Math.max(0.7, Math.min(1.4, it.scale[0] * multiplier));
        return {
          ...it,
          scale: [nextScale, nextScale, nextScale] as [number, number, number],
        };
      }
      return it;
    });
    onItemsChange(updated);
  };

  const updateLightIntensity = (intensity: number) => {
    if (!selectedItemId) return;
    const clamped = Math.max(0, Math.min(4.0, Number(intensity.toFixed(2))));
    const updated = items.map((it) => {
      if (it.id === selectedItemId) {
        return {
          ...it,
          isLightSource: true,
          lightIntensity: clamped,
        };
      }
      return it;
    });
    onItemsChange(updated);
  };

  const updateLightColorTemperature = (kelvin: number) => {
    if (!selectedItemId) return;
    const clampedK = Math.max(2000, Math.min(5500, Math.round(kelvin)));
    const hex = kelvinToHex(clampedK);
    const updated = items.map((it) => {
      if (it.id === selectedItemId) {
        return {
          ...it,
          isLightSource: true,
          colorTemperatureK: clampedK,
          lightColor: hex,
        };
      }
      return it;
    });
    onItemsChange(updated);
  };

  const updateLightColorHex = (hex: string) => {
    if (!selectedItemId) return;
    const updated = items.map((it) => {
      if (it.id === selectedItemId) {
        return {
          ...it,
          isLightSource: true,
          lightColor: hex,
        };
      }
      return it;
    });
    onItemsChange(updated);
  };

  const toggleLightPower = () => {
    if (!selectedItemId) return;
    const currentItem = items.find((it) => it.id === selectedItemId);
    if (!currentItem) return;
    const isCurrentlyOn = (currentItem.lightIntensity ?? 1.8) > 0.05;
    const newIntensity = isCurrentlyOn ? 0 : 1.8;
    updateLightIntensity(newIntensity);
  };

  const toggleIsLightSource = () => {
    if (!selectedItemId) return;
    const updated = items.map((it) => {
      if (it.id === selectedItemId) {
        const nextVal = !it.isLightSource;
        return {
          ...it,
          isLightSource: nextVal,
          lightIntensity: nextVal ? (it.lightIntensity || 1.8) : 0,
          lightColor: it.lightColor || '#FFDF9E',
          colorTemperatureK: it.colorTemperatureK || 2700,
        };
      }
      return it;
    });
    onItemsChange(updated);
    if (!selectedItem?.isLightSource) {
      setItemControlTab('lighting');
    }
  };

  const deleteSelectedItem = () => {
    if (!selectedItemId) return;
    const filtered = items.filter((it) => it.id !== selectedItemId);
    onItemsChange(filtered);
    setSelectedItemId(filtered[0]?.id || null);
  };

  const handleAddNewItem = (prod: StoreProduct) => {
    const isLighting = prod.category === 'Lighting';
    const newItem: FloorPlanItem = {
      id: `item-${Date.now()}`,
      name: prod.name,
      category: isLighting ? 'lighting' : prod.category === 'Seating' ? 'seating' : prod.category === 'Bedroom' ? 'beds' : 'tables',
      position: [0.2, 0, 0.2],
      rotation: 0,
      scale: [1, 1, 1],
      color: isLighting ? '#D4AF37' : '#8E5A36',
      finish: isLighting ? 'brass' : 'teak',
      storeItemId: prod.id,
      dimensionsText: prod.dimensions,
      isLightSource: isLighting,
      lightIntensity: 1.8,
      lightColor: '#FFDF9E',
      colorTemperatureK: 2700,
    };
    onItemsChange([...items, newItem]);
    setSelectedItemId(newItem.id);
  };

  const handleBuyNow = () => {
    if (matchedStoreProduct) {
      onAddToCart(matchedStoreProduct, selectedItem?.finish);
      setAddedNotification(`Added "${matchedStoreProduct.name}" to Bag!`);
      setTimeout(() => setAddedNotification(null), 3000);
    }
  };

  return (
    <div className="relative w-full h-[620px] lg:h-[720px] rounded-2xl overflow-hidden border border-[#E7DFD3] bg-[#FAF5EC] shadow-sm select-none">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full canvas-container cursor-grab active:cursor-grabbing" />

      {/* Top Left: Scene Status & Floor Area Data Overlay */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-auto">
        <div className="flex items-center gap-2 bg-[#FAF7F2]/90 border border-stone-200/80 px-3 py-1.5 rounded-lg shadow-xs backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-[#C26343]"></span>
          <span className="text-xs font-semibold text-stone-800 tracking-tight">3D Floor Plan Studio</span>
          <span className="text-[11px] text-stone-400">·</span>
          <span className="text-[11px] text-stone-600 font-mono">{items.length} Pieces</span>
        </div>

        {/* Total Floor Area Data Overlay */}
        <div className="bg-[#FAF7F2]/95 border border-[#E2D9CC] rounded-xl p-3 shadow-md backdrop-blur-md space-y-1.5 max-w-[275px]">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-[#C26343]" />
              <span>Occupied Floor Area:</span>
            </span>
            <span className="font-mono font-bold text-[#C26343] text-sm tabular-nums">
              {occupiedAreaSqFt.toFixed(1)} sq ft
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-200/70 font-mono">
            <span>Room: {TOTAL_ROOM_AREA_SQ_FT.toFixed(0)} sq ft</span>
            <span aria-hidden="true">·</span>
            <span>{occupancyPercent}% Occupied</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 font-medium">{Math.max(0, 100 - occupancyPercent)}% Free</span>
          </div>

          {/* Micro Visual Occupancy Progress Bar */}
          <div className="w-full h-1.5 bg-stone-200/70 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#C26343] rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, occupancyPercent)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-stone-400 pt-0.5">
            <span>Free Circulation:</span>
            <span className="font-mono text-stone-700 font-semibold">{freeCirculationSqFt.toFixed(1)} sq ft</span>
          </div>
        </div>

        <p className="text-[11px] text-stone-500 bg-[#FAF7F2]/80 px-2.5 py-1 rounded-md backdrop-blur-xs max-w-[275px] border border-stone-200/50">
          Touch or click furniture to move or scale. Drag to orbit, pinch to zoom.
        </p>
      </div>

      {/* Top Right: Ambiance & View Controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {/* Ambiance Toggle */}
        <div className="flex items-center bg-[#FAF7F2]/90 border border-stone-200 rounded-lg p-1 shadow-xs backdrop-blur-md">
          <button
            onClick={() => setAmbiance('golden-hour')}
            title="Golden Hour Sunset"
            className={`p-1.5 rounded-md text-xs font-medium transition ${
              ambiance === 'golden-hour' ? 'bg-[#EADBC8] text-amber-950 shadow-xs' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-600" />
          </button>
          <button
            onClick={() => setAmbiance('cozy-evening')}
            title="Cozy Evening Amber"
            className={`p-1.5 rounded-md text-xs font-medium transition ${
              ambiance === 'cozy-evening' ? 'bg-[#4A382D] text-amber-100 shadow-xs' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Moon className="w-4 h-4 text-amber-300" />
          </button>
          <button
            onClick={() => setAmbiance('bright-morning')}
            title="Airy Daylight"
            className={`p-1.5 rounded-md text-xs font-medium transition ${
              ambiance === 'bright-morning' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-sky-600" />
          </button>
        </div>

        {/* Quick Mood Light Source Focus Button */}
        {lightingPiece && (
          <button
            onClick={() => {
              setSelectedItemId(lightingPiece.id);
              setItemControlTab('lighting');
              setIsHudCollapsed(false);
            }}
            title={`Adjust Mood Lighting: ${lightingPiece.name} (${(lightingPiece.lightIntensity ?? 1.8) > 0.05 ? `${lightingPiece.colorTemperatureK || 2700}K` : 'Off'})`}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border shadow-xs transition backdrop-blur-md cursor-pointer ${
              selectedItemId === lightingPiece.id && itemControlTab === 'lighting'
                ? 'bg-amber-100 text-amber-950 border-amber-300 ring-2 ring-amber-300'
                : 'bg-[#FAF7F2]/90 text-stone-700 border-stone-200 hover:bg-[#F4ECE1]'
            }`}
          >
            <Lightbulb
              className={`w-3.5 h-3.5 ${
                (lightingPiece.lightIntensity ?? 1.8) > 0.05
                  ? 'text-amber-500 fill-amber-400'
                  : 'text-stone-400'
              }`}
            />
            <span className="hidden md:inline font-mono text-[11px]">
              {(lightingPiece.lightIntensity ?? 1.8) > 0.05
                ? `${lightingPiece.colorTemperatureK || 2700}K Light`
                : 'Light Off'}
            </span>
          </button>
        )}

        {/* Camera Preset Pills */}
        <div className="hidden sm:flex items-center bg-[#FAF7F2]/90 border border-stone-200 rounded-lg p-1 shadow-xs backdrop-blur-md">
          <button
            onClick={() => setCameraPreset('perspective')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition ${
              cameraPreset === 'perspective' ? 'bg-[#C26343] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            3D Orbit
          </button>
          <button
            onClick={() => setCameraPreset('top-down')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition ${
              cameraPreset === 'top-down' ? 'bg-[#C26343] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            2D Blueprint
          </button>
          <button
            onClick={() => setCameraPreset('cozy-corner')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition ${
              cameraPreset === 'cozy-corner' ? 'bg-[#C26343] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Cozy Nook
          </button>
        </div>

        {/* Add Furniture Quick Dropdown */}
        <div className="relative group">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4A382D] text-white text-xs font-medium rounded-lg shadow-xs hover:bg-[#3B2C23] transition cursor-pointer">
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Piece</span>
          </button>
          <div className="absolute right-0 top-full mt-1.5 w-60 bg-white border border-stone-200 rounded-xl shadow-xl py-2 hidden group-hover:block z-30 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-1 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
              Add to Floor Plan
            </div>
            {STORE_PRODUCTS.slice(0, 5).map((p) => (
              <button
                key={p.id}
                onClick={() => handleAddNewItem(p)}
                className="w-full text-left px-3 py-2 text-xs text-stone-700 hover:bg-[#F7F2EA] flex items-center justify-between transition cursor-pointer"
              >
                <span className="truncate pr-2 font-medium">{p.name}</span>
                <span className="text-[11px] font-mono text-[#C26343] shrink-0">₹{p.priceINR.toLocaleString('en-IN')}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feedback Toast */}
      {addedNotification && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-[#2D241E] text-[#FAF7F2] text-xs font-medium px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{addedNotification}</span>
        </div>
      )}

      {/* Ergonomic Collapsible Touch Bottom Dock (Zero Viewport Occlusion) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 w-[96%] max-w-4xl transition-transform duration-300">
        {/* Collapse / Expand Toggle Button */}
        <div className="flex justify-center mb-1">
          <button
            onClick={() => setIsHudCollapsed(!isHudCollapsed)}
            className="flex items-center gap-1 text-[11px] font-medium text-stone-600 hover:text-stone-900 bg-[#FAF7F2]/90 border border-stone-300/80 px-3 py-0.5 rounded-full shadow-xs backdrop-blur-md cursor-pointer transition"
          >
            {isHudCollapsed ? (
              <>
                <ChevronUp className="w-3 h-3 text-[#C26343]" />
                <span>Show Furniture Settings</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 text-[#C26343]" />
                <span>Minimize Controls</span>
              </>
            )}
          </button>
        </div>

        {!isHudCollapsed && (
          <div className="bg-[#FAF7F2]/95 border border-[#E2D9CC] rounded-2xl shadow-xl backdrop-blur-md p-3 sm:p-4 text-stone-800 transition-all">
            {selectedItem ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center">
                {/* Zone 1: Selected Item Title, Dimensions & Price in INR */}
                <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-stone-200 pb-2 md:pb-0 md:pr-4">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-stone-400">
                      Selected Piece
                    </span>
                    <button
                      onClick={deleteSelectedItem}
                      title="Remove from layout"
                      className="text-stone-400 hover:text-red-600 p-1 rounded-md transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h4 className="font-serif text-base font-semibold text-stone-900 truncate">
                    {selectedItem.name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                    <span>{selectedItem.dimensionsText}</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{selectedItem.finish}</span>
                  </div>

                  {matchedStoreProduct && (
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-bold font-mono text-[#C26343]">
                          ₹{matchedStoreProduct.priceINR.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[11px] line-through text-stone-400 font-mono">
                          ₹{matchedStoreProduct.originalPriceINR.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <button
                        onClick={handleBuyNow}
                        className="px-2.5 py-1 text-xs font-semibold text-white bg-[#C26343] hover:bg-[#B05537] rounded-md shadow-xs transition flex items-center gap-1 cursor-pointer"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>Add to Bag</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Zone 2: Touch Screen D-Pad / Movement & Rotation Dial */}
                <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-stone-200 pb-2 md:pb-0 md:px-2 flex flex-col justify-center">
                  <div className="flex items-center justify-between text-[11px] font-medium text-stone-600 mb-1.5">
                    <span className="flex items-center gap-1">
                      <Move className="w-3 h-3 text-stone-400" />
                      <span>Touch Move & Rotate</span>
                    </span>
                    <span className="font-mono text-[10px] text-stone-400">
                      X: {selectedItem.position[0].toFixed(1)}m | Z: {selectedItem.position[2].toFixed(1)}m
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-4">
                    {/* Touch D-Pad Controls */}
                    <div className="grid grid-cols-3 gap-1 w-24">
                      <div></div>
                      <button
                        onClick={() => moveItem(0, -0.2)}
                        title="Move Up/Back"
                        className="p-1.5 bg-stone-100 hover:bg-stone-200 active:bg-stone-300 text-stone-800 rounded text-center text-xs font-bold transition cursor-pointer"
                      >
                        ▲
                      </button>
                      <div></div>
                      <button
                        onClick={() => moveItem(-0.2, 0)}
                        title="Move Left"
                        className="p-1.5 bg-stone-100 hover:bg-stone-200 active:bg-stone-300 text-stone-800 rounded text-center text-xs font-bold transition cursor-pointer"
                      >
                        ◀
                      </button>
                      <button
                        onClick={() => moveItem(0, 0.2)}
                        title="Move Down/Front"
                        className="p-1.5 bg-stone-100 hover:bg-stone-200 active:bg-stone-300 text-stone-800 rounded text-center text-xs font-bold transition cursor-pointer"
                      >
                        ▼
                      </button>
                      <button
                        onClick={() => moveItem(0.2, 0)}
                        title="Move Right"
                        className="p-1.5 bg-stone-100 hover:bg-stone-200 active:bg-stone-300 text-stone-800 rounded text-center text-xs font-bold transition cursor-pointer"
                      >
                        ▶
                      </button>
                    </div>

                    {/* Touch Rotation Steppers */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => rotateItem(-Math.PI / 8)}
                          className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-xs font-medium transition cursor-pointer"
                          title="Rotate -22.5°"
                        >
                          ↺ 22°
                        </button>
                        <button
                          onClick={() => rotateItem(Math.PI / 8)}
                          className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-xs font-medium transition cursor-pointer"
                          title="Rotate +22.5°"
                        >
                          ↻ 22°
                        </button>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-stone-500">
                        <RotateCw className="w-3 h-3 text-stone-400" />
                        <span>Angle: {Math.round((selectedItem.rotation * 180) / Math.PI)}°</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Zone 3: Mood Lighting Controls OR Material / Finish */}
                <div className="md:col-span-4 md:pl-2 flex flex-col justify-center">
                  {selectedIsLightSource ? (
                    <div>
                      {/* Sub-tabs: Mood Lighting vs Base Finish */}
                      <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-stone-200">
                        <div className="flex items-center gap-1 bg-stone-200/60 p-0.5 rounded-lg text-[10px] font-semibold">
                          <button
                            onClick={() => setItemControlTab('lighting')}
                            className={`px-2.5 py-1 rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                              itemControlTab === 'lighting'
                                ? 'bg-white text-stone-900 shadow-xs'
                                : 'text-stone-600 hover:text-stone-900'
                            }`}
                          >
                            <Lightbulb className={`w-3 h-3 ${((selectedItem.lightIntensity ?? 1.8) > 0.05) ? 'text-amber-500 fill-amber-400' : 'text-stone-400'}`} />
                            <span>Mood Lighting</span>
                          </button>
                          <button
                            onClick={() => setItemControlTab('materials')}
                            className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 cursor-pointer ${
                              itemControlTab === 'materials'
                                ? 'bg-white text-stone-900 shadow-xs'
                                : 'text-stone-600 hover:text-stone-900'
                            }`}
                          >
                            <span>Base Finish</span>
                          </button>
                        </div>

                        {/* Power Switch Toggle */}
                        <button
                          onClick={toggleLightPower}
                          title={(selectedItem.lightIntensity ?? 1.8) > 0.05 ? 'Turn off lamp' : 'Turn on lamp'}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1 border transition cursor-pointer ${
                            (selectedItem.lightIntensity ?? 1.8) > 0.05
                              ? 'bg-amber-100 text-amber-950 border-amber-300'
                              : 'bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200'
                          }`}
                        >
                          <Power className="w-2.5 h-2.5" />
                          <span>{(selectedItem.lightIntensity ?? 1.8) > 0.05 ? 'Illuminated' : 'Off'}</span>
                        </button>
                      </div>

                      {itemControlTab === 'lighting' ? (
                        <div className="space-y-2">
                          {/* 1. Brightness Intensity Slider */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-semibold text-stone-700 flex items-center gap-1">
                                <Sun className="w-3 h-3 text-amber-600" />
                                <span>Brightness Intensity:</span>
                              </span>
                              <span className="font-mono text-xs font-bold text-[#C26343]">
                                {(selectedItem.lightIntensity ?? 1.8).toFixed(1)} / 4.0{' '}
                                <span className="text-[10px] font-normal text-stone-500 font-sans">
                                  ({getIntensityLabel(selectedItem.lightIntensity ?? 1.8)})
                                </span>
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="4"
                              step="0.1"
                              value={selectedItem.lightIntensity ?? 1.8}
                              onChange={(e) => updateLightIntensity(parseFloat(e.target.value))}
                              className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#C26343]"
                            />
                            {/* Quick intensity presets */}
                            <div className="grid grid-cols-4 gap-1 pt-0.5">
                              {[
                                { label: 'Off', val: 0 },
                                { label: 'Night (0.8)', val: 0.8 },
                                { label: 'Cozy (1.8)', val: 1.8 },
                                { label: 'Radiant (3.2)', val: 3.2 },
                              ].map((p) => (
                                <button
                                  key={p.label}
                                  onClick={() => updateLightIntensity(p.val)}
                                  className={`py-0.5 text-[9.5px] rounded font-medium transition cursor-pointer text-center ${
                                    Math.abs((selectedItem.lightIntensity ?? 1.8) - p.val) < 0.2
                                      ? 'bg-[#C26343] text-white shadow-xs font-bold'
                                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                  }`}
                                >
                                  {p.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* 2. Color Temperature Picker */}
                          <div className="space-y-1 pt-1.5 border-t border-stone-200/80">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-semibold text-stone-700 flex items-center gap-1.5">
                                <span
                                  className="w-2.5 h-2.5 rounded-full border border-stone-300 shadow-xs inline-block"
                                  style={{ backgroundColor: selectedItem.lightColor || kelvinToHex(selectedItem.colorTemperatureK || 2700) }}
                                />
                                <span>Color Temperature:</span>
                              </span>
                              <span className="font-mono text-xs font-bold text-stone-800">
                                {selectedItem.colorTemperatureK || 2700}K{' '}
                                <span className="text-[10px] font-normal text-stone-500 font-sans">
                                  ({getTemperatureLabel(selectedItem.colorTemperatureK || 2700)})
                                </span>
                              </span>
                            </div>

                            {/* Blackbody Spectrum Gradient Slider */}
                            <input
                              type="range"
                              min="2000"
                              max="5500"
                              step="50"
                              value={selectedItem.colorTemperatureK || 2700}
                              onChange={(e) => updateLightColorTemperature(parseInt(e.target.value, 10))}
                              style={{
                                background: 'linear-gradient(to right, #FFA040 0%, #FFBE76 25%, #FFD19B 50%, #FFF4E8 75%, #EDF1FF 100%)',
                              }}
                              className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-stone-900 shadow-inner"
                            />

                            {/* Mood Temperature Quick Presets */}
                            <div className="grid grid-cols-5 gap-1 pt-0.5">
                              {LIGHTING_TEMPERATURE_PRESETS.map((p) => {
                                const isSelected = Math.abs((selectedItem.colorTemperatureK || 2700) - p.kelvin) < 150;
                                return (
                                  <button
                                    key={p.kelvin}
                                    onClick={() => updateLightColorTemperature(p.kelvin)}
                                    title={`${p.name} (${p.kelvin}K) - ${p.subtitle}`}
                                    className={`flex flex-col items-center py-1 px-0.5 rounded text-[9px] transition cursor-pointer border ${
                                      isSelected
                                        ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                                        : 'border-stone-200 bg-white/80 text-stone-700 hover:bg-stone-100'
                                    }`}
                                  >
                                    <span
                                      className="w-2 h-2 rounded-full mb-0.5 border border-stone-300"
                                      style={{ backgroundColor: p.hex }}
                                    />
                                    <span className="font-bold leading-none">{p.kelvin}K</span>
                                    <span className="text-[7.5px] truncate max-w-full opacity-80">{p.name.split(' ')[0]}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Materials & Scale tab for lighting item */
                        <div className="space-y-2">
                          <div className="text-[11px] font-medium text-stone-600">Lamp Hardware & Base Finish</div>
                          <div className="flex items-center gap-1.5">
                            {['brass', 'walnut', 'teak', 'oak'].map((f) => (
                              <button
                                key={f}
                                onClick={() => changeItemFinish(f as MaterialFinish, f === 'brass' ? '#D4AF37' : f === 'walnut' ? '#4A3326' : f === 'teak' ? '#7C4A28' : '#C4A47C')}
                                className={`px-2 py-1 text-[11px] font-medium rounded-md capitalize transition cursor-pointer ${
                                  selectedItem.finish === f ? 'bg-[#4A382D] text-white shadow-xs' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                                }`}
                              >
                                {f}
                              </button>
                            ))}
                          </div>
                          <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-200">
                            <span className="text-[11px] text-stone-500">Scale / Height:</span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => changeItemScale(0.9)}
                                className="w-6 h-6 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-xs flex items-center justify-center font-bold cursor-pointer"
                                title="Scale down"
                              >
                                -
                              </button>
                              <span className="text-[11px] font-mono text-stone-600 px-1">
                                {Math.round(selectedItem.scale[0] * 100)}%
                              </span>
                              <button
                                onClick={() => changeItemScale(1.1)}
                                className="w-6 h-6 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-xs flex items-center justify-center font-bold cursor-pointer"
                                title="Scale up"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Non-lighting pieces: regular wood/fabric swatches + toggle ambient glow option */
                    <div>
                      <div className="text-[11px] font-medium text-stone-600 mb-1.5 flex items-center justify-between">
                        <span>Wood Finish & Fabric Upholstery</span>
                        <button
                          onClick={toggleIsLightSource}
                          title="Add ambient mood lighting glow to this piece"
                          className="text-[10px] text-amber-700 hover:text-amber-900 font-semibold flex items-center gap-1 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200 transition cursor-pointer"
                        >
                          <Lightbulb className="w-2.5 h-2.5" />
                          <span>Add Glow</span>
                        </button>
                      </div>

                      {/* Wood finish buttons */}
                      <div className="flex items-center gap-1.5 mb-2">
                        <button
                          onClick={() => changeItemFinish('teak', '#7C4A28')}
                          title="Indian Teak"
                          className={`px-2 py-1 text-[11px] font-medium rounded-md transition cursor-pointer ${
                            selectedItem.finish === 'teak' ? 'bg-[#7C4A28] text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                          }`}
                        >
                          Teak
                        </button>
                        <button
                          onClick={() => changeItemFinish('walnut', '#4A3326')}
                          title="Smoked Walnut"
                          className={`px-2 py-1 text-[11px] font-medium rounded-md transition cursor-pointer ${
                            selectedItem.finish === 'walnut' ? 'bg-[#4A3326] text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                          }`}
                        >
                          Walnut
                        </button>
                        <button
                          onClick={() => changeItemFinish('oak', '#C4A47C')}
                          title="Natural White Oak"
                          className={`px-2 py-1 text-[11px] font-medium rounded-md transition cursor-pointer ${
                            selectedItem.finish === 'oak' ? 'bg-[#C4A47C] text-stone-900' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                          }`}
                        >
                          Oak
                        </button>
                        <button
                          onClick={() => changeItemFinish('cane', '#D8BE93')}
                          title="Woven Cane"
                          className={`px-2 py-1 text-[11px] font-medium rounded-md transition cursor-pointer ${
                            selectedItem.finish === 'cane' ? 'bg-[#D8BE93] text-stone-900' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                          }`}
                        >
                          Cane
                        </button>
                      </div>

                      {/* Fabric Color Swatches */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-semibold text-stone-400">Color:</span>
                        <div className="flex items-center gap-1.5">
                          {[
                            { name: 'Oat Linen', hex: '#E5DDD0' },
                            { name: 'Burnt Terracotta', hex: '#C26343' },
                            { name: 'Forest Olive', hex: '#4B5539' },
                            { name: 'Golden Amber', hex: '#C79A46' },
                            { name: 'Charcoal Wool', hex: '#3B3632' },
                          ].map((c) => (
                            <button
                              key={c.name}
                              onClick={() => changeItemFinish(selectedItem.finish, c.hex)}
                              title={c.name}
                              style={{ backgroundColor: c.hex }}
                              className={`w-5 h-5 rounded-full border border-stone-300 transition-transform cursor-pointer ${
                                selectedItem.color.toLowerCase() === c.hex.toLowerCase()
                                  ? 'scale-125 ring-2 ring-[#C26343] ring-offset-1'
                                  : 'hover:scale-110'
                              }`}
                            />
                          ))}
                        </div>

                        {/* Scale adjustment */}
                        <div className="ml-auto flex items-center gap-1">
                          <button
                            onClick={() => changeItemScale(0.9)}
                            className="w-5 h-5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-xs flex items-center justify-center font-bold cursor-pointer"
                            title="Scale down"
                          >
                            -
                          </button>
                          <span className="text-[10px] font-mono text-stone-500">
                            {Math.round(selectedItem.scale[0] * 100)}%
                          </span>
                          <button
                            onClick={() => changeItemScale(1.1)}
                            className="w-5 h-5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-xs flex items-center justify-center font-bold cursor-pointer"
                            title="Scale up"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-2 text-center text-xs text-stone-500">
                Tap on any piece in the 3D room above to adjust coordinates, wood finishes, and fabrics.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
