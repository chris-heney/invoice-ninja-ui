import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';


export default defineConfig( ({ command, mode }) => {

  loadEnv(mode, command);
  
  return {
    plugins: [tsconfigPaths(), react()],
    server: {
      port: 3000,
    },
    build: {
      assetsDir: 'assets',
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return id
                .toString()
                .split('node_modules/')[1]
                .split('/')[0]
                .toString();
            }
          },
        },
      },
    },
  };
});
