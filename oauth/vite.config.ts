import { defineConfig } from 'vite'

export default defineConfig({
    root: 'src',
    base: '/oauth/dist/',
    build: {
        outDir: '../dist',
        emptyOutDir: true,
    },
    server: {
        port: 4173,
    },
    preview: {
        port: 4173
    }
})
