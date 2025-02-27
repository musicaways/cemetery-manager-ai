
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Unisce le classi CSS utilizzando clsx e tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Determina il breakpoint corrente in base alla larghezza della finestra
 */
export function getBreakpoint() {
  if (typeof window === 'undefined') return 'lg';
  
  const width = window.innerWidth;
  
  if (width < 640) return 'xs';
  if (width < 768) return 'sm';
  if (width < 1024) return 'md';
  if (width < 1280) return 'lg';
  if (width < 1536) return 'xl';
  return '2xl';
}

/**
 * Hook per determinare se un elemento è visibile nel viewport
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('it-IT').format(value);
}

/**
 * Tronca il testo a una lunghezza massima
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Genera un colore casuale basato su una stringa
 */
export function stringToColor(str: string): string {
  if (!str) return '#8B5CF6'; // Colore predefinito
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 60%)`;
}
