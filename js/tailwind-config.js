// Morrent — configuración compartida de Tailwind (una sola fuente de verdad)
tailwind.config = {
  theme: {
    extend: {
      colors: {
        ink: '#15130F',
        orange: '#E0531F',
        yellow: '#F5B400',
        steel: '#6E675D',
        'steel-light': '#A39C90',
        paper: '#FFFFFF',
        haze: '#F6F4F0'
      },
      fontFamily: {
        display: ['Big Shoulders Display', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      letterSpacing: {
        tightest: '-.04em',
        widest2: '.25em',
      }
    }
  }
};