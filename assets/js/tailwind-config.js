// Shared Tailwind CSS Configuration for Techera B2B Portal
window.tailwind = window.tailwind || {};
window.tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#FFF5F0',
          100: '#FFE7DB',
          200: '#FFCEB8',
          300: '#FFAF8A',
          400: '#FF8453',
          500: '#F15A24',
          600: '#D94714',
          700: '#B8340D',
          800: '#942B0D',
          900: '#7B250E'
        },
        appBg: '#F8F9FA',
        slateDark: '#0F172A',
      },
      boxShadow: {
        'brand-glow': '0 4px 20px -2px rgba(241, 90, 36, 0.28)',
        'card-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
      }
    }
  }
};
