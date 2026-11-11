/**
 * Lighting utilities for 3D floor plan mood lighting,
 * Kelvin color temperature conversions, and preset profiles.
 */

export interface LightingPreset {
  kelvin: number;
  name: string;
  subtitle: string;
  hex: string;
}

export const LIGHTING_TEMPERATURE_PRESETS: LightingPreset[] = [
  { kelvin: 2200, name: 'Diya Flame', subtitle: 'Candlelight', hex: '#FFA040' },
  { kelvin: 2700, name: 'Amber Sunset', subtitle: 'Cozy Evening', hex: '#FFBE76' },
  { kelvin: 3000, name: 'Golden White', subtitle: 'Living Room', hex: '#FFD19B' },
  { kelvin: 4000, name: 'Ivory Neutral', subtitle: 'Balanced Soft', hex: '#FFF4E8' },
  { kelvin: 5000, name: 'Crisp Daylight', subtitle: 'Reading Focus', hex: '#EDF1FF' },
];

/**
 * Converts color temperature in Kelvin (1500K - 6500K) to hex color string
 * using blackbody radiation approximation.
 */
export function kelvinToHex(kelvin: number): string {
  const temp = Math.max(1500, Math.min(8000, kelvin)) / 100;
  let red = 0;
  let green = 0;
  let blue = 0;

  // Red
  if (temp <= 66) {
    red = 255;
  } else {
    red = temp - 60;
    red = 329.698727446 * Math.pow(red, -0.1332047592);
    red = Math.max(0, Math.min(255, red));
  }

  // Green
  if (temp <= 66) {
    green = temp;
    green = 99.4708025861 * Math.log(green) - 161.1195681661;
    green = Math.max(0, Math.min(255, green));
  } else {
    green = temp - 60;
    green = 288.1221695283 * Math.pow(green, -0.0755148492);
    green = Math.max(0, Math.min(255, green));
  }

  // Blue
  if (temp >= 66) {
    blue = 255;
  } else if (temp <= 19) {
    blue = 0;
  } else {
    blue = temp - 10;
    blue = 138.5177312231 * Math.log(blue) - 305.0447927307;
    blue = Math.max(0, Math.min(255, blue));
  }

  const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`.toUpperCase();
}

/**
 * Returns a human-friendly description for a given Kelvin temperature
 */
export function getTemperatureLabel(kelvin: number): string {
  if (kelvin <= 2300) return 'Diya Warmth (Candle)';
  if (kelvin <= 2850) return 'Amber Sunset (Cozy)';
  if (kelvin <= 3400) return 'Golden White (Warm)';
  if (kelvin <= 4400) return 'Ivory Neutral (Natural)';
  return 'Daylight (Crisp)';
}

/**
 * Returns a human-friendly description for light intensity
 */
export function getIntensityLabel(intensity: number): string {
  if (intensity <= 0.05) return 'Turned Off';
  if (intensity <= 0.8) return 'Subtle Night Glow';
  if (intensity <= 1.8) return 'Cozy Ambient Warmth';
  if (intensity <= 2.8) return 'Bright Living Space';
  return 'Radiant Lumens';
}
