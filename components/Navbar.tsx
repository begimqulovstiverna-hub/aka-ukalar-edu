import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => setMounted(true), [])

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const closeMenu = () => setMenuOpen(false)

  // Menyu ochiq bo'lganda scrollni oldini olish
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [menuOpen])

  return (
    <>
      {/* Overlay (menyu ochiq bo'lganda orqa fonni xiralashtirish) */}
      {menuOpen && (
        <div
          onClick={closeMenu}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(5px)',
            zIndex: 40,
            transition: 'all 0.3s ease',
          }}
        />
      )}

      <nav style={{
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        transition: 'background 0.3s ease',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0.5rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '80px',
          position: 'relative',
        }}>
          {/* Logotip */}
          <Link href="/" style={{ textDecoration: 'none' }} onClick={closeMenu}>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
              <span style={{
                fontSize: '1.8rem',
                fontWeight: '800',
                letterSpacing: '2px',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>AKA·UKALAR</span>
              <span style={{
                fontSize: '0.8rem',
                fontWeight: '400',
                color: 'var(--text-secondary)',
                letterSpacing: '1px',
              }}>O‘QUV MARKAZI</span>
            </div>
          </Link>

          {/* Desktop menyu (katta ekranlar uchun) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            '@media (max-width: 768px)': {
              display: 'none',
            }
          }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link href="/" style={navLinkStyle}>Bosh sahifa</Link>
              <Link href="/courses" style={navLinkStyle}>Kurslar</Link>
              <Link href="/schedule" style={navLinkStyle}>Dars jadvali</Link>
              <Link href="/forum" style={navLinkStyle}>Forum</Link>
              <Link href="/groups" style={navLinkStyle}>Guruhlar</Link>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {mounted && (
                <button onClick={toggleTheme} style={themeToggleStyle}>
                  {theme === 'dark' ? '☀️' : '🌙'}
                </button>
              )}
              {!session ? (
                <>
                  <Link href="/login" style={loginButtonStyle}>Kirish</Link>
                  <Link href="/register" style={registerButtonStyle}>Ro'yxat</Link>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Link href="/profile" style={profileLinkStyle}>
                    <div style={avatarContainerStyle}>
                      {(session.user as any)?.image ? (
                        <img src={(session.user as any).image} alt={session.user.name || ''} style={avatarStyle} />
                      ) : (
                        <div style={avatarPlaceholderStyle}>
                          {session.user?.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: '0.95rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                      {session.user?.name}
                    </span>
                  </Link>
                  <button onClick={() => signOut()} style={logoutButtonStyle}>
                    Chiqish
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Burger tugmasi (faqat mobil) */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              fontSize: '2rem',
              cursor: 'pointer',
              padding: '0.5rem',
              color: 'var(--text-primary)',
              '@media (max-width: 768px)': {
                display: 'block',
              }
            }}
            aria-label="Menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobil menyu (ochiladigan) */}
        <div style={{
          display: menuOpen ? 'flex' : 'none',
          flexDirection: 'column',
          position: 'absolute',
          top: '80px',
          left: 0,
          right: 0,
          background: 'var(--nav-bg)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid var(--border-color)',
          padding: '1rem',
          gap: '1rem',
          zIndex: 45,
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          animation: menuOpen ? 'slideDown 0.3s ease' : 'none',
        }}>
          {/* Mobil linklar */}
          <Link href="/" style={{...mobileLinkStyle}} onClick={closeMenu}>Bosh sahifa</Link>
          <Link href="/courses" style={mobileLinkStyle} onClick={closeMenu}>Kurslar</Link>
          <Link href="/schedule" style={mobileLinkStyle} onClick={closeMenu}>Dars jadvali</Link>
          <Link href="/forum" style={mobileLinkStyle} onClick={closeMenu}>Forum</Link>
          <Link href="/groups" style={mobileLinkStyle} onClick={closeMenu}>Guruhlar</Link>

          {/* Mobil foydalanuvchi qismi */}
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            {!session ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link href="/login" style={{...mobileButtonStyle, background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)'}} onClick={closeMenu}>
                  Kirish
                </Link>
                <Link href="/register" style={{...mobileButtonStyle, background: '#10b981'}} onClick={closeMenu}>
                  Ro'yxat
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link href="/profile" style={{...mobileLinkStyle, display: 'flex', alignItems: 'center', gap: '0.5rem'}} onClick={closeMenu}>
                  <div style={{...avatarContainerStyle, width: '40px', height: '40px'}}>
                    {(session.user as any)?.image ? (
                      <img src={(session.user as any).image} alt={session.user.name || ''} style={avatarStyle} />
                    ) : (
                      <div style={avatarPlaceholderStyle}>
                        {session.user?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: '1rem', fontWeight: '500' }}>{session.user?.name}</span>
                </Link>
                <button onClick={() => { signOut(); closeMenu(); }} style={{...mobileButtonStyle, background: '#dc2626', border: 'none'}}>
                  Chiqish
                </button>
              </div>
            )}
          </div>

          {/* Mobil tungi rejim tugmasi */}
          {mounted && (
            <button onClick={toggleTheme} style={{
              ...mobileButtonStyle,
              background: 'none',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}>
              {theme === 'dark' ? '☀️ Kunduzgi rejim' : '🌙 Tungi rejim'}
            </button>
          )}
        </div>
      </nav>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  )
}

// Stillar
const navLinkStyle = {
  padding: '0.5rem 1rem',
  color: 'var(--text-primary)',
  textDecoration: 'none',
  fontSize: '1rem',
  borderRadius: '30px',
  transition: 'all 0.2s',
}

const mobileLinkStyle = {
  padding: '0.75rem 1rem',
  color: 'var(--text-primary)',
  textDecoration: 'none',
  fontSize: '1rem',
  borderRadius: '8px',
  backgroundColor: 'var(--card-bg)',
  transition: 'all 0.2s',
  width: '100%',
  textAlign: 'center' as const,
}

const themeToggleStyle = {
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
  color: 'var(--text-primary)',
}

const loginButtonStyle = {
  padding: '0.5rem 1.5rem',
  background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
  border: 'none',
  borderRadius: '30px',
  color: 'white',
  fontSize: '0.9rem',
  textDecoration: 'none',
  cursor: 'pointer',
}

const registerButtonStyle = {
  padding: '0.5rem 1.5rem',
  background: '#10b981',
  border: 'none',
  borderRadius: '30px',
  color: 'white',
  fontSize: '0.9rem',
  textDecoration: 'none',
  cursor: 'pointer',
}

const logoutButtonStyle = {
  padding: '0.5rem 1rem',
  background: '#dc2626',
  border: 'none',
  borderRadius: '30px',
  color: 'white',
  fontSize: '0.9rem',
  cursor: 'pointer',
}

const profileLinkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  textDecoration: 'none',
  color: 'var(--text-primary)',
}

const avatarContainerStyle = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  overflow: 'hidden',
  background: '#8B5CF6',
}

const avatarStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover' as const,
}

const avatarPlaceholderStyle = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontSize: '1rem',
  fontWeight: 'bold',
}

const mobileButtonStyle = {
  padding: '0.75rem 1rem',
  borderRadius: '8px',
  color: 'white',
  textDecoration: 'none',
  fontSize: '0.9rem',
  cursor: 'pointer',
  width: '100%',
  textAlign: 'center' as const,
}
