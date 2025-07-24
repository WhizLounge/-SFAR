import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import mkcert from 'vite-plugin-mkcert'

// https://vite.dev/config/
export default defineConfig({
  build:{
    outDir: '../API/wwwroot',
    chunkSizeWarningLimit: 1024, // Increase the chunk size warning limit to 1024 KB
    emptyOutDir: true, // Ensure the output directory is empty before building
  },
  server:{
port: 3000
  },
  plugins: [react(),mkcert()],

})
