
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: {
				DEFAULT: '1rem',
				sm: '1.5rem',
				md: '2rem',
				lg: '3rem',
			},
			screens: {
				sm: '640px',
				md: '768px',
				lg: '1024px',
				xl: '1280px',
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				// Colori primari (brand)
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					light: 'hsl(var(--primary-light))',
					dark: 'hsl(var(--primary-dark))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				// Colori secondari (accent)
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					light: 'hsl(var(--secondary-light))',
					dark: 'hsl(var(--secondary-dark))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				// Colori neutri
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				// Colori semantici
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
				},
				info: {
					DEFAULT: 'hsl(var(--info))',
					foreground: 'hsl(var(--info-foreground))'
				},
				// Altri colori dell'interfaccia
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					from: {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					to: {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'fade-out': {
					from: {
						opacity: '1',
						transform: 'translateY(0)'
					},
					to: {
						opacity: '0',
						transform: 'translateY(10px)'
					}
				},
				'slide-in-right': {
					'0%': { transform: 'translateX(100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'slide-in-left': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'slide-out-right': {
					'0%': { transform: 'translateX(0)' },
					'100%': { transform: 'translateX(100%)' }
				},
				'slide-out-left': {
					'0%': { transform: 'translateX(0)' },
					'100%': { transform: 'translateX(-100%)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-out': 'fade-out 0.3s ease-out',
				'slide-in-right': 'slide-in-right 0.3s ease-out',
				'slide-in-left': 'slide-in-left 0.3s ease-out',
				'slide-out-right': 'slide-out-right 0.3s ease-out',
				'slide-out-left': 'slide-out-left 0.3s ease-out'
			},
			typography: {
				DEFAULT: {
					css: {
						maxWidth: '65ch',
						color: 'var(--tw-prose-body)',
						'[class~="lead"]': {
							color: 'var(--tw-prose-lead)'
						},
						a: {
							color: 'var(--tw-prose-links)',
							textDecoration: 'underline',
							textUnderlineOffset: '3px',
							fontWeight: '500',
							'&:hover': {
								color: 'var(--tw-prose-links-hover)'
							}
						},
						strong: {
							color: 'var(--tw-prose-bold)',
							fontWeight: '600'
						},
						'ol > li::marker': {
							color: 'var(--tw-prose-counters)'
						},
						'ul > li::marker': {
							color: 'var(--tw-prose-bullets)'
						},
						hr: {
							borderColor: 'var(--tw-prose-hr)',
							borderTopWidth: 1
						},
						blockquote: {
							color: 'var(--tw-prose-quotes)',
							borderLeftWidth: '4px',
							borderLeftColor: 'var(--tw-prose-quote-borders)',
							paddingLeft: '1.5rem',
							fontStyle: 'italic'
						},
						h1: {
							color: 'var(--tw-prose-headings)',
							fontWeight: '700',
							fontSize: '2.25rem',
							marginTop: '1.5rem',
							marginBottom: '1rem',
							lineHeight: '1.2'
						},
						h2: {
							color: 'var(--tw-prose-headings)',
							fontWeight: '600',
							fontSize: '1.5rem',
							marginTop: '1.5rem',
							marginBottom: '0.75rem',
							lineHeight: '1.25'
						},
						h3: {
							color: 'var(--tw-prose-headings)',
							fontWeight: '600',
							fontSize: '1.25rem',
							marginTop: '1.5rem',
							marginBottom: '0.75rem',
							lineHeight: '1.25'
						},
						h4: {
							color: 'var(--tw-prose-headings)',
							fontWeight: '600',
							fontSize: '1.1rem',
							marginTop: '1.5rem',
							marginBottom: '0.5rem',
							lineHeight: '1.5'
						},
						code: {
							color: 'var(--tw-prose-code)',
							backgroundColor: 'var(--tw-prose-code-bg)',
							padding: '0.25rem 0.375rem',
							borderRadius: '0.25rem',
							fontWeight: '500'
						},
						pre: {
							color: 'var(--tw-prose-pre-code)',
							backgroundColor: 'var(--tw-prose-pre-bg)',
							padding: '1rem',
							borderRadius: '0.5rem',
							overflowX: 'auto'
						},
						'pre code': {
							color: 'inherit',
							backgroundColor: 'transparent',
							padding: '0',
							fontWeight: 'inherit'
						}
					}
				}
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
