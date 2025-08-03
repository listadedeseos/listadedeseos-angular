export const enum Theme {
  BABYSHOWER = 'babyshower',
  CUMPLEANOS = 'cumpleanos',
  BODA = 'boda',
  NAVIDAD = 'navidad',
  GRADUACION = 'graduacion'
}

export const ThemeConfig = {
  themes: {
    babyshower: {
      label: '🍼 Baby Shower',
      subtitle: '¡Celebrando la llegada de un nuevo bebé! 🍼',
      banner: '/assets/banners/babyshower.svg',
      classes: 'bg-gradient-to-r from-pink-200 to-blue-200 text-pink-800 border border-pink-300',
      heroClasses: 'bg-gradient-to-br from-pink-300 via-blue-200 to-pink-200',
      pageBackgroundClasses: 'bg-gradient-to-br from-pink-100 via-blue-50 to-pink-50',
      overlayClasses: 'absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30',
      colors: {
        primary: '#FFB6C1',
        secondary: '#87CEEB',
        accent: '#DEB887'
      }
    },
    cumpleanos: {
      label: '🎂 Cumpleaños',
      subtitle: '¡Que tengas un feliz cumpleaños lleno de sorpresas! 🎂',
      banner: '/assets/banners/cumpleanos.svg',
      classes: 'bg-gradient-to-r from-yellow-200 to-orange-200 text-orange-800 border border-orange-300',
      heroClasses: 'bg-gradient-to-br from-yellow-300 via-orange-300 to-pink-300',
      pageBackgroundClasses: 'bg-gradient-to-br from-yellow-100 via-orange-50 to-pink-50',
      overlayClasses: 'absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30',
      colors: {
        primary: '#FFD700',
        secondary: '#FF8C00',
        accent: '#FF69B4'
      }
    },
    boda: {
      label: '💒 Boda',
      subtitle: 'Celebrando el amor y la nueva vida juntos 💒',
      banner: '/assets/banners/boda.svg',
      classes: 'bg-gradient-to-r from-white to-pink-100 text-pink-800 border border-pink-300',
      heroClasses: 'bg-gradient-to-br from-white via-pink-100 to-purple-100',
      pageBackgroundClasses: 'bg-gradient-to-br from-white via-pink-50 to-purple-50',
      overlayClasses: 'absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30',
      colors: {
        primary: '#FFFFFF',
        secondary: '#FFB6C1',
        accent: '#E6E6FA'
      }
    },
    navidad: {
      label: '🎄 Navidad',
      subtitle: '¡Que la magia de la Navidad llene tu hogar! 🎄',
      banner: '/assets/banners/navidad.svg',
      classes: 'bg-gradient-to-r from-red-200 to-green-200 text-green-800 border border-green-300',
      heroClasses: 'bg-gradient-to-br from-red-400 via-green-300 to-red-300',
      pageBackgroundClasses: 'bg-gradient-to-br from-red-100 via-green-50 to-red-50',
      overlayClasses: 'absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30',
      colors: {
        primary: '#DC143C',
        secondary: '#228B22',
        accent: '#FFD700'
      }
    },
    graduacion: {
      label: '🎓 Graduación',
      subtitle: '¡Celebrando este gran logro académico! 🎓',
      banner: '/assets/banners/graduacion.svg',
      classes: 'bg-gradient-to-r from-blue-200 to-indigo-200 text-blue-800 border border-blue-300',
      heroClasses: 'bg-gradient-to-br from-blue-400 via-indigo-300 to-blue-300',
      pageBackgroundClasses: 'bg-gradient-to-br from-blue-100 via-indigo-50 to-blue-50',
      overlayClasses: 'absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30',
      colors: {
        primary: '#4169E1',
        secondary: '#6495ED',
        accent: '#FFD700'
      }
    }
  },
  
  // Default theme configuration
  default: {
    label: 'Sin tema',
    subtitle: '¡Una lista especial para una ocasión especial!',
    banner: '/assets/banners/default.svg',
    classes: 'bg-gray-100 text-gray-800 border border-gray-300',
    heroClasses: 'bg-gradient-to-br from-purple-400 via-pink-400 to-purple-300',
    pageBackgroundClasses: 'bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50',
    overlayClasses: 'bg-gradient-to-t from-purple-500/20 to-pink-500/20',
    colors: {
      primary: '#9333EA',
      secondary: '#EC4899',
      accent: '#8B5CF6'
    }
  },

  // Base classes for components
  baseClasses: {
    badge: 'inline-flex items-center px-4 py-2 rounded-full text-sm font-medium shadow-lg',
    hero: 'relative py-12 px-4 overflow-hidden',
    page: 'min-h-screen transition-all duration-500',
  },

  // Helper methods to get theme data
  getTheme: (theme: string) => {
    return ThemeConfig.themes[theme as keyof typeof ThemeConfig.themes] || ThemeConfig.default;
  },

  getAllThemes: () => {
    return Object.entries(ThemeConfig.themes).map(([key, value]) => ({
      value: key,
      label: value.label
    }));
  },

  getThemeClasses: (theme: string) => {
    const themeData = ThemeConfig.getTheme(theme);
    return `${ThemeConfig.baseClasses.badge} ${themeData.classes}`;
  },

  getHeroClasses: (theme: string) => {
    const themeData = ThemeConfig.getTheme(theme);
    return `${ThemeConfig.baseClasses.hero} ${themeData.heroClasses}`;
  },

  getPageClasses: (theme: string) => {
    const themeData = ThemeConfig.getTheme(theme);
    return `${ThemeConfig.baseClasses.page} ${themeData.pageBackgroundClasses}`;
  }
};
