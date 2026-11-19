import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function deferToastUiCss() {
  return {
    name: 'defer-toastui-css',
    transformIndexHtml(html) {
      return html.replace(
        /(<link rel="stylesheet"[^>]*href="[^"]*toastui[^"]*"[^>]*)>/g,
        '$1 media="print" onload="this.media=\'all\'">'
      )
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), deferToastUiCss()],
  build: {
    target: 'esnext',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@toast-ui/editor')) {
            return 'toastui'
          }
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        },
      },
    },
  },
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        'src/main.jsx',
        'src/setupTests.js',
        '**/*.test.{js,jsx}',
      ],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
})
