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

  return (
    <>
      {/* Overlay (menyu ochiq bo‘lganda fonni xiralashtirish) */}
      {menuOpen && <div className="overlay" onClick={closeMenu} />}

      <nav className="navbar">
        <div className="nav-container">
          {/* Logo */}
          <Link href="/" className="logo" onClick={closeMenu}>
            <span className="logo-main">AKA·UKALAR</span>
            <span className="logo-sub">O‘QUV MARKAZI</span>
          </Link>

          {/* Desktop menyu */}
          <div className="desktop-menu">
            <div className="nav-links">
              <Link href="/" className="nav-link" onClick={closeMenu}>Bosh sahifa</Link>
              <Link href="/courses" className="nav-link" onClick={closeMenu}>Kurslar</Link>
              <Link href="/schedule" className="nav-link" onClick={closeMenu}>Dars jadvali</Link>
              <Link href="/forum" className="nav-link" onClick={closeMenu}>Forum</Link>
              <Link href="/groups" className="nav-link" onClick={closeMenu}>Guruhlar</Link>
            </div>

            <div className="auth-section">
              {mounted && (
                <button onClick={toggleTheme} className="theme-toggle">
                  {theme === 'dark' ? '☀️' : '🌙'}
                </button>
              )}
              {!session ? (
                <>
                  <Link href="/login" className="btn btn-login">Kirish</Link>
                  <Link href="/register" className="btn btn-register">Ro'yxat</Link>
                </>
              ) : (
                <div className="user-menu">
                  <Link href="/profile" className="profile-link">
                    <div className="avatar">
                      {(session.user as any)?.image ? (
                        <img src={(session.user as any).image} alt={session.user.name || ''} className="avatar-img" />
                      ) : (
                        <div className="avatar-placeholder">
                          {session.user?.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="user-name">{session.user?.name}</span>
                  </Link>
                  <button onClick={() => signOut()} className="btn btn-logout">
                    Chiqish
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Burger tugmasi (mobil) */}
          <button
            className={`burger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span className="burger-line"></span>
            <span className="burger-line"></span>
            <span className="burger-line"></span>
          </button>
        </div>

        {/* Mobil menyu (ochiladigan) */}
        <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
          <div className="mobile-nav-links">
            <Link href="/" className="mobile-nav-link" onClick={closeMenu}>Bosh sahifa</Link>
            <Link href="/courses" className="mobile-nav-link" onClick={closeMenu}>Kurslar</Link>
            <Link href="/schedule" className="mobile-nav-link" onClick={closeMenu}>Dars jadvali</Link>
            <Link href="/forum" className="mobile-nav-link" onClick={closeMenu}>Forum</Link>
            <Link href="/groups" className="mobile-nav-link" onClick={closeMenu}>Guruhlar</Link>
          </div>

          <div className="mobile-auth">
            {!session ? (
              <div className="mobile-buttons">
                <Link href="/login" className="btn mobile-btn mobile-login" onClick={closeMenu}>Kirish</Link>
                <Link href="/register" className="btn mobile-btn mobile-register" onClick={closeMenu}>Ro'yxat</Link>
              </div>
            ) : (
              <div className="mobile-user">
                <Link href="/profile" className="mobile-profile-link" onClick={closeMenu}>
                  <div className="mobile-avatar">
                    {(session.user as any)?.image ? (
                      <img src={(session.user as any).image} alt={session.user.name || ''} className="avatar-img" />
                    ) : (
                      <div className="avatar-placeholder">
                        {session.user?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span>{session.user?.name}</span>
                </Link>
                <button onClick={() => { signOut(); closeMenu(); }} className="btn mobile-btn mobile-logout">
                  Chiqish
                </button>
              </div>
            )}
          </div>

          {mounted && (
            <button onClick={toggleTheme} className="mobile-theme-toggle">
              {theme === 'dark' ? '☀️ Kunduzgi rejim' : '🌙 Tungi rejim'}
            </button>
          )}
        </div>
      </nav>

      <style jsx>{`
        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(5px);
          z-index: 40;
          transition: opacity 0.3s ease;
        }

        .navbar {
          background: var(--nav-bg);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--border-color);
          position: sticky;
          top: 0;
          z-index: 50;
          transition: background 0.3s, border-color 0.3s;
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0.5rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 80px;
        }

        /* Logo */
        .logo {
          text-decoration: none;
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }

        .logo-main {
          font-size: 1.8rem;
          font-weight: 800;
          letter-spacing: 2px;
          background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .logo-sub {
          font-size: 0.8rem;
          font-weight: 400;
          color: var(--text-secondary);
          letter-spacing: 1px;
        }

        /* Desktop menyu */
        .desktop-menu {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .nav-links {
          display: flex;
          gap: 1rem;
        }

        .nav-link {
          padding: 0.5rem 1rem;
          color: var(--text-primary);
          text-decoration: none;
          font-size: 1rem;
          border-radius: 30px;
          transition: all 0.2s;
        }

        .nav-link:hover {
          background: rgba(139, 92, 246, 0.1);
        }

        .auth-section {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .theme-toggle {
          background: none;
          border: 1px solid var(--border-color);
          font-size: 1.2rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-primary);
          transition: all 0.2s;
        }

        .theme-toggle:hover {
          background: var(--card-bg);
        }

        .btn {
          padding: 0.5rem 1.5rem;
          border: none;
          border-radius: 30px;
          font-size: 0.9rem;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
        }

        .btn-login {
          background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);
          color: white;
        }

        .btn-register {
          background: #10b981;
          color: white;
        }

        .btn-logout {
          background: #dc2626;
          color: white;
          border: none;
          cursor: pointer;
        }

        .user-menu {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .profile-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          color: var(--text-primary);
        }

        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          overflow: hidden;
          background: #8B5CF6;
        }

        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1rem;
          font-weight: bold;
        }

        .user-name {
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        /* Burger */
        .burger {
          display: none;
          flex-direction: column;
          justify-content: space-around;
          width: 30px;
          height: 30px;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          z-index: 10;
        }

        .burger-line {
          width: 30px;
          height: 3px;
          background: var(--text-primary);
          border-radius: 3px;
          transition: all 0.3s;
        }

        .burger.open .burger-line:nth-child(1) {
          transform: rotate(45deg) translate(5px, 5px);
        }

        .burger.open .burger-line:nth-child(2) {
          opacity: 0;
        }

        .burger.open .burger-line:nth-child(3) {
          transform: rotate(-45deg) translate(7px, -6px);
        }

        /* Mobil menyu */
        .mobile-menu {
          display: none;
          flex-direction: column;
          position: absolute;
          top: 80px;
          left: 0;
          right: 0;
          background: var(--nav-bg);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--border-color);
          padding: 1rem;
          gap: 1rem;
          z-index: 45;
          transform: translateY(-10px);
          opacity: 0;
          transition: all 0.3s ease;
          pointer-events: none;
        }

        .mobile-menu.open {
          transform: translateY(0);
          opacity: 1;
          pointer-events: auto;
        }

        .mobile-nav-links {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .mobile-nav-link {
          padding: 0.75rem 1rem;
          color: var(--text-primary);
          text-decoration: none;
          font-size: 1rem;
          border-radius: 8px;
          background: var(--card-bg);
          text-align: center;
          transition: all 0.2s;
        }

        .mobile-nav-link:hover {
          background: rgba(139, 92, 246, 0.1);
        }

        .mobile-auth {
          margin-top: 0.5rem;
          padding-top: 0.5rem;
          border-top: 1px solid var(--border-color);
        }

        .mobile-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .mobile-btn {
          width: 100%;
          padding: 0.75rem;
          text-align: center;
        }

        .mobile-login {
          background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);
          color: white;
        }

        .mobile-register {
          background: #10b981;
          color: white;
        }

        .mobile-logout {
          background: #dc2626;
          color: white;
        }

        .mobile-user {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .mobile-profile-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          text-decoration: none;
          color: var(--text-primary);
          background: var(--card-bg);
          border-radius: 8px;
        }

        .mobile-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;
          background: #8B5CF6;
        }

        .mobile-theme-toggle {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          background: none;
          color: var(--text-primary);
          font-size: 0.9rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        /* Media query: mobil */
        @media (max-width: 768px) {
          .desktop-menu {
            display: none;
          }

          .burger {
            display: flex;
          }

          .mobile-menu {
            display: flex;
          }
        }
      `}</style>
    </>
  )
}
