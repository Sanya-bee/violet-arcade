const v = (n) => `rgb(var(--${n}) / <alpha-value>)`
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {
    colors: { bg: v('bg'), surface: v('surface'), card: v('card'), primary: v('primary'), accent: v('accent'), ink: v('ink'), muted: v('muted') },
    fontFamily: { sans: ['Manrope', 'ui-sans-serif', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'] },
  } },
  plugins: [],
}
