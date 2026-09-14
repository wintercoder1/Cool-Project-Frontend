/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./index.html", 
    "./src/**/*.{ts,tsx,js,jsx}"
  ],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
			'compass-logo-blue': '#3BB8E5',
			// The site's accent. Black and white carry the design; this is the
			// one accent hue, and it means "your choice" (a selected quiz
			// answer) or "this button is live under your cursor".
			//
			// Hue 201, not Tailwind's blue-* family at 221-224. A saturated
			// blue at that angle reads violet rather than blue once it is dark
			// enough to carry white text, and darkening it makes that worse.
			// 201 does not have the problem at any lightness.
			//
			// DEFAULT is sky-700, the lightest step on that hue that clears
			// 4.5:1 against white text (5.93:1). sky-600 looks right and fails
			// at 4.10:1 — do not reach for it.
			brand: {
				DEFAULT: '#0369a1',   // sky-700  · selections, primary-button hover
				tint: '#f0f9ff',      // sky-50   · informational note background
				deep: '#0c4a6e',      // sky-900  · informational note text
			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}

