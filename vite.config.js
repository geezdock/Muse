import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __app_id: JSON.stringify('muse-closet-ai'),
    __firebase_config: JSON.stringify(JSON.stringify({
      apiKey: "PLACEHOLDER_API_KEY",
      authDomain: "muse-77182.firebaseapp.com",
      projectId: "muse-77182",
      storageBucket: "muse-77182.firebasestorage.app",
      messagingSenderId: "000000000000",
      appId: "1:000000000000:web:0000000000000000000000"
    })),
  },
})
