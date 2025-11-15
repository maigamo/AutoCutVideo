import { defineConfig } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  main: {
    build: {
      outDir: 'dist-electron/main',
      rollupOptions: {
        external: [
          'better-sqlite3', 
          'electron',
          'fluent-ffmpeg',
          '@ffmpeg-installer/ffmpeg',
          'playwright'
        ]
      }
    }
  },
  preload: {
    build: {
      outDir: 'dist-electron/preload',
      rollupOptions: {
        external: ['electron'],
        output: {
          entryFileNames: 'index.js',
          format: 'cjs'
        }
      }
    }
  },
  renderer: {
    root: 'src/renderer',
    build: {
      outDir: 'dist-electron/renderer'
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src/renderer/src')
      }
    },
    plugins: [vue()],
    server: {
      port: 10031,
      strictPort: true,
      host: '0.0.0.0' // 允许通过本机IP访问
    }
  }
})

