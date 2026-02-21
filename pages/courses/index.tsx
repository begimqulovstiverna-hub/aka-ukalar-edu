import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '../../components/Navbar'

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
      <Navbar />

      {/* Asosiy qism */}
      <main style={styles.main}>
        {/* Admin panel tugmalari */}
        {(session?.user?.role === 'admin' || session?.user?.role === 'creator') && (
          <div style={styles.adminActions}>
            <button
              onClick={() => router.push('/courses/new')}
              style={styles.newCourseButton}
            >
              + Yangi kurs qo'shish
            </button>
          </div>
        )}

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
    fontFamily: 'sans-serif'
  },
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-gradient)'
  },
  loadingText: {
    fontSize: '1.2rem',
    color: 'var(--text-primary)'
  },
  main: {
    maxWidth: '1200px',
    margin: '2rem auto',
    padding: '0 2rem'
  },
  adminActions: {
    marginBottom: '2rem',
    textAlign: 'right' as const
  },
  newCourseButton: {
    padding: '0.75rem 2rem',
    background: '#10b981',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  title: {
    fontSize: '2.5rem',
    color: 'var(--text-primary)',
    marginBottom: '2rem',
    textAlign: 'center' as const
  },
  emptyText: {
    textAlign: 'center' as const,
    color: 'var(--text-secondary)',
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
    background: 'var(--card-bg)',
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
    color: 'var(--text-primary)',
    marginBottom: '0.5rem'
  },
  cardText: {
    fontSize: '0.95rem',
    color: 'var(--text-secondary)',
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
    color: 'var(--text-secondary)'
  }
}
