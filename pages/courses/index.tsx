import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

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
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    price: '',
    image: ''
  })

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses')
      const data = await res.json()
      setCourses(data)
    } catch (error) {
      console.error('Xatolik:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm('Bu kursni oʻchirishni tasdiqlaysizmi?')) return

    try {
      const res = await fetch(`/api/courses/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        await fetchCourses()
        alert('Kurs oʻchirildi!')
      }
    } catch (error) {
      console.error('Xatolik:', error)
    }
  }

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newCourse,
          price: newCourse.price ? parseFloat(newCourse.price) : null,
          published: true
        })
      })

      if (res.ok) {
        setShowAddForm(false)
        setNewCourse({ title: '', description: '', price: '', image: '' })
        await fetchCourses()
        alert('Kurs qoʻshildi!')
      }
    } catch (error) {
      console.error('Xatolik:', error)
    }
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loading}>Yuklanmoqda...</div>
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
            <button onClick={() => router.push('/schedule')} style={styles.navButton}>Dars jadvali</button>
            <button onClick={() => router.push('/forum')} style={styles.navButton}>Forum</button>
            {!session ? (
              <button onClick={() => router.push('/login')} style={styles.loginButton}>Kirish</button>
            ) : (
              <span style={styles.userName}>{session.user?.name}</span>
            )}
          </div>
        </div>
      </nav>

      {/* Asosiy qism */}
      <main style={styles.main}>
        {/* Sarlavha va admin tugmasi */}
        <div style={styles.header}>
          <h1 style={styles.title}>Kurslar</h1>
          {session?.user?.role === 'admin' && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              style={styles.addButton}
            >
              {showAddForm ? 'Bekor qilish' : '+ Yangi kurs'}
            </button>
          )}
        </div>

        {/* Yangi kurs qo'shish formasi */}
        {showAddForm && session?.user?.role === 'admin' && (
          <div style={styles.formContainer}>
            <h3 style={styles.formTitle}>Yangi kurs qo'shish</h3>
            <form onSubmit={handleAddCourse} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Kurs nomi *</label>
                <input
                  type="text"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                  style={styles.input}
                  required
                  placeholder="Masalan: JavaScript asoslari"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Tavsif</label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                  style={styles.textarea}
                  rows={3}
                  placeholder="Kurs haqida qisqacha ma'lumot"
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Narxi (so'm)</label>
                  <input
                    type="number"
                    value={newCourse.price}
                    onChange={(e) => setNewCourse({...newCourse, price: e.target.value})}
                    style={styles.input}
                    placeholder="Masalan: 500000"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Rasm URL</label>
                  <input
                    type="url"
                    value={newCourse.image}
                    onChange={(e) => setNewCourse({...newCourse, image: e.target.value})}
                    style={styles.input}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div style={styles.formButtons}>
                <button type="button" onClick={() => setShowAddForm(false)} style={styles.cancelButton}>
                  Bekor qilish
                </button>
                <button type="submit" style={styles.saveButton}>
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Kurslar ro'yxati */}
        {courses.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>Hozircha kurslar mavjud emas</p>
            {session?.user?.role === 'admin' && (
              <button onClick={() => setShowAddForm(true)} style={styles.emptyButton}>
                Birinchi kursni qo'shish
              </button>
            )}
          </div>
        ) : (
          <div style={styles.grid}>
            {courses.map(course => (
              <div key={course.id} style={styles.card}>
                {/* Admin o'chirish tugmasi */}
                {session?.user?.role === 'admin' && (
                  <button
                    onClick={(e) => handleDelete(course.id, e)}
                    style={styles.deleteButton}
                    title="O'chirish"
                  >
                    🗑️
                  </button>
                )}

                {/* Kurs ma'lumotlari */}
                <div 
                  style={styles.cardContent}
                  onClick={() => router.push(`/courses/${course.id}`)}
                >
                  <div style={styles.imagePlaceholder}>
                    {course.image ? (
                      <img src={course.image} alt={course.title} style={styles.image} />
                    ) : (
                      <span style={styles.emoji}>📚</span>
                    )}
                  </div>
                  
                  <h3 style={styles.cardTitle}>{course.title}</h3>
                  <p style={styles.cardText}>
                    {course.description?.substring(0, 60) || 'Maʼlumot yoʻq'}...
                  </p>
                  
                  <div style={styles.price}>
                    {course.price ? `${course.price.toLocaleString()} so'm` : 'BEPUL'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <style>{`
        button {
          cursor: pointer;
          border: none;
        }
        button:hover {
          opacity: 0.9;
        }
      `}</style>
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
    alignItems: 'center',
    justifyContent: 'center'
  },
  loading: {
    fontSize: '1.2rem',
    color: '#64748b'
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
    gap: '1rem',
    alignItems: 'center'
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
  loginButton: {
    padding: '0.5rem 1rem',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  userName: {
    padding: '0.5rem 1rem',
    background: '#f1f5f9',
    borderRadius: '4px',
    color: '#334155'
  },
  main: {
    maxWidth: '1200px',
    margin: '2rem auto',
    padding: '0 1rem'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem'
  },
  title: {
    fontSize: '2rem',
    margin: 0,
    color: '#0f172a'
  },
  addButton: {
    padding: '0.75rem 1.5rem',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    cursor: 'pointer'
  },
  formContainer: {
    background: 'white',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '2rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  formTitle: {
    margin: '0 0 1rem 0',
    color: '#0f172a'
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem'
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#334155'
  },
  input: {
    padding: '0.75rem',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    fontSize: '1rem'
  },
  textarea: {
    padding: '0.75rem',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    fontSize: '1rem',
    resize: 'vertical' as const
  },
  formButtons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    marginTop: '1rem'
  },
  cancelButton: {
    padding: '0.75rem 1.5rem',
    background: '#94a3b8',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.875rem',
    cursor: 'pointer'
  },
  saveButton: {
    padding: '0.75rem 1.5rem',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.875rem',
    cursor: 'pointer'
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '3rem',
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  emptyText: {
    fontSize: '1.1rem',
    color: '#64748b',
    marginBottom: '1rem'
  },
  emptyButton: {
    padding: '0.75rem 1.5rem',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.875rem',
    cursor: 'pointer'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem'
  },
  card: {
    position: 'relative' as const,
    background: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s',
    cursor: 'pointer'
  },
  deleteButton: {
    position: 'absolute' as const,
    top: '0.5rem',
    right: '0.5rem',
    width: '2rem',
    height: '2rem',
    background: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    fontSize: '1rem',
    cursor: 'pointer',
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%'
  },
  imagePlaceholder: {
    height: '160px',
    background: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const
  },
  emoji: {
    fontSize: '3rem'
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    margin: '1rem 1rem 0.5rem 1rem',
    color: '#0f172a'
  },
  cardText: {
    margin: '0 1rem 0.5rem 1rem',
    color: '#64748b',
    fontSize: '0.875rem',
    lineHeight: '1.4'
  },
  price: {
    margin: '0 1rem 1rem 1rem',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#2563eb'
  }
}
