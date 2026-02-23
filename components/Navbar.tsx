import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'

export default function Navbar() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        {/* Logo */}
        <Link href="/" style={styles.logo} onClick={closeMenu}>
          AKA·UKALAR
        </Link>

        {/* 3 chiziqli burger tugmasi (mobil va desktopda) */}
        <button
          style={styles.burger}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span style={styles.burgerLine}></span>
          <span style={styles.burgerLine}></span>
          <span style={styles.burgerLine}></span>
        </button>

        {/* Navigatsiya linklari (desktopda yonma-yon, mobilda ochiladigan) */}
        <div style={{
          ...styles.menu,
          ...(menuOpen ? styles.menuOpen : {})
        }}>
          <Link href="/" style={styles.link} onClick={closeMenu}>Bosh sahifa</Link>
          <Link href="/courses" style={styles.link} onClick={closeMenu}>Kurslar</Link>
          <Link href="/schedule" style={styles.link} onClick={closeMenu}>Dars jadvali</Link>
          <Link href="/forum" style={styles.link} onClick={closeMenu}>Forum</Link>
          <Link href="/groups" style={styles.link} onClick={closeMenu}>Guruhlar</Link>

          <div style={styles.separator}></div>

          {!session ? (
            <>
              <Link href="/login" style={styles.login} onClick={closeMenu}>Kirish</Link>
              <Link href="/register" style={styles.register} onClick={closeMenu}>Ro'yxat</Link>
            </>
          ) : (
            <>
              <Link href="/profile" style={styles.profile} onClick={closeMenu}>
                {session.user?.name}
              </Link>
              <button onClick={() => { signOut(); closeMenu(); }} style={styles.logout}>
                Chiqish
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    backgroundColor: '#ffffff',
    borderBottom: '2px solid #f0f0f0',
    padding: '0.5rem 2rem',
    position: 'sticky' as const,
    top: 0,
    zIndex: 1000,
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
  },
  logo: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textDecoration: 'none',
    padding: '0.5rem 0',
  },
  burger: {
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-around',
    width: '30px',
    height: '30px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    zIndex: 1001,
  },
  burgerLine: {
    width: '30px',
    height: '3px',
    background: '#333',
    borderRadius: '3px',
    transition: 'all 0.3s',
  },
  menu: {
    display: 'none',
    flexDirection: 'column' as const,
    width: '100%',
    backgroundColor: '#ffffff',
    padding: '1rem 0',
    gap: '0.75rem',
    borderTop: '1px solid #f0f0f0',
    marginTop: '0.5rem',
  },
  menuOpen: {
    display: 'flex',
  },
  link: {
    color: '#333',
    textDecoration: 'none',
    fontSize: '1.1rem',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    transition: 'background 0.2s',
    width: '100%',
    textAlign: 'center' as const,
  },
  login: {
    backgroundColor: '#667eea',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    textDecoration: 'none',
    textAlign: 'center' as const,
    width: '100%',
  },
  register: {
    backgroundColor: '#10b981',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    textDecoration: 'none',
    textAlign: 'center' as const,
    width: '100%',
  },
  profile: {
    color: '#333',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    textAlign: 'center' as const,
    width: '100%',
  },
  logout: {
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'center' as const,
    width: '100%',
  },
  separator: {
    height: '1px',
    backgroundColor: '#f0f0f0',
    margin: '0.5rem 0',
  },
}

// Desktop uchun maxsus stillar (768px dan katta ekranlarda)
if (typeof window !== 'undefined' && window.innerWidth > 768) {
  styles.menu = {
    display: 'flex',
    flexDirection: 'row' as const,
    width: 'auto',
    backgroundColor: 'transparent',
    padding: 0,
    gap: '1.5rem',
    borderTop: 'none',
    marginTop: 0,
  }
  styles.burger = {
    ...styles.burger,
    display: 'none',
  }
  styles.link = {
    ...styles.link,
    width: 'auto',
  }
  styles.login = {
    ...styles.login,
    width: 'auto',
  }
  styles.register = {
    ...styles.register,
    width: 'auto',
  }
  styles.profile = {
    ...styles.profile,
    width: 'auto',
  }
  styles.logout = {
    ...styles.logout,
    width: 'auto',
  }
}
