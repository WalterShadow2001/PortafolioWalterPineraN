// Portfolio Theme Definitions
// Each theme overrides CSS variables and adds background patterns/effects

export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  // CSS variable overrides (colors, etc.)
  colors: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    backgroundColor?: string;
    textColor?: string;
  };
  // Custom CSS class name applied to the root
  className: string;
  // Inline background style for the hero/body
  bodyStyle?: React.CSSProperties;
  // Card style overrides
  cardStyle?: React.CSSProperties;
  // Nav style overrides
  navStyle?: React.CSSProperties;
  // Section alternating background
  altSectionStyle?: React.CSSProperties;
  // Additional global CSS to inject
  css?: string;
}

// Helper function to generate comprehensive dark theme CSS overrides
function generateDarkThemeCSS(
  themeClass: string,
  colors: {
    bgCard: string;
    border: string;
    textMuted: string;
    textMain: string;
    link: string;
    spanColor: string;
    inputBg: string;
    inputBorder: string;
    gradientFrom: string;
    gradientTo: string;
  },
  extraCSS: string = ''
): string {
  return `
      .${themeClass} { color: ${colors.textMain}; }
      .${themeClass} .bg-white { background-color: ${colors.bgCard} !important; }
      .${themeClass} .border-gray-100, .${themeClass} .border-gray-200, .${themeClass} .border-gray-300 { border-color: ${colors.border} !important; }
      .${themeClass} .text-gray-300, .${themeClass} .text-gray-400, .${themeClass} .text-gray-500, .${themeClass} .text-gray-600 { color: ${colors.textMuted} !important; }
      .${themeClass} .text-gray-700, .${themeClass} .text-gray-800, .${themeClass} .text-gray-900 { color: ${colors.textMain} !important; }
      .${themeClass} .text-black { color: ${colors.textMain} !important; }
      .${themeClass} h1, .${themeClass} h2, .${themeClass} h3, .${themeClass} h4, .${themeClass} h5, .${themeClass} h6 { color: ${colors.textMain} !important; }
      .${themeClass} p:not([style*="color"]) { color: ${colors.textMuted} !important; }
      .${themeClass} span:not([style*="color"]):not(.skill-tag):not([style*="background"]):not(.sr-only) { color: ${colors.spanColor} !important; }
      .${themeClass} a:not([style*="color"]):not([style*="background"]) { color: ${colors.link} !important; }
      .${themeClass} label:not([style*="color"]) { color: ${colors.textMuted} !important; }
      .${themeClass} li:not([style*="color"]) { color: ${colors.spanColor} !important; }
      .${themeClass} strong:not([style*="color"]) { color: ${colors.textMain} !important; }
      .${themeClass} em:not([style*="color"]) { color: ${colors.textMuted} !important; }
      .${themeClass} td:not([style*="color"]), .${themeClass} th:not([style*="color"]) { color: ${colors.spanColor} !important; }
      .${themeClass} .bg-gray-50, .${themeClass} .bg-gray-100 { background-color: ${colors.bgCard} !important; }
      .${themeClass} .shadow-sm { box-shadow: 0 1px 3px rgba(0,0,0,0.4) !important; }
      .${themeClass} input, .${themeClass} textarea, .${themeClass} select { background-color: ${colors.inputBg} !important; color: ${colors.textMain} !important; border-color: ${colors.inputBorder} !important; }
      .${themeClass} .card-hover:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important; }
      .${themeClass} .bg-gradient-to-br.from-gray-50.to-gray-100 { background: linear-gradient(to bottom right, ${colors.gradientFrom}, ${colors.gradientTo}) !important; }
      .${themeClass} .hover\\:shadow-md:hover { box-shadow: 0 4px 6px rgba(0,0,0,0.4) !important; }
      .${themeClass} .from-gray-50 { --tw-gradient-from: ${colors.gradientFrom} !important; }
      .${themeClass} .to-gray-100 { --tw-gradient-to: ${colors.gradientTo} !important; }
      .${themeClass} .hover\\:bg-gray-50:hover, .${themeClass} .hover\\:bg-gray-100:hover { background-color: ${colors.bgCard} !important; }
      .${themeClass} .text-sm:not([style*="color"]):not(.skill-tag) { color: ${colors.spanColor} !important; }
      .${themeClass} .text-lg:not([style*="color"]) { color: ${colors.textMain} !important; }
      .${themeClass} .text-xl:not([style*="color"]) { color: ${colors.textMain} !important; }
      .${themeClass} .text-2xl:not([style*="color"]) { color: ${colors.textMain} !important; }
      .${themeClass} .font-medium:not([style*="color"]):not(.skill-tag) { color: ${colors.textMain} !important; }
      .${themeClass} .font-semibold:not([style*="color"]) { color: ${colors.textMain} !important; }
      .${themeClass} .font-bold:not([style*="color"]) { color: ${colors.textMain} !important; }
      ${extraCSS}
    `;
}

export const themes: ThemeDefinition[] = [
  {
    id: 'default',
    name: 'Clásico',
    description: 'Limpio y profesional, el estilo original',
    icon: '✨',
    className: 'theme-default',
    colors: {
      primaryColor: '#3b82f6',
      secondaryColor: '#1e40af',
      accentColor: '#f59e0b',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
    },
    bodyStyle: {},
    navStyle: {},
    cardStyle: {},
    altSectionStyle: {},
  },
  {
    id: 'dark',
    name: 'Modo Oscuro',
    description: 'Cielo nocturno con estrellas titilantes',
    icon: '🌙',
    className: 'theme-dark',
    colors: {
      backgroundColor: '#0f172a',
      textColor: '#e2e8f0',
    },
    bodyStyle: { backgroundColor: '#0f172a', color: '#e2e8f0' },
    navStyle: { backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: '#1e293b' },
    cardStyle: { backgroundColor: '#1e293b', borderColor: '#334155', color: '#e2e8f0' },
    altSectionStyle: { backgroundColor: 'rgba(59, 130, 246, 0.05)' },
    css: generateDarkThemeCSS('theme-dark', {
      bgCard: '#1e293b',
      border: '#334155',
      textMuted: '#94a3b8',
      textMain: '#e2e8f0',
      link: '#93c5fd',
      spanColor: '#cbd5e1',
      inputBg: '#1e293b',
      inputBorder: '#475569',
      gradientFrom: '#1e293b',
      gradientTo: '#0f172a',
    }),
  },
  {
    id: 'circuit',
    name: 'Circuitos',
    description: 'Placa de circuito con nodos y trazos animados',
    icon: '⚡',
    className: 'theme-circuit',
    colors: {
      primaryColor: '#06b6d4',
      secondaryColor: '#0891b2',
      accentColor: '#22d3ee',
      backgroundColor: '#0c1222',
      textColor: '#e0f2fe',
    },
    bodyStyle: { backgroundColor: '#0c1222', color: '#e0f2fe' },
    navStyle: { backgroundColor: 'rgba(12, 18, 34, 0.95)', borderColor: '#1e3a5f' },
    cardStyle: { backgroundColor: '#111b2e', borderColor: '#1e3a5f', color: '#e0f2fe' },
    altSectionStyle: { backgroundColor: 'rgba(6, 182, 212, 0.05)' },
    css: generateDarkThemeCSS('theme-circuit', {
      bgCard: '#111b2e',
      border: '#1e3a5f',
      textMuted: '#7dd3fc',
      textMain: '#e0f2fe',
      link: '#7dd3fc',
      spanColor: '#cbd5e1',
      inputBg: '#111b2e',
      inputBorder: '#1e3a5f',
      gradientFrom: '#111b2e',
      gradientTo: '#0c1222',
    }, `
      .theme-circuit .card-hover:hover { box-shadow: 0 0 15px rgba(6, 182, 212, 0.2) !important; border-color: #06b6d4 !important; }
      .theme-circuit .hover\\:shadow-md:hover { box-shadow: 0 4px 6px rgba(6, 182, 212, 0.15) !important; }
      .theme-circuit { background-image: 
        radial-gradient(circle at 25% 25%, rgba(6, 182, 212, 0.03) 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, rgba(6, 182, 212, 0.03) 0%, transparent 50%),
        linear-gradient(rgba(6, 182, 212, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(6, 182, 212, 0.03) 1px, transparent 1px);
        background-size: 100% 100%, 100% 100%, 40px 40px, 40px 40px;
      }
    `),
  },
  {
    id: 'neon',
    name: 'Neón',
    description: 'Líneas y orbes neón pulsantes en la oscuridad',
    icon: '💡',
    className: 'theme-neon',
    colors: {
      primaryColor: '#a855f7',
      secondaryColor: '#7c3aed',
      accentColor: '#ec4899',
      backgroundColor: '#0a0a1a',
      textColor: '#f0e7ff',
    },
    bodyStyle: { backgroundColor: '#0a0a1a', color: '#f0e7ff' },
    navStyle: { backgroundColor: 'rgba(10, 10, 26, 0.95)', borderColor: '#2e1065' },
    cardStyle: { backgroundColor: '#1a1030', borderColor: '#3b1f7a', color: '#f0e7ff' },
    altSectionStyle: { backgroundColor: 'rgba(168, 85, 247, 0.04)' },
    css: generateDarkThemeCSS('theme-neon', {
      bgCard: '#1a1030',
      border: '#3b1f7a',
      textMuted: '#c4b5fd',
      textMain: '#f0e7ff',
      link: '#c4b5fd',
      spanColor: '#d8b4fe',
      inputBg: '#1a1030',
      inputBorder: '#3b1f7a',
      gradientFrom: '#1a1030',
      gradientTo: '#0a0a1a',
    }, `
      .theme-neon .shadow-sm { box-shadow: 0 1px 3px rgba(0,0,0,0.5), 0 0 10px rgba(168, 85, 247, 0.05) !important; }
      .theme-neon .card-hover:hover { box-shadow: 0 0 20px rgba(168, 85, 247, 0.3) !important; border-color: #a855f7 !important; }
      .theme-neon .hover\\:shadow-md:hover { box-shadow: 0 4px 6px rgba(168, 85, 247, 0.2) !important; }
      .theme-neon { background-image: 
        radial-gradient(ellipse at 20% 50%, rgba(168, 85, 247, 0.08) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 20%, rgba(236, 72, 153, 0.06) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 50%);
      }
    `),
  },
  {
    id: 'matrix',
    name: 'Matrix',
    description: 'Lluvia de código verde estilo Matrix animada',
    icon: '🟢',
    className: 'theme-matrix',
    colors: {
      primaryColor: '#22c55e',
      secondaryColor: '#16a34a',
      accentColor: '#4ade80',
      backgroundColor: '#050d05',
      textColor: '#d1fae5',
    },
    bodyStyle: { backgroundColor: '#050d05', color: '#d1fae5' },
    navStyle: { backgroundColor: 'rgba(5, 13, 5, 0.95)', borderColor: '#14532d' },
    cardStyle: { backgroundColor: '#0a1a0a', borderColor: '#166534', color: '#d1fae5' },
    altSectionStyle: { backgroundColor: 'rgba(34, 197, 94, 0.04)' },
    css: generateDarkThemeCSS('theme-matrix', {
      bgCard: '#0a1a0a',
      border: '#166534',
      textMuted: '#6ee7b7',
      textMain: '#d1fae5',
      link: '#4ade80',
      spanColor: '#a7f3d0',
      inputBg: '#0a1a0a',
      inputBorder: '#166534',
      gradientFrom: '#0a1a0a',
      gradientTo: '#050d05',
    }, `
      .theme-matrix .shadow-sm { box-shadow: 0 1px 3px rgba(0,0,0,0.5), 0 0 5px rgba(34, 197, 94, 0.05) !important; }
      .theme-matrix .card-hover:hover { box-shadow: 0 0 15px rgba(34, 197, 94, 0.2) !important; border-color: #22c55e !important; }
      .theme-matrix .hover\\:shadow-md:hover { box-shadow: 0 4px 6px rgba(34, 197, 94, 0.15) !important; }
      .theme-matrix { background-image: 
        repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(34, 197, 94, 0.015) 2px, rgba(34, 197, 94, 0.015) 4px);
      }
    `),
  },
  {
    id: 'sunset',
    name: 'Atardecer',
    description: 'Horizonte con sol, nubes y gradientes cálidos',
    icon: '🌅',
    className: 'theme-sunset',
    colors: {
      primaryColor: '#f97316',
      secondaryColor: '#ea580c',
      accentColor: '#fbbf24',
      backgroundColor: '#1c0a00',
      textColor: '#fff7ed',
    },
    bodyStyle: { backgroundColor: '#1c0a00', color: '#fff7ed' },
    navStyle: { backgroundColor: 'rgba(28, 10, 0, 0.95)', borderColor: '#7c2d12' },
    cardStyle: { backgroundColor: '#2a1200', borderColor: '#9a3412', color: '#fff7ed' },
    altSectionStyle: { backgroundColor: 'rgba(249, 115, 22, 0.05)' },
    css: generateDarkThemeCSS('theme-sunset', {
      bgCard: '#2a1200',
      border: '#9a3412',
      textMuted: '#fdba74',
      textMain: '#fff7ed',
      link: '#fbbf24',
      spanColor: '#fed7aa',
      inputBg: '#2a1200',
      inputBorder: '#9a3412',
      gradientFrom: '#2a1200',
      gradientTo: '#1c0a00',
    }, `
      .theme-sunset .card-hover:hover { box-shadow: 0 0 15px rgba(249, 115, 22, 0.2) !important; }
      .theme-sunset .hover\\:shadow-md:hover { box-shadow: 0 4px 6px rgba(249, 115, 22, 0.15) !important; }
      .theme-sunset { background-image: 
        radial-gradient(ellipse at 50% 0%, rgba(249, 115, 22, 0.1) 0%, transparent 60%),
        radial-gradient(ellipse at 50% 100%, rgba(234, 88, 12, 0.08) 0%, transparent 50%);
      }
    `),
  },
  {
    id: 'ocean',
    name: 'Océano',
    description: 'Ondas animadas y burbujas en fondo marino',
    icon: '🌊',
    className: 'theme-ocean',
    colors: {
      primaryColor: '#0ea5e9',
      secondaryColor: '#0284c7',
      accentColor: '#38bdf8',
      backgroundColor: '#0a1628',
      textColor: '#e0f2fe',
    },
    bodyStyle: { backgroundColor: '#0a1628', color: '#e0f2fe' },
    navStyle: { backgroundColor: 'rgba(10, 22, 40, 0.95)', borderColor: '#0c4a6e' },
    cardStyle: { backgroundColor: '#0f2038', borderColor: '#164e7a', color: '#e0f2fe' },
    altSectionStyle: { backgroundColor: 'rgba(14, 165, 233, 0.04)' },
    css: generateDarkThemeCSS('theme-ocean', {
      bgCard: '#0f2038',
      border: '#164e7a',
      textMuted: '#7dd3fc',
      textMain: '#e0f2fe',
      link: '#38bdf8',
      spanColor: '#bae6fd',
      inputBg: '#0f2038',
      inputBorder: '#164e7a',
      gradientFrom: '#0f2038',
      gradientTo: '#0a1628',
    }, `
      .theme-ocean .card-hover:hover { box-shadow: 0 0 15px rgba(14, 165, 233, 0.2) !important; }
      .theme-ocean .hover\\:shadow-md:hover { box-shadow: 0 4px 6px rgba(14, 165, 233, 0.15) !important; }
      .theme-ocean { background-image: 
        radial-gradient(ellipse at 30% 90%, rgba(14, 165, 233, 0.08) 0%, transparent 50%),
        radial-gradient(ellipse at 70% 10%, rgba(56, 189, 248, 0.06) 0%, transparent 50%);
      }
    `),
  },
];

export function getTheme(id: string): ThemeDefinition {
  return themes.find(t => t.id === id) || themes[0];
}

// Get loading screen colors for a theme (used before profile is loaded)
export function getThemeLoadingColors(themeId: string): { bg: string; text: string; accent: string; name: string } {
  const theme = themes.find(t => t.id === themeId);
  if (!theme || themeId === 'default') {
    return { bg: '#0f172a', text: '#e2e8f0', accent: '#3b82f6', name: 'Cargando' };
  }
  return {
    bg: theme.colors.backgroundColor || '#0f172a',
    text: theme.colors.textColor || '#e2e8f0',
    accent: theme.colors.primaryColor || '#3b82f6',
    name: theme.name,
  };
}
