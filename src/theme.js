// The Gori theme: Gori's slate neutrals, dark first, expressed as @nyt87/tokens overrides.
// The accent family (buttons, focus ring, links) is NOT overridden: it comes from the design system, so primary
// buttons are the same nyt87 orange with white text as on nyt87.github.io. Green stays for success states (--ok).
// build.js turns this into assets/gori-theme.css with defineTheme, and fails the build if any text pair
// drops below WCAG contrast, so a colour change here cannot ship an unreadable page.
export const GORI_THEME = {
  name: 'gori',
  dark: {
    bg: '#020617', 'bg-raised': '#0e1223', 'bg-sunken': '#1a1e2f',
    fg: '#f8fafc', 'fg-muted': '#94a3b8',
    border: '#334155', 'border-strong': '#64748b',
    warn: '#f59e0b', shadow: 'rgb(0 0 0 / 0.45)',
  },
  light: {
    bg: '#ffffff', 'bg-raised': '#f8fafc', 'bg-sunken': '#f1f5f9',
    fg: '#0f172a', 'fg-muted': '#475569',
    border: '#e2e8f0', 'border-strong': '#64748b',
    warn: '#b45309', shadow: 'rgb(15 23 42 / 0.12)',
  },
};
