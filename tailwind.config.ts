import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  theme: {
    extend: {
      borderRadius: {
        DEFAULT: '0.125rem',
        sm: '0.125rem',
      },
      colors: {
        canvas: 'var(--color-bg-canvas)',
        surface: 'var(--color-bg-surface)',
        border: 'var(--color-border)',
        ludo: {
          red: {
            DEFAULT: 'var(--color-ludo-red)',
            light: 'var(--color-ludo-red-light)',
            dark: 'var(--color-ludo-red-dark)',
          },
          green: {
            DEFAULT: 'var(--color-ludo-green)',
            light: 'var(--color-ludo-green-light)',
            dark: 'var(--color-ludo-green-dark)',
          },
          yellow: {
            DEFAULT: 'var(--color-ludo-yellow)',
            light: 'var(--color-ludo-yellow-light)',
            dark: 'var(--color-ludo-yellow-dark)',
          },
          blue: {
            DEFAULT: 'var(--color-ludo-blue)',
            light: 'var(--color-ludo-blue-light)',
            dark: 'var(--color-ludo-blue-dark)',
          },
          neutral: {
            50: 'var(--color-neutral-50)',
            100: 'var(--color-neutral-100)',
            200: 'var(--color-neutral-200)',
            300: 'var(--color-neutral-300)',
            800: 'var(--color-neutral-800)',
            900: 'var(--color-neutral-900)',
          },
          safe: 'var(--color-ludo-safe)',
        },
      },
    },
  },
}
