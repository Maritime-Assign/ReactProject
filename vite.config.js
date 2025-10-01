import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // or '0.0.0.0'
    watch: {
      usePolling: true,
    },
  },
  test: {
    // Test react components
    environment: 'jsdom',
    // enable jest "describe it"
    globals: true,
    // Add setup file that runs before each test
    setupFiles: './src/setupTests.js',
    include: ['src/**/*.test.{js,jsx,ts,tsx}'],
  },
})
