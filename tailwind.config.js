/** @type {import('tailwindcss').Config} */
module.exports = {
  
  content: [
    './client/html/*.html',
    './client/panels/*.js'
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: ["light", "dark", "cupcake", "emerald", "synthwave", "cyberpunk", "cmyk", "acid",
      
    ]
  },
  
}

