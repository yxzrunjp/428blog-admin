import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  server: {
    hmr: true,//热更新
    port: 3001,
    proxy: {
      '/api': {
        // target:loadEnv(mode,process.cwd()).VITE_APP_PROXY_TARGET,//目标代理接口地址
        target: "http://localhost:8081/",
        secure: false,
        changeOrigin: true,//开启代理，在本地创建一个虚拟服务端
        pathRewrite: {
          '^/api': '/api',
        }
      }
    }
  },
  resolve: {
    // 配置路径别名
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'static/[name].[hash].js',
        chunkFileNames: 'static/js/[name].[hash].js',
        assetFileNames: 'static/[ext]/[name].[hash].[ext]',
      }
    }
  }
})
