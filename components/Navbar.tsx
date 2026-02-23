import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'

export default function Navbar() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          {/* Logo */}
          <Link href="/" className="logo" onClick={closeMenu}>
            AKA·UKALAR
          </Link>

          {/* Burger tugmasi */}
          <button
            className={`burger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Navigatsiya linklari */}
          <div className={`nav-menu ${menuOpen ? 'open' : ''}`}>
            <Link href="/" className="nav-link" onClick={closeMenu}>Bosh sahifa</Link>
            <Link href="/courses" className="nav-link" onClick={closeMenu}>Kurslar</Link>
            <Link href="/schedule" className="nav-link" onClick={closeMenu}>Dars jadvali</Link>
            <Link href="/forum" className="nav-link" onClick={closeMenu}>Forum</Link>
            <Link href="/groups" className="nav-link" onClick={closeMenu}>Guruhlar</Link>

            <div className="separator"></div>

            {!session ? (
              <>
                <Link href="/login" className="btn login" onClick={closeMenu}>Kirish</Link>
                <Link href="/register" className="btn register" onClick={closeMenu}>Ro'yxat</Link>
              </>
            ) : (
              <>
                <Link href="/profile" className="profile-link" onClick={closeMenu}>
                  {session.user?.name}
                </Link>
                <button onClick={() => { signOut(); closeMenu(); }} className="btn logout">
                  Chiqish
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <style jsx>{`
        .navbar {
          background: white;
          border-bottom: 2px solid #f0f0f0;
          padding: 0.5rem 2rem;
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
        }
        .logo {
          font-size: 1.8rem;
          font-weight: bold;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-decoration: none;
          padding: 0.5rem 0;
        }
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
          z-index: 1001;
        }
        .burger span {
          width: 30px;
          height: 3px;
          background: #333;
          border-radius: 3px;
          transition: all 0.3s;
        }
        .burger.open span:nth-child(1) {
          transform: rotate(45deg) translate(5px, 5px);
        }
        .burger.open span:nth-child(2) {
          opacity: 0;
        }
        .burger.open span:nth-child(3) {
          transform: rotate(-45deg) translate(7px, -6px);
        }
        .nav-menu {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .nav-link {
          color: #333;
          text-decoration: none;
          font-size: 1rem;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          transition: background 0.2s;
        }
        .nav-link:hover {
          background: #f0f0f0;
        }
        .separator {
          width: 1px;
          height: 30px;
          background: #e0e0e0;
          margin: 0 0.5rem;
        }
        .btn {
          padding: 0.5rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
        }
        .login {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .register {
          background: #10b981;
          color: white;
        }
        .logout {
          background: #dc2626;
          color: white;
        }
        .profile-link {
          color: #333;
          text-decoration: none;
          font-size: 1rem;
        }
        @media (max-width: 768px) {
          .burger {
            display: flex;
          }
          .nav-menu {
            display: none;
            flex-direction: column;
            width: 100%;
            background: white;
            padding: 1rem 0;
            gap: 0.75rem;
            border-top: 1px solid #f0f0f0;
            margin-top: 0.5rem;
          }
          .nav-menu.open {
            display: flex;
          }
          .nav-link {
            width: 100%;
            text-align: center;
          }
          .separator {
            width: 100%;
            height: 1px;
            margin: 0.5rem 0;
          }
          .btn, .profile-link {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </>
  )
}
