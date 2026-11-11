import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const copyIndexTo404 = () => ({
    name: 'copy-index-to-404',
    closeBundle() {
        const distDir = path.resolve(__dirname, 'dist')
        const indexHtml = path.join(distDir, 'index.html')
        const notFoundHtml = path.join(distDir, '404.html')
        if (fs.existsSync(indexHtml)) {
            fs.copyFileSync(indexHtml, notFoundHtml)
        }
    }
})

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
    plugins: [
        react(),
        copyIndexTo404(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.png', 'apple-touch-icon.png', 'masked-icon.svg'],
            manifest: {
                name: 'Gym Pulse',
                short_name: 'Pulse',
                description: 'Your Personal Tracker',
                theme_color: '#060608',
                background_color: '#060608',
                display: 'standalone',
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ]
            }
        })
    ],
    base: command === 'serve' ? '/' : '/Gym-Pulse/',
    server: {
        port: 3000,
        proxy: {
            '/api': 'http://localhost:5001'
        }
    }
}))
