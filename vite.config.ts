import { defineConfig } from 'vite';

import plainText from 'vite-plugin-plain-text';

export default defineConfig({
    build: {
        lib: {
            entry: './lib/main.ts',
            name: 'Counter',
            fileName: 'counter',
        },
    },
    plugins: [
        plainText(['**/*.text', /\.glsl$/], {
            namedExport: false,
            dtsAutoGen: true,
            distAutoClean: true,
        }),
    ],
});
