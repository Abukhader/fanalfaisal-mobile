/**
 * Premium brand colors for Fan Al Faisal.
 * Defined for light and dark modes.
 */

const tintColorLight = '#002E5A'; // Brand Royal Navy
const tintColorDark = '#FFFFFF';

export const Colors = {
  light: {
    text: '#111827', // Rich Charcoal
    background: '#F8FAFC', // Slate Background
    tint: tintColorLight,
    icon: '#6B7280',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintColorLight,
    
    // Brand design system tokens
    primary: '#002E5A',
    secondary: '#2B9B72', // Emerald Teal Green
    gold: '#C6A47E', // Champagne Gold
    white: '#FFFFFF',
    slate: '#F8FAFC',
    charcoal: '#111827',
    silver: '#E2E8F0',
    muted: '#6B7280',
  },
  dark: {
    text: '#F3F4F6',
    background: '#0B0F19', // Deep Midnight Blue
    tint: tintColorDark,
    icon: '#9CA3AF',
    tabIconDefault: '#4B5563',
    tabIconSelected: tintColorDark,
    
    // Brand design system tokens (Dark adaptation)
    primary: '#0B0F19',
    secondary: '#2B9B72',
    gold: '#C6A47E',
    white: '#111827',
    slate: '#0B0F19',
    charcoal: '#F3F4F6',
    silver: '#1F2937',
    muted: '#9CA3AF',
  },
};
