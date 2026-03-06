import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Deep navy background system
                navy: {
                    950: '#05060f',
                    900: '#0a0c1a',
                    800: '#0f1228',
                    700: '#151935',
                    600: '#1c2244',
                },
                // Violet accent system
                violet: {
                    400: '#a78bfa',
                    500: '#8b5cf6',
                    600: '#7c3aed',
                    700: '#6d28d9',
                },
                // Glass surface
                glass: {
                    DEFAULT: 'rgba(255,255,255,0.04)',
                    hover: 'rgba(255,255,255,0.07)',
                    border: 'rgba(255,255,255,0.08)',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-mesh':
                    'radial-gradient(at 27% 37%, hsla(215,98%,61%,0.08) 0px, transparent 50%), radial-gradient(at 97% 21%, hsla(255,98%,72%,0.1) 0px, transparent 50%), radial-gradient(at 52% 99%, hsla(240,98%,70%,0.08) 0px, transparent 50%)',
            },
            boxShadow: {
                'glow-violet': '0 0 20px rgba(139,92,246,0.25)',
                'glow-sm': '0 0 12px rgba(139,92,246,0.15)',
                glass: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
            },
            keyframes: {
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                'fade-in': {
                    from: { opacity: '0', transform: 'translateY(8px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
            },
            animation: {
                shimmer: 'shimmer 2s linear infinite',
                'fade-in': 'fade-in 0.3s ease-out',
            },
            backdropBlur: {
                xs: '2px',
            },
        },
    },
    plugins: [],
};

export default config;
