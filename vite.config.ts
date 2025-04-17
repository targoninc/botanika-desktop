import path from 'node:path'
import {defineConfig} from 'vite'
import electron from 'vite-plugin-electron/simple'
import native from 'vite-plugin-native'
/// <reference types="vitest" />

export default defineConfig({
    server: {
        hmr: false
    },
    plugins: [
        electron({
            main: {
                entry: 'electron/main.ts',
                vite: {
                    appType: "spa",
                    plugins: [
                        native({
                            webpack: {},
                        }),
                    ],
                },
            },
            preload: {
                input: path.join(__dirname, 'electron/preload.ts'),
            },
        }),
    ],
    test: {
        globals: true,
        environment: 'node',
        include: ['**/tests/**/*.test.ts'],
        exclude: ['node_modules'],
    },
})
