import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 生成版本戳（基于时间）
const version = new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Date.now().toString(36).slice(-4)

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:3000',
      '/uploads': 'http://127.0.0.1:3000'
    }
  },
  build: {
    // 添加版本戳到资源文件名，强制浏览器刷新
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-${version}.js`,
        chunkFileNames: `assets/[name]-${version}.js`,
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          return `assets/[name]-${version}[extname]`
        }
      }
    }
  },
  define: {
    // 注入版本号到前端
    __APP_VERSION__: JSON.stringify(version)
  }
})
