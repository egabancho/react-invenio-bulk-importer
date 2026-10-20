import { resolve } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(({ mode }) => ({
  server: {
    host: '127.0.0.1',
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://127.0.0.1:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  plugins: [
    react({ jsxRuntime: 'classic' }),
    dts({
      insertTypesEntry: true,
      tsconfigPath: './tsconfig.dts.json',
      rollupTypes: true
    }),
    basicSsl()
  ],
  resolve: {
    alias: [
      {
        find: '@/styled-system',
        replacement: resolve(__dirname, 'styled-system')
      },
      { find: '@', replacement: resolve(__dirname, 'src') }
    ]
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'InvenioBulkImporter',
      formats: ['es', 'cjs'],
      fileName: format => `index.${format === 'es' ? 'es' : 'cjs'}.js`
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react-invenio-forms',
        'formik',
        'semantic-ui-react',
        'axios',
        'lodash',
        'qs',
        'react-redux',
        'redux',
        'redux-thunk',
        'react-overridable'
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-invenio-forms': 'ReactInvenioForms',
          formik: 'Formik',
          'semantic-ui-react': 'SemanticUIReact'
        },
        exports: 'named',
        interop: 'auto'
      }
    },
    // This will inline CSS into your JS bundle
    cssCodeSplit: false,
    // Keep dist/package.json, written by prelink-dist, across watch rebuilds
    emptyOutDir: mode !== 'development'
  }
}));
