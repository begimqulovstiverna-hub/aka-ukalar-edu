import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import Navbar from '../components/Navbar'

export default function Home() {
  const { data: session } = useSession()

  return (
    <div style={styles.container}>
      <Navbar />
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
    fontFamily: 'sans-serif'
  },
  main: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '5rem 1rem',
    '@media (max-width: 768px)': {
      padding: '2rem 1rem'
    }
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '4rem',
    '@media (max-width: 768px)': {
      marginBottom: '2rem'
    }
  },
  title: {
    fontSize: '4rem',
    fontWeight: 'bold',
    color: 'var(--text-primary)',
    margin: 0,
    '@media (max-width: 768px)': {
      fontSize: '2.5rem'
    }
  },
  subtitle: {
    fontSize: '2rem',
    color: '#2563eb',
    fontWeight: '600',
    margin: 0,
    '@media (max-width: 768px)': {
      fontSize: '1.5rem'
    }
  },
  floor: {
    fontSize: '1.25rem',
    color: 'var(--text-secondary)',
    margin: 0,
    '@media (max-width: 768px)': {
      fontSize: '1rem'
    }
  },
  description: {
    fontSize: '1.25rem',
    color: 'var(--text-secondary)',
    maxWidth: '48rem',
    margin: '1.5rem auto 0',
    '@media (max-width: 768px)': {
      fontSize: '1rem',
      margin: '1rem auto 0'
    }
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1.5rem',
    maxWidth: '64rem',
    margin: '0 auto 5rem',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
      gap: '1rem',
      marginBottom: '3rem'
    }
  },
  statItem: {
    textAlign: 'center' as const,
    padding: '1.5rem',
    backgroundColor: 'var(--card-bg)',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    '@media (max-width: 768px)': {
      padding: '1rem'
    }
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    '@media (max-width: 768px)': {
      fontSize: '1.5rem'
    }
  },
  statLabel: {
    color: 'var(--text-secondary)',
    fontSize: '0.875rem'
  },
  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '2rem',
    maxWidth: '72rem',
    margin: '0 auto 5rem',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
      gap: '1rem',
      marginBottom: '3rem'
    }
  },
  card: {
    backgroundColor: 'var(--card-bg)',
    borderRadius: '1rem',
    padding: '2rem',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    transition: 'box-shadow 0.3s, transform 0.3s',
    cursor: 'pointer',
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
    '@media (max-width: 768px)': {
      padding: '1.5rem'
    }
  },
  cardIcon: {
    width: '3.5rem',
    height: '3.5rem',
    borderRadius: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.5rem',
    '@media (max-width: 768px)': {
      width: '3rem',
      height: '3rem',
      marginBottom: '1rem'
    }
  },
  cardIconText: {
    fontSize: '2rem',
    '@media (max-width: 768px)': {
      fontSize: '1.5rem'
    }
  },
  cardTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'var(--text-primary)',
    marginBottom: '0.75rem',
    '@media (max-width: 768px)': {
      fontSize: '1.25rem'
    }
  },
  cardText: {
    color: 'var(--text-secondary)',
    marginBottom: '1.5rem',
    lineHeight: '1.5',
    fontSize: '1rem',
    '@media (max-width: 768px)': {
      fontSize: '0.875rem',
      marginBottom: '1rem'
    }
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
    backgroundColor: 'var(--card-bg)',
    borderRadius: '1rem',
    padding: '2rem',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    textAlign: 'center' as const
  },
  featuresTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'var(--text-primary)',
    marginBottom: '2rem'
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    '@media (max-width: 768px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '0.5rem'
    }
  },
  featureItem: {
    padding: '1rem',
    '@media (max-width: 768px)': {
      padding: '0.5rem'
    }
  },
  featureIcon: {
    fontSize: '2rem',
    marginBottom: '0.5rem'
  },
  featureText: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
    margin: 0
  }
}
