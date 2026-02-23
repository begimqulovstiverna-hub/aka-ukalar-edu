import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

export default function Navbar() {
  const { data: session } = useSession()

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        {/* Logo */}
        <Link href="/" style={styles.logo}>
          AKA·UKALAR
        </Link>

        {/* Linklar */}
        <div style={styles.links}>
          <Link href="/" style={styles.link}>Bosh sahifa</Link>
          <Link href="/courses" style={styles.link}>Kurslar</Link>
          <Link href="/schedule" style={styles.link}>Dars jadvali</Link>
          <Link href="/forum" style={styles.link}>Forum</Link>
          <Link href="/groups" style={styles.link}>Guruhlar</Link>
        </div>

        {/* Tugmalar */}
        <div style={styles.buttons}>
          {!session ? (
            <>
              <Link href="/login" style={styles.login}>Kirish</Link>
              <Link href="/register" style={styles.register}>Ro'yxat</Link>
            </>
          ) : (
            <>
              <Link href="/profile" style={styles.profile}>
                {session.user?.name}
              </Link>
              <button onClick={() => signOut()} style={styles.logout}>
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
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
    padding: '1rem 2rem',
    position: 'sticky' as const,
    top: 0,
    zIndex: 50,
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#2563eb',
    textDecoration: 'none',
  },
  links: {
    display: 'flex',
    gap: '1.5rem',
  },
  link: {
    color: '#374151',
    textDecoration: 'none',
    fontSize: '1rem',
  },
  buttons: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  login: {
    padding: '0.5rem 1rem',
    backgroundColor: '#2563eb',
    color: 'white',
    borderRadius: '0.375rem',
    textDecoration: 'none',
  },
  register: {
    padding: '0.5rem 1rem',
    backgroundColor: '#10b981',
    color: 'white',
    borderRadius: '0.375rem',
    textDecoration: 'none',
  },
  profile: {
    color: '#374151',
    textDecoration: 'none',
  },
  logout: {
    padding: '0.5rem 1rem',
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
  },
}
