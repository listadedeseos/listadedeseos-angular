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
      label: 'Baby Shower',
      subtitle: 'Celebrando la llegada de un nuevo bebé',
      banner: '/assets/banners/babyshower.svg',
      classes: 'bg-[#EEF1F5] text-[#4E6076] border border-[#D7DEE6]',
      heroClasses: 'bg-cream-alt',
      pageBackgroundClasses: 'bg-cream',
      overlayClasses: 'absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30',
      dark: false,
      colors: {
        primary: '#7A8FA6',
        secondary: '#EEF1F5',
        accent: '#4E6076'
      }
    },
    cumpleanos: {
      label: 'Cumpleaños',
      subtitle: 'Que tengas un feliz cumpleaños lleno de sorpresas',
      banner: '/assets/banners/cumpleanos.svg',
      classes: 'bg-[#FAF2E6] text-[#8A5A17] border border-[#EBDCC2]',
      heroClasses: 'bg-cream-alt',
      pageBackgroundClasses: 'bg-cream',
      overlayClasses: 'absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30',
      dark: false,
      colors: {
        primary: '#B4762B',
        secondary: '#FAF2E6',
        accent: '#8A5A17'
      }
    },
    boda: {
      label: 'Boda',
      subtitle: 'Celebrando el amor y la nueva vida juntos',
      banner: '/assets/banners/boda.svg',
      classes: 'bg-[#F3EFF4] text-[#6B5A76] border border-[#E1D8E6]',
      heroClasses: 'bg-cream-alt',
      pageBackgroundClasses: 'bg-cream',
      overlayClasses: 'absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30',
      dark: false,
      colors: {
        primary: '#8C7B96',
        secondary: '#F3EFF4',
        accent: '#6B5A76'
      }
    },
    navidad: {
      label: 'Navidad',
      subtitle: 'Que la magia de la Navidad llene tu hogar',
      banner: '/assets/banners/navidad.svg',
      classes: 'bg-[#EAF0EC] text-[#2F5D45] border border-[#CBDCD1]',
      heroClasses: 'bg-cream-alt',
      pageBackgroundClasses: 'bg-cream',
      overlayClasses: 'absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30',
      dark: true,
      colors: {
        primary: '#3E6B52',
        secondary: '#EAF0EC',
        accent: '#2F5D45'
      }
    },
    graduacion: {
      label: 'Graduación',
      subtitle: 'Celebrando este gran logro académico',
      banner: '/assets/banners/graduacion.svg',
      classes: 'bg-[#E9ECF2] text-[#2B3A57] border border-[#CBD3E2]',
      heroClasses: 'bg-cream-alt',
      pageBackgroundClasses: 'bg-cream',
      overlayClasses: 'absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30',
      dark: true,
      colors: {
        primary: '#3A4B6B',
        secondary: '#E9ECF2',
        accent: '#2B3A57'
      }
    }
  },

  // Base classes for components
  baseClasses: {
    badge: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide',
    hero: 'relative py-14 px-4 overflow-hidden border-b border-line',
    page: 'min-h-screen',
  },

  // Helper methods to get theme data
  getTheme: (theme: string) => {
    return ThemeConfig.themes[theme as keyof typeof ThemeConfig.themes] || false;
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
  },

  isDarkTheme: (theme: string) => {
    const themeData = ThemeConfig.getTheme(theme);
    return themeData ? themeData.dark : false;
  }
};
