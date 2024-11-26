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