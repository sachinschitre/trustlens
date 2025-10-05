import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  server: {
    port: 3000,
    host: true,
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://superhero.com https://wallet.superhero.com",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self' https://testnet.aeternity.io https://mainnet.aeternity.io https://compiler.aepps.com https://sdk-testnet.aepps.com https://sdk-mainnet.aepps.com https://aescan.io https://api.openai.com http://localhost:3001",
        "frame-src 'self' https://superhero.com https://wallet.superhero.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'"
      ].join('; ')
    }
  }
})
