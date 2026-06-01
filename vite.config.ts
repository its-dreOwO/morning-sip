/// <reference types="vitest/config" />
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const GITHUB_USER = 'its-dreOwO'

// Dev-only proxy for the contributions heatmap. Keeps GITHUB_TOKEN server-side
// (no VITE_ prefix) so it never lands in the client bundle. POSTs the
// contributionCalendar GraphQL query and forwards the calendar JSON.
function contributionsProxy(): Plugin {
  return {
    name: 'contributions-proxy',
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), '')
      const token = env.GITHUB_TOKEN
      server.middlewares.use('/api/contributions', async (_req, res) => {
        res.setHeader('Content-Type', 'application/json')
        if (!token) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'GITHUB_TOKEN not set. Copy .env.example to .env.' }))
          return
        }
        const to = new Date()
        const from = new Date()
        from.setFullYear(from.getFullYear() - 1)
        const query = `query($user:String!,$from:DateTime!,$to:DateTime!){
          user(login:$user){ contributionsCollection(from:$from,to:$to){
            contributionCalendar { totalContributions
              weeks { contributionDays { date contributionCount contributionLevel } } } } } }`
        try {
          const ghRes = await fetch('https://api.github.com/graphql', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query,
              variables: { user: GITHUB_USER, from: from.toISOString(), to: to.toISOString() },
            }),
          })
          const json = (await ghRes.json()) as {
            data?: { user?: { contributionsCollection?: { contributionCalendar?: unknown } } }
            errors?: unknown
          }
          const calendar =
            json?.data?.user?.contributionsCollection?.contributionCalendar
          if (!calendar) {
            res.statusCode = 502
            res.end(JSON.stringify({ error: 'GitHub returned no calendar.', detail: json?.errors }))
            return
          }
          res.statusCode = 200
          res.end(JSON.stringify(calendar))
        } catch (e) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: String(e) }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), contributionsProxy()],
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'development'),
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
