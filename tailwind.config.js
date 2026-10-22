/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      // 18px step used by the redesign's button/panel recipes (px-4.5, p-4.5, gap-4.5)
      spacing: {
        '4.5': '1.125rem',
      },
      colors: {
        // Terracotta accent scale (primary brand color)
        primary: {
          50: '#FBF2ED',
          100: '#F7E4D9',
          200: '#EFC9B3',
          300: '#E3A67F',
          400: '#C97A4C',
          500: '#9A4A28',
          600: '#7A3719',
          700: '#5E2812',
          800: '#421C0D',
          900: '#2C1208',
          950: '#180A04',
        },
        // Near-black ink used for text, nav, and solid dark buttons
        ink: {
          DEFAULT: '#232019',
          hover: '#3A342A',
        },
        // Warm cream page/section backgrounds
        cream: {
          DEFAULT: '#F4F1EC',
          alt: '#FBF9F6',
        },
        // Thin hairline borders
        line: {
          DEFAULT: '#DDD6CB',
          soft: '#E7E1D7',
          card: '#E2DBD0',
          strong: '#C6BCAC',
        },
        // Muted warm-gray text
        muted: {
          DEFAULT: '#6B6357',
          light: '#8A8175',
          dark: '#4A443A',
          placeholder: '#A79E90',
        },
        // Empty image placeholder tiles
        swatch: {
          DEFAULT: '#EFEBE4',
          text: '#C9C0B2',
        },
        // Reserved-gift state
        reserved: {
          DEFAULT: '#2F5D45',
          light: '#EAF0EC',
          border: '#CBDCD1',
        },
        // Destructive actions / error states
        danger: {
          DEFAULT: '#8E2C22',
          hover: '#71211A',
          light: '#FBF0EC',
          border: '#E4C4BC',
          text: '#7A241B',
        },
        // Admin-mode accent
        admin: {
          DEFAULT: '#8A5A17',
          light: '#FAF2E6',
          border: '#EBDCC2',
        },
        // Per wish-list-theme accents
        event: {
          babyshower: '#7A8FA6',
          cumpleanos: '#B4762B',
          boda: '#8C7B96',
          navidad: '#3E6B52',
          graduacion: '#3A4B6B',
        },
        // Brand mark (star seal logo): near-black disc (`seal`, the app's
        // `ink` tone) with a white ring, and a terracotta star (`spark`,
        // the app's `primary-500` accent)
        logo: {
          seal: '#232019',
          spark: '#9A4A28',
        },
      },
      fontFamily: {
        sans: ['Karla', 'ui-sans-serif', 'system-ui'],
        serif: ['Newsreader', 'ui-serif', 'Georgia', 'serif'],
      },
      animation: {
        scaleadd: 'scaleadd 0.5s ease-in-out',
        twinkle: 'twinkle 1.8s ease-in-out infinite',
        // Modal busy overlay: stays invisible for quick requests, so fast loads don't flash
        'fadein-delayed': 'fadein 0.2s ease-out 0.3s both',
      },
      keyframes: {
        fadein: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleadd: {
          '0%': { transform: 'scale(0)' },
          '80%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
        twinkle: {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
          '50%': { transform: 'scale(1.18) rotate(10deg)', opacity: '0.7' },
        },
      },
    },
  },

  plugins: [],
}
