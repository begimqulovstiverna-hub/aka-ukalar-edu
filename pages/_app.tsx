import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Component {...pageProps} />
        <style global jsx>{`
          :root {
            --bg-gradient: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);
            --nav-bg: rgba(255, 255, 255, 0.8);
            --text-primary: #1f2937;
            --text-secondary: #4b5563;
            --border-color: #e5e7eb;
            --card-bg: white;
          }
          .dark {
            --bg-gradient: linear-gradient(135deg, #1F2937 0%, #111827 100%);
            --nav-bg: rgba(31, 41, 55, 0.9);
            --text-primary: #f9fafb;
            --text-secondary: #9ca3af;
            --border-color: #374151;
            --card-bg: #1f2937;
          }
          body {
            margin: 0;
            font-family: sans-serif;
            background: var(--bg-gradient);
            color: var(--text-primary);
            transition: background 0.3s, color 0.3s;
          }
        `}</style>
      </ThemeProvider>
    </SessionProvider>
  )
}
