import type { SessionStepId } from '@glowguide/widget-ui';

export type BorderRadiusOption = 'none' | 'subtle' | 'rounded' | 'curved' | 'pill';
export type PlaygroundViewport = 'desktop' | 'tablet' | 'mobile';
export type PlaygroundEventCategory = 'all' | 'lifecycle' | 'journey' | 'cart' | 'errors';

export interface PlaygroundConfig {
  mode: 'inline' | 'floating';
  theme: 'light' | 'dark';
  brandName: string;
  primaryColor: string;
  accentColor: string;
  borderRadius: BorderRadiusOption;
  initialStep: SessionStepId;
  scenarioKey: string;
  simulateHostCart: boolean;
}

export interface ColorPreset {
  name: string;
  hex: string;
  accentHex: string;
  bgClass: string;
}

export const COLOR_PRESETS: ColorPreset[] = [
  { name: 'Terracotta (Luma)', hex: '#A7685E', accentHex: '#F5E6E2', bgClass: 'bg-[#A7685E]' },
  { name: 'Forest Sage', hex: '#2D6A4F', accentHex: '#E8F5E9', bgClass: 'bg-[#2D6A4F]' },
  { name: 'Royal Indigo', hex: '#2563EB', accentHex: '#EFF6FF', bgClass: 'bg-[#2563EB]' },
  { name: 'Berry Plum', hex: '#831843', accentHex: '#FDF2F8', bgClass: 'bg-[#831843]' },
  { name: 'Obsidian Noir', hex: '#1E293B', accentHex: '#F1F5F9', bgClass: 'bg-[#1E293B]' },
  { name: 'Warm Gold', hex: '#D97706', accentHex: '#FEF3C7', bgClass: 'bg-[#D97706]' },
];

export const BORDER_RADIUS_MAP: Record<BorderRadiusOption, { label: string; value: string; px: string }> = {
  none: { label: 'Sharp (0px)', value: '0px', px: '0px' },
  subtle: { label: 'Subtle (4px)', value: '4px', px: '4px' },
  rounded: { label: 'Standard (8px)', value: '8px', px: '8px' },
  curved: { label: 'Curved (16px)', value: '16px', px: '16px' },
  pill: { label: 'Pill (24px)', value: '24px', px: '24px' },
};

export const STEP_OPTIONS: { id: SessionStepId; label: string; desc: string }[] = [
  { id: 'welcome', label: 'Welcome', desc: 'Introduction banner and launcher' },
  { id: 'consent', label: 'Consent', desc: 'Camera privacy and terms agreement' },
  { id: 'capture', label: 'Capture', desc: 'Live camera viewfinder and photo upload' },
  { id: 'analyzing', label: 'Analyzing', desc: 'Simulated neural skin assessment' },
  { id: 'report', label: 'Report & Products', desc: 'Skin insights and recommended routine' },
];

export const DEFAULT_PLAYGROUND_CONFIG: PlaygroundConfig = {
  mode: 'inline',
  theme: 'light',
  brandName: 'Luma Beauty',
  primaryColor: '#A7685E',
  accentColor: '#F5E6E2',
  borderRadius: 'rounded',
  initialStep: 'welcome',
  scenarioKey: 'auto',
  simulateHostCart: true,
};

export interface PlaygroundEventItem {
  id: string;
  type: string;
  category: 'lifecycle' | 'journey' | 'cart' | 'errors';
  badge: string;
  badgeColorClass?: string;
  summary: string;
  timestamp: string;
  payload: Record<string, unknown>;
}
