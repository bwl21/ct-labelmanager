import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('ct-')
        }
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
        'vue': 'vue/dist/vue.esm-bundler.js'
    }
  },
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
  },
  root: '.',
  base: '/',
  server: {
    port: 3000,
    open: true,
    host: true,
    allowedHosts: true, // Erlaubt alle Hosts (für Entwicklung)
    cors: {
      origin: [
        'https://testbernhard.church.tools',
        'https://deine-churchtools-instanz.church.tools',
        // Weitere erlaubte ChurchTools-Instanzen hier hinzufügen
      ],
      credentials: true
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: 'index.html'
    },
    commonjsOptions: {
      esmExternals: true
    }
  },
  optimizeDeps: {
    include: ['vue']
  }
});
