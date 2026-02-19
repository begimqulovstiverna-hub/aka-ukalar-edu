import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'

interface Course {
  id: string
  title: string
  description: string | null
  price: number | null
  image: string | null
}

export default function Courses() {
  const { data: session } = useSession()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses')
      const data = await res.json()
      setCourses(data)
    } catch (error) {
      console.error('Kurslarni yuklashda xatolik:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingText}>Yuklanmoqda...</div>
      </div>
    )
  }

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
            <Link href="/courses" style={{...styles.navLink, ...styles.navLinkActive}}>Kurslar</Link>
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
                  {(session.user as any)?.image ? (
  <img src={(session.user as any).image} alt={session.user.name || ''} style={styles.avatar} />
) : (
  <div style={styles.avatarPlaceholder}>
    {session.user.name?.charAt(0).toUpperCase()}
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

      {/* Asosiy qism */}
      <main style={styles.main}>
        <h1 style={styles.title}>Kurslar</h1>
        
        {courses.length === 0 ? (
          <p style={styles.emptyText}>Hozircha kurslar mavjud emas</p>
        ) : (
          <div style={styles.cards}>
            {courses.map(course => (
              <Link key={course.id} href={`/courses/${course.id}`} style={styles.card}>
                <div style={styles.cardImage}>
                  {course.image ? (
                    <img src={course.image} alt={course.title} style={styles.image} />
                  ) : (
                    <div style={styles.imagePlaceholder}>
                      <span style={styles.placeholderIcon}>📚</span>
                    </div>
                  )}
                </div>
                <div style={styles.cardContent}>
                  <h3 style={styles.cardTitle}>{course.title}</h3>
                  <p style={styles.cardText}>{course.description || 'Kurs haqida maʼlumot...'}</p>
                  <div style={styles.cardFooter}>
                    <span style={styles.price}>
                      {course.price ? `${course.price.toLocaleString()} so'm` : 'BEPUL'}
                    </span>
                    <span style={styles.details}>Batafsil →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: 'sans-serif'
  },
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  loadingText: {
    fontSize: '1.2rem',
    color: 'white'
  },
  nav: {
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    position: 'sticky' as const,
    top: 0,
    zIndex: 50
  },
  navContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#667eea',
    textDecoration: 'none'
  },
  navLinks: {
    display: 'flex',
    gap: '1rem'
  },
  navLink: {
    padding: '0.5rem 1rem',
    color: '#4a5568',
    textDecoration: 'none',
    fontSize: '1rem',
    borderRadius: '30px',
    transition: 'all 0.2s'
  },
  navLinkActive: {
    background: '#667eea',
    color: 'white'
  },
  authButtons: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
  },
  loginButton: {
    padding: '0.5rem 1.5rem',
    background: '#667eea',
    border: 'none',
    borderRadius: '30px',
    color: 'white',
    fontSize: '0.9rem',
    textDecoration: 'none',
    cursor: 'pointer'
  },
  registerButton: {
    padding: '0.5rem 1.5rem',
    background: '#10b981',
    border: 'none',
    borderRadius: '30px',
    color: 'white',
    fontSize: '0.9rem',
    textDecoration: 'none',
    cursor: 'pointer'
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
    color: '#4a5568'
  },
  avatarContainer: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    overflow: 'hidden',
    background: '#667eea'
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
    fontWeight: '500',
    color: '#4a5568'
  },
  logoutButton: {
    padding: '0.5rem 1rem',
    background: '#dc2626',
    border: 'none',
    borderRadius: '30px',
    color: 'white',
    fontSize: '0.9rem',
    cursor: 'pointer'
  },
  main: {
    maxWidth: '1200px',
    margin: '2rem auto',
    padding: '0 2rem'
  },
  title: {
    fontSize: '2.5rem',
    color: 'white',
    marginBottom: '2rem',
    textAlign: 'center' as const
  },
  emptyText: {
    textAlign: 'center' as const,
    color: 'white',
    fontSize: '1.2rem',
    padding: '3rem',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '12px'
  },
  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '2rem'
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    textDecoration: 'none',
    color: 'inherit',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s'
  },
  cardImage: {
    height: '200px',
    background: '#667eea',
    position: 'relative' as const
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  placeholderIcon: {
    fontSize: '3rem',
    color: 'white'
  },
  cardContent: {
    padding: '1.5rem'
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '0.5rem'
  },
  cardText: {
    fontSize: '0.95rem',
    color: '#718096',
    marginBottom: '1rem',
    lineHeight: '1.5'
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  price: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#667eea'
  },
  details: {
    fontSize: '0.9rem',
    color: '#718096'
  }
}
