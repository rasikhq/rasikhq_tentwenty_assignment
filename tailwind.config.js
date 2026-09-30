/**
 * Design values from the Figma file ("Tentwenty - App Test").
 * Colours, spacing, fonts and type sizes replace Tailwind's defaults, so only these exist.
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    colors: {
      transparent: 'transparent',
      white: '#FFFFFF',
      // The Figma guide palette
      navy: '#2E2739',
      'off-white': '#F6F6FA',
      grey: '#827D88',
      sky: '#61C3F2',
      'light-grey': '#DBDBDF',
      teal: '#15D2BC',
      pink: '#E26CA5',
      purple: '#564CA3',
      gold: '#CD9D0F',
      // Text colours used on the Figma screens
      ink: '#202C43',
      muted: '#8F8F8F',
    },
    // Tailwind's spacing steps up to 24, in px so they don't depend on NativeWind's rem
    spacing: {
      0: '0px',
      px: '1px',
      0.5: '2px',
      1: '4px',
      1.5: '6px',
      2: '8px',
      2.5: '10px',
      3: '12px',
      4: '16px',
      5: '20px',
      6: '24px',
      7: '28px',
      8: '32px',
      10: '40px',
      12: '48px',
      14: '56px',
      16: '64px',
      20: '80px',
      24: '96px',
    },
    // Android can't synthesize weights for custom fonts, so each weight is its own family,
    // and the font-weight utilities (font-bold etc.) are removed so nothing fakes a weight
    fontFamily: {
      poppins: 'Poppins-Regular',
      'poppins-medium': 'Poppins-Medium',
      'poppins-semibold': 'Poppins-SemiBold',
    },
    fontWeight: {},
    fontSize: {
      '2xs': ['10px', { lineHeight: '15px' }],
      xs: ['12px', { lineHeight: '18px' }],
      sm: ['14px', { lineHeight: '21px' }],
      base: ['16px', { lineHeight: '24px' }],
      lg: ['18px', { lineHeight: '27px' }],
      xl: ['20px', { lineHeight: '30px' }],
    },
  },
  plugins: [],
};
