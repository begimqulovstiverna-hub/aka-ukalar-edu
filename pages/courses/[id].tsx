import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

interface Course {
  id: string
  title: string
  description: string | null
  price: number | null
  image: string | null
  _count?: {
    enrollments: number
    lessons: number
  }
  lessons?: {
    id: string
    title: string
    duration: number | null
    order: number
  }[]
}

export default function CourseDetail() {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = router.query
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [unenrolling, setUnenrolling] = useState(false)
  const [enrolled, setEnrolled] = useState(false)
  const [totalDuration, setTotalDuration] = useState(0)

  useEffect(() => {
    if (id) {
      fetchCourse()
    }
  }, [id])

  useEffect(() => {
    if (id && session) {
      checkEnrollment()
    }
  }, [id, session])

  const fetchCourse = async () => {
    try {
      const res = await fetch(`/api/courses/${id}`)
      const data = await res.json()
      setCourse(data)
      
      // Darslarning umumiy davomiyligini hisoblash
      if (data.lessons) {
        const total = data.lessons.reduce((acc: number, lesson: any) => 
          acc + (lesson.duration || 0), 0
        )
        setTotalDuration(total)
      }
    } catch (error) {
      console.error('Xatolik:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkEnrollment = async () => {
    try {
      const res = await fetch(`/api/enrollments/check?courseId=${id}`)
      const data = await res.json()
      setEnrolled(data.enrolled)
    } catch (error) {
      console.error('Enrollment check error:', error)
    }
  }

  const handleEnroll = async () => {
    if (!session) {
      router.push('/login')
      return
    }

    setEnrolling(true)
    try {
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: id })
      })

      const data = await res.json()

      if (res.ok) {
        setEnrolled(true)
        alert('✅ ' + data.message)
        // Statistikani yangilash
        fetchCourse()
      } else {
        alert('❌ ' + data.message)
      }
    } catch (error) {
      console.error('Enroll error:', error)
      alert('❌ Server bilan bogʻlanishda xatolik')
    } finally {
      setEnrolling(false)
    }
  }

  // KURSNI TARK ETISH FUNKSIYASI
  const handleUnenroll = async () => {
    if (!confirm('Kursni tark etmoqchimisiz?')) return

    setUnenrolling(true)
    try {
      const res = await fetch('/api/enrollments/unenroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: id })
      })

      const data = await res.json()

      if (res.ok) {
        setEnrolled(false)
        alert('✅ ' + data.message)
        // Statistikani yangilash
        fetchCourse()
      } else {
        alert('❌ ' + data.message)
      }
    } catch (error) {
      console.error('Unenroll error:', error)
      alert('❌ Server bilan bogʻlanishda xatolik')
    } finally {
      setUnenrolling(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Bu kursni oʻchirishni tasdiqlaysizmi?')) return
    
    try {
      const res = await fetch(`/api/courses/${id}`, { 
        method: 'DELETE' 
      })
      
      if (res.ok) {
        alert('Kurs oʻchirildi')
        router.push('/courses')
      }
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loading}>Yuklanmoqda...</div>
      </div>
    )
  }

  if (!course) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loading}>Kurs topilmadi</div>
        <button onClick={() => router.push('/courses')} style={styles.backButton}>
          Kurslar sahifasiga qaytish
        </button>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Navigatsiya */}
      <nav style={styles.nav}>
        <div style={styles.navContent}>
          <div style={styles.logo}>aka-ukalar</div>
          <div style={styles.navLinks}>
            <button onClick={() => router.push('/')} style={styles.navButton}>Bosh sahifa</button>
            <button onClick={() => router.push('/courses')} style={styles.navButton}>Kurslar</button>
            <button onClick={() => router.push('/schedule')} style={styles.navButton}>Dars jadvali</button>
            <button onClick={() => router.push('/forum')} style={styles.navButton}>Forum</button>
          </div>
        </div>
      </nav>

      {/* Kurs ma'lumotlari */}
      <main style={styles.main}>
        {/* Admin tugmalari */}
        {session?.user?.role === 'admin' && (
          <div style={styles.adminPanel}>
            <button onClick={handleDelete} style={styles.deleteButton}>
              🗑️ Kursni o'chirish
            </button>
          </div>
        )}

        <h1 style={styles.title}>{course.title}</h1>
        
        {course.image && (
          <img src={course.image} alt={course.title} style={styles.image} />
        )}

        {/* STATISTIKA QISMI */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>👥</div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{course._count?.enrollments || 0}</div>
              <div style={styles.statLabel}>Yozilganlar</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>📝</div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{course.lessons?.length || 0}</div>
              <div style={styles.statLabel}>Darslar soni</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>⏱️</div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{totalDuration} min</div>
              <div style={styles.statLabel}>Umumiy vaqt</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>📊</div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>4.8</div>
              <div style={styles.statLabel}>Reyting</div>
            </div>
          </div>
        </div>

        <p style={styles.description}>{course.description || 'Tavsif mavjud emas'}</p>
        
        <div style={styles.price}>
          Narxi: <strong>{course.price ? `${course.price.toLocaleString()} so'm` : 'BEPUL'}</strong>
        </div>

        {/* Darslar ro'yxati */}
        {course.lessons && course.lessons.length > 0 && (
          <div style={styles.lessonsSection}>
            <h3 style={styles.sectionTitle}>Darslar ro'yxati</h3>
            <div style={styles.lessonsList}>
              {course.lessons.map((lesson, index) => (
                <div key={lesson.id} style={styles.lessonItem}>
                  <div style={styles.lessonNumber}>{index + 1}</div>
                  <div style={styles.lessonInfo}>
                    <div style={styles.lessonTitle}>{lesson.title}</div>
                    {lesson.duration && (
                      <div style={styles.lessonDuration}>{lesson.duration} daqiqa</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* YOZILISH / TARK ETISH TUGMALARI */}
        <div style={styles.enrollSection}>
          {enrolled ? (
            <div style={styles.enrolledContainer}>
              <div style={styles.enrolledMessage}>
                <span style={styles.enrolledIcon}>✅</span>
                <span style={styles.enrolledText}>Siz bu kursga yozilgansiz</span>
              </div>
              <button 
                onClick={handleUnenroll}
                disabled={unenrolling}
                style={{
                  ...styles.unenrollButton,
                  opacity: unenrolling ? 0.7 : 1,
                  cursor: unenrolling ? 'not-allowed' : 'pointer'
                }}
              >
                {unenrolling ? 'Tark etilmoqda...' : 'Kursni tark etish'}
              </button>
            </div>
          ) : (
            <button 
              onClick={handleEnroll}
              disabled={enrolling}
              style={{
                ...styles.enrollButton,
                opacity: enrolling ? 0.7 : 1,
                cursor: enrolling ? 'not-allowed' : 'pointer'
              }}
            >
              {enrolling ? 'Yozilmoqda...' : (session ? 'Kursga yozilish' : 'Yozilish uchun kiring')}
            </button>
          )}
          
          {!session && !enrolled && (
            <p style={styles.loginHint}>
              <button onClick={() => router.push('/login')} style={styles.linkButton}>
                Tizimga kiring
              </button> va kursga yoziling
            </p>
          )}
        </div>
      </main>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f8fafc',
    fontFamily: 'sans-serif'
  },
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem'
  },
  loading: {
    fontSize: '1.2rem',
    color: '#64748b'
  },
  backButton: {
    padding: '0.5rem 1rem',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  nav: {
    background: 'white',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky' as const,
    top: 0,
    zIndex: 50
  },
  navContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#2563eb'
  },
  navLinks: {
    display: 'flex',
    gap: '1rem'
  },
  navButton: {
    padding: '0.5rem 1rem',
    background: 'transparent',
    border: 'none',
    fontSize: '1rem',
    cursor: 'pointer',
    color: '#475569',
    borderRadius: '4px'
  },
  main: {
    maxWidth: '800px',
    margin: '2rem auto',
    padding: '2rem',
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  adminPanel: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '1rem'
  },
  deleteButton: {
    padding: '0.5rem 1rem',
    background: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem'
  },
  title: {
    fontSize: '2rem',
    marginBottom: '1rem',
    color: '#0f172a'
  },
  image: {
    width: '100%',
    maxHeight: '400px',
    objectFit: 'cover' as const,
    borderRadius: '4px',
    marginBottom: '1rem'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    marginBottom: '2rem'
  },
  statCard: {
    background: '#f8fafc',
    padding: '1rem',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  statIcon: {
    fontSize: '1.5rem'
  },
  statContent: {
    display: 'flex',
    flexDirection: 'column' as const
  },
  statValue: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#0f172a'
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#64748b'
  },
  description: {
    fontSize: '1rem',
    lineHeight: '1.6',
    color: '#334155',
    marginBottom: '1rem'
  },
  price: {
    fontSize: '1.25rem',
    padding: '1rem',
    background: '#f8fafc',
    borderRadius: '4px',
    marginBottom: '2rem'
  },
  lessonsSection: {
    marginBottom: '2rem'
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: '1rem'
  },
  lessonsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem'
  },
  lessonItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem',
    background: '#f8fafc',
    borderRadius: '4px'
  },
  lessonNumber: {
    width: '2rem',
    height: '2rem',
    background: '#2563eb',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold'
  },
  lessonInfo: {
    flex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  lessonTitle: {
    fontSize: '1rem',
    color: '#0f172a'
  },
  lessonDuration: {
    fontSize: '0.875rem',
    color: '#64748b'
  },
  enrollSection: {
    marginTop: '2rem'
  },
  enrollButton: {
    width: '100%',
    padding: '1rem',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  enrolledContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem'
  },
  enrolledMessage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '1rem',
    background: '#10b981',
    color: 'white',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: 'bold'
  },
  enrolledIcon: {
    fontSize: '1.3rem'
  },
  enrolledText: {
    color: 'white'
  },
  unenrollButton: {
    width: '100%',
    padding: '1rem',
    background: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  loginHint: {
    marginTop: '1rem',
    color: '#64748b',
    fontSize: '0.875rem',
    textAlign: 'center' as const
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#2563eb',
    textDecoration: 'underline',
    cursor: 'pointer',
    fontSize: '0.875rem'
  }
}
