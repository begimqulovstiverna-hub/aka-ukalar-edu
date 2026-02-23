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

          /* Mobil moslashuv */
          @media (max-width: 768px) {
            .burger {
              display: block !important;
            }
            .navRight {
              position: absolute;
              top: 80px;
              left: 0;
              width: 100%;
              background: var(--nav-bg);
              backdrop-filter: blur(10px);
              flex-direction: column;
              padding: 1rem;
              gap: 1rem;
              border-bottom: 1px solid var(--border-color);
              z-index: 100;
            }
            .navLinks {
              flex-direction: column;
              width: 100%;
            }
            .navLink {
              width: 100%;
              text-align: center;
            }
            .authButtons {
              flex-direction: column;
              width: 100%;
            }
            .loginButton, .registerButton, .logoutButton {
              width: 100%;
              text-align: center;
            }
            .userMenu {
              flex-direction: column;
              width: 100%;
            }
            .profileLink {
              width: 100%;
              justify-content: center;
            }
          }
        `}</style>
      </ThemeProvider>
    </SessionProvider>
  )
}
