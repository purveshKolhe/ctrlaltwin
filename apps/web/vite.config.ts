import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  if (command === 'build' && env.VITE_USE_MOCK_AUTH === 'true') {
    throw new Error('VITE_USE_MOCK_AUTH=true is not allowed in production builds')
  }

  return {
    plugins: [react()],
  }
})
