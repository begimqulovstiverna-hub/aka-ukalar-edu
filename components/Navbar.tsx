import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    // Ekran o‘lchamini aniqlash
    if (typeof window !== 'undefined') {
      const checkScreen = () => setIsDesktop(window.innerWidth > 768)
      checkScreen()
      window.addEventListener('resize', checkScreen)
      return () => window.removeEventListener('resize', checkScreen)
    }
  }, [])

  const closeMenu = () => setMenuOpen(false)

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        {/* Logo */}
        <Link href="/" style={styles.logo} onClick={closeMenu}>
          AKA·UKALAR
        </Link>

        {/* Burger tugmasi - desktopda ko‘rinmaydi, mobilda ko‘rinadi */}
        {!isDesktop && (
          <button
            style={{
              ...styles.burger,
              ...(menuOpen ? styles.burgerOpen : {}),
            }}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span style={styles.burgerLine}></span>
            <span style={styles.burgerLine}></span>
            <span style={styles.burgerLine}></span>
          </button>
        )}

        {/* Menyu - desktopda doim ko‘rinadi, mobilda faqat ochiq bo‘lsa */}
        <div
          style={{
            ...styles.menu,
            ...(isDesktop
              ? { display: 'flex' }
              : menuOpen
              ? { display: 'flex' }
              : { display: 'none' }),
          }}
        >
          <Link href="/" style={styles.link} onClick={closeMenu}>
            Bosh sahifa
          </Link>
          <Link href="/courses" style={styles.link} onClick={closeMenu}>
            Kurslar
          </Link>
          <Link href="/schedule" style={styles.link} onClick={closeMenu}>
            Dars jadvali
          </Link>
          <Link href="/forum" style={styles.link} onClick={closeMenu}>
            Forum
          </Link>
          <Link href="/groups" style={styles.link} onClick={closeMenu}>
            Guruhlar
          </Link>

          <div style={styles.separator}></div>

          {!session ? (
            <>
              <Link href="/login" style={styles.login} onClick={closeMenu}>
                Kirish
              </Link>
              <Link href="/register" style={styles.register} onClick={closeMenu}>
                Ro'yxat
              </Link>
            </>
          ) : (
            <>
              <Link href="/profile" style={styles.profile} onClick={closeMenu}>
                {session.user?.name}
              </Link>
              <button
                onClick={() => {
                  signOut()
                  closeMenu()
                }}
                style={styles.logout}
              >
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
  burgerOpen: {
    // Animatsiya uchun (kerak bo‘lsa qo‘shishingiz mumkin)
  },
  menu: {
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: '1.5rem',
    width: 'auto',
    backgroundColor: 'transparent',
    padding: 0,
    marginTop: 0,
  },
  link: {
    color: '#333',
    textDecoration: 'none',
    fontSize: '1rem',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    transition: 'background 0.2s',
    whiteSpace: 'nowrap' as const,
  },
  separator: {
    width: '1px',
    height: '30px',
    background: '#e0e0e0',
    margin: '0 0.5rem',
  },
  login: {
    padding: '0.5rem 1.5rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '500',
    whiteSpace: 'nowrap' as const,
  },
  register: {
    padding: '0.5rem 1.5rem',
    background: '#10b981',
    color: 'white',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '500',
    whiteSpace: 'nowrap' as const,
  },
  profile: {
    color: '#333',
    textDecoration: 'none',
    fontSize: '1rem',
    whiteSpace: 'nowrap' as const,
  },
  logout: {
    padding: '0.5rem 1.5rem',
    background: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    whiteSpace: 'nowrap' as const,
  },
}
