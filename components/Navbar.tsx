import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <nav style={styles.nav}>
      <div style={styles.navContent}>
        <Link href="/" style={styles.logo}>
          <div style={styles.logoWrapper}>
            <span style={styles.logoMain}>AKA·UKALAR</span>
            <span style={styles.logoSub}>O‘QUV MARKAZI</span>
          </div>
        </Link>

        <div style={styles.navLinks}>
          <Link href="/" style={styles.navLink}>Bosh sahifa</Link>
          <Link href="/courses" style={styles.navLink}>Kurslar</Link>
          <Link href="/schedule" style={styles.navLink}>Dars jadvali</Link>
          <Link href="/forum" style={styles.navLink}>Forum</Link>
          <Link href="/groups" style={styles.navLink}>Guruhlar</Link>
        </div>

        <div style={styles.authButtons}>
          {mounted && (
            <button onClick={toggleTheme} style={styles.themeToggle}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          )}
          {!session ? (
            <>
              <Link href="/login" style={styles.loginButton}>Kirish</Link>
              <Link href="/register" style={styles.registerButton}>Ro'yxat</Link>
            </>
          ) : (
            <div style={styles.userMenu}>
              <Link href="/profile" style={styles.profileLink}>
                <div style={styles.avatarContainer}>
                  {(session.user as any)?.image ? (
                    <img src={(session.user as any).image} alt={session.user.name || ''} style={styles.avatar} />
                  ) : (
                    <div style={styles.avatarPlaceholder}>
                      {session.user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <span style={styles.userName}>{session.user?.name}</span>
              </Link>
              <button onClick={() => signOut()} style={styles.logoutButton}>
                Chiqish
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    background: 'var(--nav-bg)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid var(--border-color)',
    position: 'sticky' as const,
    top: 0,
    zIndex: 50
  },
  navContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0.5rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '80px'
  },
  logo: {
    textDecoration: 'none'
  },
  logoWrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    lineHeight: 1.2,
  },
  logoMain: {
    fontSize: '1.8rem',
    fontWeight: '800',
    letterSpacing: '2px',
    background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  logoSub: {
    fontSize: '0.8rem',
    fontWeight: '400',
    color: 'var(--text-secondary)',
    letterSpacing: '1px',
  },
  navLinks: {
    display: 'flex',
    gap: '1rem'
  },
  navLink: {
    padding: '0.5rem 1rem',
    color: 'var(--text-primary)',
    textDecoration: 'none',
    fontSize: '1rem',
    borderRadius: '30px',
    transition: 'all 0.2s'
  },
  authButtons: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
  },
  themeToggle: {
    background: 'none',
    border: '1px solid var(--border-color)',
    fontSize: '1.2rem',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-primary)'
  },
  loginButton: {
    padding: '0.5rem 1.5rem',
    background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
    border: 'none',
    borderRadius: '30px',
    color: 'white',
    fontSize: '0.9rem',
    textDecoration: 'none',
    cursor: 'pointer'
  },
  registerButton: {
    padding: '0.5rem 1.5rem',
    background: '#10b981',
    border: 'none',
    borderRadius: '30px',
    color: 'white',
    fontSize: '0.9rem',
    textDecoration: 'none',
    cursor: 'pointer'
  },
  userMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  profileLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    textDecoration: 'none',
    color: 'var(--text-primary)'
  },
  avatarContainer: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    overflow: 'hidden',
    background: '#8B5CF6'
  },
  avatar: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '1rem',
    fontWeight: 'bold'
  },
  userName: {
    fontSize: '0.95rem',
    fontWeight: '500',
    color: 'var(--text-primary)'
  },
  logoutButton: {
    padding: '0.5rem 1rem',
    background: '#dc2626',
    border: 'none',
    borderRadius: '30px',
    color: 'white',
    fontSize: '0.9rem',
    cursor: 'pointer'
  }
}
