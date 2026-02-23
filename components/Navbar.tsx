import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

export default function Navbar() {
  const { data: session } = useSession()

  return (
    <nav style={navStyle}>
      <div style={containerStyle}>
        {/* Logo */}
        <Link href="/" style={logoStyle}>
          AKA·UKALAR
        </Link>

        {/* Linklar */}
        <div style={linksStyle}>
          <Link href="/" style={linkStyle}>Bosh sahifa</Link>
          <Link href="/courses" style={linkStyle}>Kurslar</Link>
          <Link href="/schedule" style={linkStyle}>Dars jadvali</Link>
          <Link href="/forum" style={linkStyle}>Forum</Link>
          <Link href="/groups" style={linkStyle}>Guruhlar</Link>
        </div>

        {/* Foydalanuvchi qismi */}
        <div style={userStyle}>
          {!session ? (
            <>
              <Link href="/login" style={loginStyle}>Kirish</Link>
              <Link href="/register" style={registerStyle}>Ro'yxat</Link>
            </>
          ) : (
            <>
              <Link href="/profile" style={profileStyle}>
                {session.user?.name}
              </Link>
              <button onClick={() => signOut()} style={logoutStyle}>
                Chiqish
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

/* Stillar */
const navStyle = {
  backgroundColor: 'white',
  borderBottom: '1px solid #e5e7eb',
  padding: '1rem 2rem',
  position: 'sticky' as const,
  top: 0,
  zIndex: 50,
}

const containerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}

const logoStyle = {
  fontSize: '1.5rem',
  fontWeight: 'bold',
  color: '#2563eb',
  textDecoration: 'none',
}

const linksStyle = {
  display: 'flex',
  gap: '1.5rem',
}

const linkStyle = {
  color: '#374151',
  textDecoration: 'none',
  fontSize: '1rem',
}

const userStyle = {
  display: 'flex',
  gap: '1rem',
  alignItems: 'center',
}

const loginStyle = {
  padding: '0.5rem 1rem',
  backgroundColor: '#2563eb',
  color: 'white',
  borderRadius: '0.375rem',
  textDecoration: 'none',
}

const registerStyle = {
  padding: '0.5rem 1rem',
  backgroundColor: '#10b981',
  color: 'white',
  borderRadius: '0.375rem',
  textDecoration: 'none',
}

const profileStyle = {
  color: '#374151',
  textDecoration: 'none',
  fontSize: '1rem',
}

const logoutStyle = {
  padding: '0.5rem 1rem',
  backgroundColor: '#dc2626',
  color: 'white',
  border: 'none',
  borderRadius: '0.375rem',
  cursor: 'pointer',
}
