import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      fileName: 'index',
      formats: ['es'],
      entry: ['./src/index.ts'],
    },
    rollupOptions: {
      external: ['vue'],
    },
  },
})
