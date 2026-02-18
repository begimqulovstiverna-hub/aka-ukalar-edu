import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

export default function Home() {
  const { data: session } = useSession()

  return (
    <div style={styles.container}>
      {/* Navigatsiya */}
      <nav style={styles.nav}>
        <div style={styles.navContent}>
          <Link href="/" style={styles.logo}>
            aka-ukalar
          </Link>

          <div style={styles.navLinks}>
            <Link href="/" style={styles.navLink}>Bosh sahifa</Link>
            <Link href="/courses" style={styles.navLink}>Kurslar</Link>
            <Link href="/schedule" style={styles.navLink}>Dars jadvali</Link>
            <Link href="/forum" style={styles.navLink}>Forum</Link>
            <Link href="/groups" style={styles.navLink}>Guruhlar</Link>
          </div>

          <div style={styles.authButtons}>
            {!session ? (
              <>
                <Link href="/login" style={styles.loginButton}>Kirish</Link>
                <Link href="/register" style={styles.registerButton}>Ro'yxat</Link>
              </>
            ) : (
              <div style={styles.userMenu}>
                <Link href="/profile" style={styles.profileLink}>
                  <div style={styles.avatarContainer}>
                    {session.user?.image ? (
                      <img src={session.user.image} alt={session.user.name || ''} style={styles.avatar} />
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

      <main style={styles.main}>
        {/* Sarlavha */}
        <div style={styles.header}>
          <h1 style={styles.title}>AKA-UKALAR</h1>
          <p style={styles.subtitle}>O'QUV MARKAZI</p>
          <p style={styles.floor}>3-QAVAT</p>
          <p style={styles.description}>
            Professional ta'lim, zamonaviy yondashuv va sifatli bilim
          </p>
        </div>

        {/* Statistika */}
        <div style={styles.stats}>
          <div style={styles.statItem}>
            <div style={{ ...styles.statNumber, color: '#2563eb' }}>50+</div>
            <div style={styles.statLabel}>Video darslar</div>
          </div>
          <div style={styles.statItem}>
            <div style={{ ...styles.statNumber, color: '#16a34a' }}>100+</div>
            <div style={styles.statLabel}>O'quvchilar</div>
          </div>
          <div style={styles.statItem}>
            <div style={{ ...styles.statNumber, color: '#9333ea' }}>15+</div>
            <div style={styles.statLabel}>Mutaxassislar</div>
          </div>
          <div style={styles.statItem}>
            <div style={{ ...styles.statNumber, color: '#ea580c' }}>24/7</div>
            <div style={styles.statLabel}>Qo'llab-quvvatlash</div>
          </div>
        </div>

        {/* Kartochkalar */}
        <div style={styles.cards}>
          {/* Kurslar */}
          <Link href="/courses" style={styles.card}>
            <div style={{ ...styles.cardIcon, backgroundColor: '#dbeafe' }}>
              <span style={{ ...styles.cardIconText, color: '#2563eb' }}>📚</span>
            </div>
            <h3 style={styles.cardTitle}>Kurslar</h3>
            <p style={styles.cardText}>
              Frontend, backend, mobile va boshqa yo'nalishlar
            </p>
            <div style={{ ...styles.cardButton, color: '#2563eb' }}>
              Batafsil →
            </div>
          </Link>

          {/* Dars jadvali */}
          <Link href="/schedule" style={styles.card}>
            <div style={{ ...styles.cardIcon, backgroundColor: '#dcfce7' }}>
              <span style={{ ...styles.cardIconText, color: '#16a34a' }}>📅</span>
            </div>
            <h3 style={styles.cardTitle}>Dars jadvali</h3>
            <p style={styles.cardText}>
              Kunlik va haftalik dars vaqtlari
            </p>
            <div style={{ ...styles.cardButton, color: '#16a34a' }}>
              Jadval →
            </div>
          </Link>

          {/* Forum */}
          <Link href="/forum" style={styles.card}>
            <div style={{ ...styles.cardIcon, backgroundColor: '#f3e8ff' }}>
              <span style={{ ...styles.cardIconText, color: '#9333ea' }}>💬</span>
            </div>
            <h3 style={styles.cardTitle}>Forum</h3>
            <p style={styles.cardText}>
              Savol-javoblar va muhokamalar
            </p>
            <div style={{ ...styles.cardButton, color: '#9333ea' }}>
              Forum →
            </div>
          </Link>

          {/* Guruhlar */}
          <Link href="/groups" style={styles.card}>
            <div style={{ ...styles.cardIcon, backgroundColor: '#fef3c7' }}>
              <span style={{ ...styles.cardIconText, color: '#d97706' }}>👥</span>
            </div>
            <h3 style={styles.cardTitle}>Guruhlar</h3>
            <p style={styles.cardText}>
              Qiziqishlar bo'yicha guruhlar va muloqot
            </p>
            <div style={{ ...styles.cardButton, color: '#d97706' }}>
              Guruhlar →
            </div>
          </Link>
        </div>

        {/* Qo'shimcha ma'lumot */}
        <div style={styles.features}>
          <h3 style={styles.featuresTitle}>Nima uchun aynan biz?</h3>
          <div style={styles.featuresGrid}>
            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>🎯</div>
              <p style={styles.featureText}>Amaliy yondashuv</p>
            </div>
            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>⏱️</div>
              <p style={styles.featureText}>Moslashuvchan vaqt</p>
            </div>
            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>👥</div>
              <p style={styles.featureText}>Kichik guruhlar</p>
            </div>
            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>🏆</div>
              <p style={styles.featureText}>Sertifikat</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 50%, #f5f3ff 100%)',
    fontFamily: 'sans-serif'
  },
  nav: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(8px)',
    position: 'sticky' as const,
    top: 0,
    zIndex: 50,
    borderBottom: '1px solid #e5e7eb'
  },
  navContent: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '80px'
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1f2937',
    textDecoration: 'none'
  },
  navLinks: {
    display: 'flex',
    gap: '1rem'
  },
  navLink: {
    padding: '0.5rem 1rem',
    color: '#4b5563',
    fontSize: '1rem',
    fontWeight: '500',
    textDecoration: 'none',
    transition: 'color 0.2s'
  },
  authButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  loginButton: {
    padding: '0.5rem 1rem',
    border: '1px solid #d1d5db',
    color: '#1f2937',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    textDecoration: 'none'
  },
  registerButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#2563eb',
    color: 'white',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    textDecoration: 'none'
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
    color: '#1f2937'
  },
  avatarContainer: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    overflow: 'hidden',
    background: '#2563eb'
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
    fontWeight: '500'
  },
  logoutButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer'
  },
  main: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '5rem 1rem'
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '4rem'
  },
  title: {
    fontSize: '4rem',
    fontWeight: 'bold',
    color: '#111827',
    margin: 0
  },
  subtitle: {
    fontSize: '2rem',
    color: '#2563eb',
    fontWeight: '600',
    margin: 0
  },
  floor: {
    fontSize: '1.25rem',
    color: '#6b7280',
    margin: 0
  },
  description: {
    fontSize: '1.25rem',
    color: '#4b5563',
    maxWidth: '48rem',
    margin: '1.5rem auto 0'
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1.5rem',
    maxWidth: '64rem',
    margin: '0 auto 5rem'
  },
  statItem: {
    textAlign: 'center' as const,
    padding: '1.5rem',
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem'
  },
  statLabel: {
    color: '#6b7280'
  },
  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '2rem',
    maxWidth: '72rem',
    margin: '0 auto 5rem'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '1rem',
    padding: '2rem',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    transition: 'box-shadow 0.3s, transform 0.3s',
    cursor: 'pointer',
    textDecoration: 'none',
    color: 'inherit',
    display: 'block'
  },
  cardIcon: {
    width: '3.5rem',
    height: '3.5rem',
    borderRadius: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.5rem'
  },
  cardIconText: {
    fontSize: '2rem'
  },
  cardTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '0.75rem'
  },
  cardText: {
    color: '#6b7280',
    marginBottom: '1.5rem',
    lineHeight: '1.5'
  },
  cardButton: {
    fontSize: '1rem',
    fontWeight: '500',
    display: 'inline-flex',
    alignItems: 'center'
  },
  features: {
    maxWidth: '64rem',
    margin: '0 auto',
    backgroundColor: 'white',
    borderRadius: '1rem',
    padding: '2rem',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    textAlign: 'center' as const
  },
  featuresTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '2rem'
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem'
  },
  featureItem: {
    padding: '1rem'
  },
  featureIcon: {
    fontSize: '2rem',
    marginBottom: '0.5rem'
  },
  featureText: {
    fontSize: '0.875rem',
    color: '#4b5563',
    margin: 0
  }
}