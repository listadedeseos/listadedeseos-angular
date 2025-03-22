/** @type {import('tailwindcss').Config} */

const plugin = require('tailwindcss/plugin')

module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {

      fontFamily: {
        celestina: ['Herr Von Muellerhoff'],
        roboto: ['Roboto'],
      },

      animation: {
        scaleadd: 'scaleadd 0.5s ease-in-out',
      },

      keyframes: {
        scaleadd: {
          '0%': { transform: 'scale(0)' },
          '80%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
      },

    },
  },

  plugins: [

    plugin(function ({ addBase }) {
      addBase({
        '@font-face': [

          {
            fontFamily: 'Herr Von Muellerhoff',
            fontWeight: '400',
            src: 'url(../public/assets/fonts/HerrVonMuellerhoff/HerrVonMuellerhoff-Regular.ttf) format("truetype")',
          },

          {
            fontFamily: 'Roboto',
            fontWeight: '400',
            src: 'url(../public/assets/fonts/Roboto/Roboto-Regular.ttf) format("truetype")',
          }

        ]
      })
    })

  ],
}