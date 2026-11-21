import type { WidgetConfig } from '../types/widget';

const DEFAULT_PRIMARY_COLOR = '#A7685E';

const LIGHT_THEME_VARIABLES: Record<string, string> = {
  '--color-luma-page': '#F7F0EA',
  '--color-luma-surface': '#FDFAF7',
  '--color-luma-overlay': '#FFFFFF',
  '--color-luma-subtle': '#F0E9E2',
  '--color-luma-mist': '#E8E0D8',
  '--color-luma-canvas': '#302B28',
  '--color-luma-ink': '#302B28',
  '--color-luma-secondary': '#6B5F58',
  '--color-luma-muted': '#7A706B',
  '--color-luma-ghost': '#9C8E86',
  '--color-luma-inverse': '#FDFAF7',
  '--color-luma-disabled': '#BEB5AE',
  '--color-luma-border': '#E7DED7',
  '--color-luma-border-mid': '#CFC6BC',
  '--color-luma-border-strong': '#B8ADA4',
  '--color-luma-gold': '#D4A843',
  '--color-luma-success': '#5A7A5A',
  '--color-luma-warning': '#A88B5A',
  '--color-luma-error': '#A05858',
  'color-scheme': 'light',
};

const DARK_THEME_VARIABLES: Record<string, string> = {
  '--color-luma-page': '#1A1715',
  '--color-luma-surface': '#24201D',
  '--color-luma-overlay': '#2D2825',
  '--color-luma-subtle': '#332E2A',
  '--color-luma-mist': '#3E3732',
  '--color-luma-canvas': '#12100E',
  '--color-luma-ink': '#F7F0EA',
  '--color-luma-secondary': '#D4C9C1',
  '--color-luma-muted': '#A3978F',
  '--color-luma-ghost': '#857A73',
  '--color-luma-inverse': '#1A1715',
  '--color-luma-disabled': '#5A524C',
  '--color-luma-border': '#3D3631',
  '--color-luma-border-mid': '#524A43',
  '--color-luma-border-strong': '#695F56',
  '--color-luma-gold': '#F2C94C',
  '--color-luma-success': '#7BB67B',
  '--color-luma-warning': '#D6B470',
  '--color-luma-error': '#C97A7A',
  'color-scheme': 'dark',
};

/**
 * Validates whether a given string is a safe CSS color representation.
 * Prevents CSS injection attacks (semicolons, curly braces, url, expressions).
 */
export function isValidCssColor(color: string): boolean {
  if (!color || typeof color !== 'string') return false;
  const trimmed = color.trim();
  if (trimmed.length > 64) return false;
  // Disallow semicolon, braces, tags, or control characters
  if (/[;{}<>\n\r\\]/.test(trimmed)) return false;

  // Hex color (#RGB, #RGBA, #RRGGBB, #RRGGBBAA)
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(trimmed)) {
    return true;
  }

  // rgb / rgba / hsl / hsla / oklch / lch
  if (
    /^(rgb|rgba|hsl|hsla|oklch|lch|color)\([0-9a-zA-Z\s,./%+-]+\)$/i.test(trimmed)
  ) {
    return true;
  }

  // Named CSS colors (letters only)
  if (/^[a-zA-Z]{3,20}$/.test(trimmed)) {
    return true;
  }

  return false;
}

/**
 * Generates an object of CSS custom property names and values for the provided config.
 */
export function generateThemeVariables(
  config: Partial<WidgetConfig> = {},
): Record<string, string> {
  const isDark = config.theme === 'dark';
  const baseVariables = isDark ? DARK_THEME_VARIABLES : LIGHT_THEME_VARIABLES;

  const rawPrimary = config.primaryColor?.trim();
  const primaryColor =
    rawPrimary && isValidCssColor(rawPrimary) ? rawPrimary : DEFAULT_PRIMARY_COLOR;

  return {
    ...baseVariables,
    '--color-luma-accent': primaryColor,
    '--color-luma-accent-dark': `color-mix(in srgb, ${primaryColor} 80%, black)`,
    '--color-luma-blush': `color-mix(in srgb, ${primaryColor} 25%, white)`,
    '--color-luma-blush-pale': `color-mix(in srgb, ${primaryColor} 12%, white)`,
    '--color-luma-deco': `color-mix(in srgb, ${primaryColor} 40%, ${isDark ? '#524A43' : '#D5C4A5'})`,
    '--glowguide-primary': primaryColor,
  };
}

/**
 * Generates a CSS rule string setting CSS custom properties for Shadow DOM and host elements.
 */
export function generateThemeCss(
  config: Partial<WidgetConfig> = {},
  selector = ':host, .glowguide-theme-root',
): string {
  const vars = generateThemeVariables(config);
  const declarations = Object.entries(vars)
    .map(([key, val]) => `  ${key}: ${val};`)
    .join('\n');

  return `${selector} {\n${declarations}\n}`;
}
