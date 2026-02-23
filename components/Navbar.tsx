import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'

export default function Navbar() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link href="/" className="logo">
          AKA·UKALAR
        </Link>

        <div className="desktop-menu">
          <Link href="/" className="nav-link">Bosh sahifa</Link>
          <Link href="/courses" className="nav-link">Kurslar</Link>
          <Link href="/schedule" className="nav-link">Dars jadvali</Link>
          <Link href="/forum" className="nav-link">Forum</Link>
          <Link href="/groups" className="nav-link">Guruhlar</Link>
        </div>

        <div className="user-desktop">
          {!session ? (
            <>
              <Link href="/login" className="login-btn">Kirish</Link>
              <Link href="/register" className="register-btn">Ro'yxat</Link>
            </>
          ) : (
            <>
              <Link href="/profile" className="profile-link">{session.user?.name}</Link>
              <button onClick={() => signOut()} className="logout-btn">Chiqish</button>
            </>
          )}
        </div>

        <button className="burger" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          <Link href="/" className="mobile-link" onClick={() => setMenuOpen(false)}>Bosh sahifa</Link>
          <Link href="/courses" className="mobile-link" onClick={() => setMenuOpen(false)}>Kurslar</Link>
          <Link href="/schedule" className="mobile-link" onClick={() => setMenuOpen(false)}>Dars jadvali</Link>
          <Link href="/forum" className="mobile-link" onClick={() => setMenuOpen(false)}>Forum</Link>
          <Link href="/groups" className="mobile-link" onClick={() => setMenuOpen(false)}>Guruhlar</Link>
          <div className="mobile-user">
            {!session ? (
              <>
                <Link href="/login" className="mobile-login" onClick={() => setMenuOpen(false)}>Kirish</Link>
                <Link href="/register" className="mobile-register" onClick={() => setMenuOpen(false)}>Ro'yxat</Link>
              </>
            ) : (
              <>
                <Link href="/profile" className="mobile-profile" onClick={() => setMenuOpen(false)}>{session.user?.name}</Link>
                <button onClick={() => { signOut(); setMenuOpen(false); }} className="mobile-logout">Chiqish</button>
              </>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .navbar {
          background-color: white;
          border-bottom: 1px solid #e5e7eb;
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo {
          font-size: 1.5rem;
          font-weight: bold;
          color: #2563eb;
          text-decoration: none;
        }
        .desktop-menu {
          display: flex;
          gap: 1.5rem;
        }
        .nav-link {
          color: #374151;
          text-decoration: none;
          font-size: 1rem;
        }
        .user-desktop {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        .login-btn {
          padding: 0.5rem 1rem;
          background-color: #2563eb;
          color: white;
          border-radius: 0.375rem;
          text-decoration: none;
        }
        .register-btn {
          padding: 0.5rem 1rem;
          background-color: #10b981;
          color: white;
          border-radius: 0.375rem;
          text-decoration: none;
        }
        .profile-link {
          color: #374151;
          text-decoration: none;
        }
        .logout-btn {
          padding: 0.5rem 1rem;
          background-color: #dc2626;
          color: white;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
        }
        .burger {
          display: none;
          background: none;
          border: 1px solid #d1d5db;
          font-size: 1.5rem;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          cursor: pointer;
        }
        .mobile-menu {
          display: none;
          flex-direction: column;
          padding: 1rem;
          border-top: 1px solid #e5e7eb;
          background-color: white;
        }
        .mobile-link {
          padding: 0.75rem;
          color: #374151;
          text-decoration: none;
          border-bottom: 1px solid #f3f4f6;
          text-align: center;
        }
        .mobile-user {
          margin-top: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .mobile-login {
          padding: 0.75rem;
          background-color: #2563eb;
          color: white;
          text-decoration: none;
          border-radius: 0.375rem;
          text-align: center;
        }
        .mobile-register {
          padding: 0.75rem;
          background-color: #10b981;
          color: white;
          text-decoration: none;
          border-radius: 0.375rem;
          text-align: center;
        }
        .mobile-profile {
          padding: 0.75rem;
          color: #374151;
          text-decoration: none;
          background-color: #f9fafb;
          border-radius: 0.375rem;
          text-align: center;
        }
        .mobile-logout {
          padding: 0.75rem;
          background-color: #dc2626;
          color: white;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
        }
        @media (max-width: 768px) {
          .desktop-menu {
            display: none;
          }
          .user-desktop {
            display: none;
          }
          .burger {
            display: block;
          }
          .mobile-menu {
            display: flex;
          }
        }
      `}</style>
    </nav>
  )
}
