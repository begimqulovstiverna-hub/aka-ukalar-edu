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
            <div style={styles.statNumber}>50+</div>
            <div style={styles.statLabel}>Video darslar</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statNumber}>100+</div>
            <div style={styles.statLabel}>O'quvchilar</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statNumber}>15+</div>
            <div style={styles.statLabel}>Mutaxassislar</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statNumber}>24/7</div>
            <div style={styles.statLabel}>Qo'llab-quvvatlash</div>
          </div>
        </div>

        {/* Kartochkalar */}
        <div style={styles.cards}>
          <Link href="/courses" style={styles.card}>
            <div style={styles.cardIcon}>📚</div>
            <h3 style={styles.cardTitle}>Kurslar</h3>
            <p style={styles.cardText}>Frontend, backend, mobile va boshqa yo'nalishlar</p>
            <div style={styles.cardButton}>Batafsil →</div>
          </Link>
          <Link href="/schedule" style={styles.card}>
            <div style={styles.cardIcon}>📅</div>
            <h3 style={styles.cardTitle}>Dars jadvali</h3>
            <p style={styles.cardText}>Kunlik va haftalik dars vaqtlari</p>
            <div style={styles.cardButton}>Jadval →</div>
          </Link>
          <Link href="/forum" style={styles.card}>
            <div style={styles.cardIcon}>💬</div>
            <h3 style={styles.cardTitle}>Forum</h3>
            <p style={styles.cardText}>Savol-javoblar va muhokamalar</p>
            <div style={styles.cardButton}>Forum →</div>
          </Link>
          <Link href="/groups" style={styles.card}>
            <div style={styles.cardIcon}>👥</div>
            <h3 style={styles.cardTitle}>Guruhlar</h3>
            <p style={styles.cardText}>Qiziqishlar bo'yicha guruhlar va muloqot</p>
            <div style={styles.cardButton}>Guruhlar →</div>
          </Link>
        </div>

        {/* Xususiyatlar */}
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
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem',
    '@media (min-width: 768px)': {
      padding: '5rem 2rem'
    }
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '3rem'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: 'var(--text-primary)',
    margin: 0,
    '@media (min-width: 768px)': {
      fontSize: '4rem'
    }
  },
  subtitle: {
    fontSize: '1.5rem',
    color: '#2563eb',
    fontWeight: '600',
    margin: 0,
    '@media (min-width: 768px)': {
      fontSize: '2rem'
    }
  },
  floor: {
    fontSize: '1rem',
    color: 'var(--text-secondary)',
    margin: 0,
    '@media (min-width: 768px)': {
      fontSize: '1.25rem'
    }
  },
  description: {
    fontSize: '1rem',
    color: 'var(--text-secondary)',
    maxWidth: '48rem',
    margin: '1rem auto 0',
    '@media (min-width: 768px)': {
      fontSize: '1.25rem',
      margin: '1.5rem auto 0'
    }
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '1rem',
    maxWidth: '64rem',
    margin: '0 auto 3rem',
    '@media (min-width: 768px)': {
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '1.5rem',
      marginBottom: '5rem'
    }
  },
  statItem: {
    textAlign: 'center' as const,
    padding: '1rem',
    backgroundColor: 'var(--card-bg)',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  statNumber: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: '0.25rem',
    '@media (min-width: 768px)': {
      fontSize: '2rem'
    }
  },
  statLabel: {
    color: 'var(--text-secondary)',
    fontSize: '0.875rem'
  },
  cards: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '1rem',
    maxWidth: '72rem',
    margin: '0 auto 3rem',
    '@media (min-width: 768px)': {
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '2rem',
      marginBottom: '5rem'
    }
  },
  card: {
    backgroundColor: 'var(--card-bg)',
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s',
    cursor: 'pointer',
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
    '@media (min-width: 768px)': {
      padding: '2rem'
    }
  },
  cardIcon: {
    fontSize: '2rem',
    marginBottom: '1rem',
    '@media (min-width: 768px)': {
      fontSize: '2.5rem'
    }
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: 'var(--text-primary)',
    marginBottom: '0.5rem',
    '@media (min-width: 768px)': {
      fontSize: '1.5rem'
    }
  },
  cardText: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
    marginBottom: '1rem',
    lineHeight: '1.5',
    '@media (min-width: 768px)': {
      fontSize: '1rem'
    }
  },
  cardButton: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#2563eb',
    '@media (min-width: 768px)': {
      fontSize: '1rem'
    }
  },
  features: {
    maxWidth: '64rem',
    margin: '0 auto',
    backgroundColor: 'var(--card-bg)',
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    textAlign: 'center' as const,
    '@media (min-width: 768px)': {
      padding: '2rem'
    }
  },
  featuresTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: 'var(--text-primary)',
    marginBottom: '1.5rem',
    '@media (min-width: 768px)': {
      fontSize: '1.5rem'
    }
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.5rem',
    '@media (min-width: 768px)': {
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '1rem'
    }
  },
  featureItem: {
    padding: '0.5rem'
  },
  featureIcon: {
    fontSize: '1.5rem',
    marginBottom: '0.25rem',
    '@media (min-width: 768px)': {
      fontSize: '2rem',
      marginBottom: '0.5rem'
    }
  },
  featureText: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    margin: 0,
    '@media (min-width: 768px)': {
      fontSize: '0.875rem'
    }
  }
}
