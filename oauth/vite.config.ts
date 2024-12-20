import { defineConfig } from 'vite'

export default defineConfig({
    root: 'src',
    base: '/oauth/',
    build: {
        outDir: '../dist',
        emptyOutDir: true,
    },
    server: {
        port: 3000,
    },
})
