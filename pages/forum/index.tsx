import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'

interface Post {
  id: string
  title: string
  content: string
  createdAt: string
  user: {
    name: string
    email: string
    image?: string
  }
  course?: {
    title: string
  }
  comments: Comment[]
  _count?: {
    comments: number
  }
}

interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    name: string
    image?: string
  }
}

export default function Forum() {
  const { data: session } = useSession()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewPostForm, setShowNewPostForm] = useState(false)
  const [courses, setCourses] = useState<any[]>([])
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    courseId: ''
  })
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchPosts()
    fetchCourses()
  }, [])

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/forum/posts')
      const data = await res.json()
      setPosts(data)
    } catch (error) {
      console.error('Postlarni yuklashda xatolik:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses')
      const data = await res.json()
      setCourses(data)
    } catch (error) {
      console.error('Kurslarni yuklashda xatolik:', error)
    }
  }

  const handleNewPost = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost)
      })

      if (res.ok) {
        setShowNewPostForm(false)
        setNewPost({ title: '', content: '', courseId: '' })
        fetchPosts()
      } else {
        const error = await res.json()
        alert(error.message || 'Xatolik yuz berdi')
      }
    } catch (error) {
      console.error('Post yozishda xatolik:', error)
      alert('Post yozishda xatolik yuz berdi')
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Bu postni o\'chirishni tasdiqlaysizmi?')) return

    try {
      const res = await fetch(`/api/forum/posts/${postId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        fetchPosts()
      } else {
        const error = await res.json()
        alert(error.message || 'Xatolik yuz berdi')
      }
    } catch (error) {
      console.error('Post o\'chirishda xatolik:', error)
      alert('Post o\'chirishda xatolik yuz berdi')
    }
  }

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || 
      (selectedCategory === 'general' && !post.course) ||
      (selectedCategory === 'course' && post.course)
    
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.user.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesCategory && matchesSearch
  })

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <div style={styles.loadingText}>Forum yuklanmoqda...</div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Dekorativ fon elementlari */}
      <div style={styles.circle1}></div>
      <div style={styles.circle2}></div>
      <div style={styles.circle3}></div>
      
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
            <Link href="/forum" style={{...styles.navLink, ...styles.navLinkActive}}>Forum</Link>
          </div>
          <div style={styles.authButtons}>
            {!session ? (
              <>
                <button onClick={() => router.push('/login')} style={styles.loginButton}>Kirish</button>
                <button onClick={() => router.push('/register')} style={styles.registerButton}>Ro'yxat</button>
              </>
            ) : (
              <span style={styles.userName}>{session.user?.name}</span>
            )}
          </div>
        </div>
      </nav>

      <main style={styles.main}>
        {/* Sarlavha va qidiruv */}
        <div style={styles.header}>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={styles.title}
          >
            Forum
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={styles.subtitle}
          >
            Savol-javoblar, muhokamalar va fikr almashish
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={styles.searchSection}
          >
            <div style={styles.searchBox}>
              <span style={styles.searchIcon}>🔍</span>
              <input
                type="text"
                placeholder="Postlarni qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            
            <div style={styles.categoryFilter}>
              <button
                onClick={() => setSelectedCategory('all')}
                style={{
                  ...styles.categoryButton,
                  ...(selectedCategory === 'all' ? styles.categoryButtonActive : {})
                }}
              >
                Barchasi
              </button>
              <button
                onClick={() => setSelectedCategory('general')}
                style={{
                  ...styles.categoryButton,
                  ...(selectedCategory === 'general' ? styles.categoryButtonActive : {})
                }}
              >
                Umumiy
              </button>
              <button
                onClick={() => setSelectedCategory('course')}
                style={{
                  ...styles.categoryButton,
                  ...(selectedCategory === 'course' ? styles.categoryButtonActive : {})
                }}
              >
                Kurslar
              </button>
            </div>

            {session && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNewPostForm(!showNewPostForm)}
                style={styles.newPostButton}
              >
                {showNewPostForm ? '✕ Bekor qilish' : '+ Yangi post'}
              </motion.button>
            )}
          </motion.div>
        </div>

        {/* Yangi post formasi */}
        <AnimatePresence>
          {showNewPostForm && session && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              style={styles.formContainer}
            >
              <h3 style={styles.formTitle}>Yangi post yozish</h3>
              <form onSubmit={handleNewPost} style={styles.form}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Sarlavha *</label>
                  <input
                    type="text"
                    required
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    style={styles.input}
                    placeholder="Post sarlavhasi"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Kurs (ixtiyoriy)</label>
                  <select
                    value={newPost.courseId}
                    onChange={(e) => setNewPost({ ...newPost, courseId: e.target.value })}
                    style={styles.select}
                  >
                    <option value="">Umumiy forum</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Matn *</label>
                  <textarea
                    required
                    rows={5}
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    style={styles.textarea}
                    placeholder="Post matnini yozing..."
                  />
                </div>

                <div style={styles.formButtons}>
                  <button
                    type="button"
                    onClick={() => setShowNewPostForm(false)}
                    style={styles.cancelButton}
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    style={styles.submitButton}
                  >
                    Joylashtirish
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Postlar ro'yxati */}
        <div style={styles.postsGrid}>
          <AnimatePresence>
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  style={styles.postCard}
                  whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' }}
                >
                  {/* Post header */}
                  <div style={styles.postHeader}>
                    <div style={styles.postAuthor}>
                      <div style={styles.authorAvatar}>
                        {post.user.image ? (
                          <img src={post.user.image} alt={post.user.name} style={styles.avatarImage} />
                        ) : (
                          <span style={styles.avatarPlaceholder}>
                            {post.user.name?.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div style={styles.authorInfo}>
                        <span style={styles.authorName}>{post.user.name}</span>
                        <span style={styles.postDate}>
                          {new Date(post.createdAt).toLocaleDateString('uz-UZ', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    {post.course && (
                      <span style={styles.courseBadge}>
                        {post.course.title}
                      </span>
                    )}
                  </div>

                  {/* Post content */}
                  <Link href={`/forum/post/${post.id}`} style={styles.postLink}>
                    <h3 style={styles.postTitle}>{post.title}</h3>
                    <p style={styles.postContent}>
                      {post.content.length > 200 
                        ? `${post.content.substring(0, 200)}...` 
                        : post.content}
                    </p>
                  </Link>

                  {/* Post footer */}
                  <div style={styles.postFooter}>
                    <div style={styles.postStats}>
                      <span style={styles.statItem}>
                        <span style={styles.statIcon}>💬</span>
                        {post.comments?.length || 0} ta comment
                      </span>
                    </div>
                    
                    <div style={styles.postActions}>
                      <Link href={`/forum/post/${post.id}`} style={styles.readMoreButton}>
                        O'qish
                        <span style={styles.readMoreIcon}>→</span>
                      </Link>
                      
                      {(session?.user?.email === post.user.email || session?.user?.role === 'admin') && (
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          style={styles.deleteButton}
                          title="O'chirish"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={styles.emptyState}
              >
                <div style={styles.emptyIcon}>📭</div>
                <h3 style={styles.emptyTitle}>Hozircha postlar yo'q</h3>
                <p style={styles.emptyText}>
                  {searchQuery || selectedCategory !== 'all' 
                    ? 'Qidiruv bo\'yicha hech narsa topilmadi'
                    : 'Birinchi postni yozish orqali muhokamani boshlang!'}
                </p>
                {session && !showNewPostForm && (
                  <button
                    onClick={() => setShowNewPostForm(true)}
                    style={styles.emptyButton}
                  >
                    Birinchi postni yozish
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
        button {
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: 'sans-serif',
    position: 'relative' as const,
    overflow: 'hidden'
  },
  circle1: {
    position: 'absolute' as const,
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'linear-gradient(45deg, #f093fb 0%, #f5576c 100%)',
    top: '-150px',
    right: '-150px',
    opacity: 0.3,
    animation: 'float 8s ease-in-out infinite'
  },
  circle2: {
    position: 'absolute' as const,
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)',
    bottom: '-100px',
    left: '-100px',
    opacity: 0.3,
    animation: 'float 10s ease-in-out infinite reverse'
  },
  circle3: {
    position: 'absolute' as const,
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    background: 'linear-gradient(45deg, #43e97b 0%, #38f9d7 100%)',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    opacity: 0.2,
    animation: 'pulse 4s ease-in-out infinite'
  },
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '3px solid rgba(255,255,255,0.3)',
    borderTop: '3px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
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
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textDecoration: 'none'
  },
  navLinks: {
    display: 'flex',
    gap: '2rem'
  },
  navLink: {
    color: '#4a5568',
    textDecoration: 'none',
    fontSize: '0.95rem',
    transition: 'color 0.2s'
  },
  navLinkActive: {
    color: '#667eea',
    fontWeight: '600'
  },
  authButtons: {
    display: 'flex',
    gap: '1rem'
  },
  loginButton: {
    padding: '0.5rem 1.5rem',
    background: 'transparent',
    border: '2px solid #667eea',
    borderRadius: '8px',
    color: '#667eea',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  registerButton: {
    padding: '0.5rem 1.5rem',
    background: '#667eea',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  userName: {
    padding: '0.5rem 1rem',
    background: 'rgba(102, 126, 234, 0.1)',
    borderRadius: '8px',
    color: '#667eea',
    fontWeight: '600'
  },
  main: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '2rem',
    position: 'relative' as const,
    zIndex: 10
  },
  header: {
    marginBottom: '3rem'
  },
  title: {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '0.5rem',
    textAlign: 'center' as const,
    textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
  },
  subtitle: {
    fontSize: '1.2rem',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: '2rem',
    textAlign: 'center' as const
  },
  searchSection: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    padding: '1rem',
    borderRadius: '12px'
  },
  searchBox: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    background: 'white',
    borderRadius: '8px',
    padding: '0 0.5rem'
  },
  searchIcon: {
    fontSize: '1.2rem',
    margin: '0 0.5rem'
  },
  searchInput: {
    flex: 1,
    padding: '0.75rem',
    border: 'none',
    outline: 'none',
    fontSize: '1rem',
    borderRadius: '8px'
  },
  categoryFilter: {
    display: 'flex',
    gap: '0.5rem'
  },
  categoryButton: {
    padding: '0.5rem 1rem',
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  categoryButtonActive: {
    background: 'white',
    color: '#667eea'
  },
  newPostButton: {
    padding: '0.5rem 1.5rem',
    background: 'white',
    border: 'none',
    borderRadius: '8px',
    color: '#667eea',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  formContainer: {
    background: 'white',
    borderRadius: '12px',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
  },
  formTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: '1.5rem'
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
  label: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#4a5568'
  },
  input: {
    padding: '0.75rem',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none'
  },
  select: {
    padding: '0.75rem',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none'
  },
  textarea: {
    padding: '0.75rem',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none',
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
    background: '#cbd5e0',
    border: 'none',
    borderRadius: '8px',
    color: '#2d3748',
    fontSize: '0.9rem',
    cursor: 'pointer'
  },
  submitButton: {
    padding: '0.75rem 1.5rem',
    background: '#667eea',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '0.9rem',
    cursor: 'pointer'
  },
  postsGrid: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem'
  },
  postCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    transition: 'all 0.2s'
  },
  postHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  postAuthor: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  authorAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  avatarImage: {
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
    fontSize: '1.2rem',
    fontWeight: 'bold'
  },
  authorInfo: {
    display: 'flex',
    flexDirection: 'column' as const
  },
  authorName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#2d3748'
  },
  postDate: {
    fontSize: '0.75rem',
    color: '#a0aec0'
  },
  courseBadge: {
    padding: '0.25rem 0.75rem',
    background: 'rgba(102, 126, 234, 0.1)',
    borderRadius: '20px',
    color: '#667eea',
    fontSize: '0.75rem',
    fontWeight: '600'
  },
  postLink: {
    textDecoration: 'none',
    cursor: 'pointer'
  },
  postTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: '0.5rem'
  },
  postContent: {
    fontSize: '1rem',
    color: '#718096',
    lineHeight: '1.6',
    marginBottom: '1rem'
  },
  postFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #e2e8f0'
  },
  postStats: {
    display: 'flex',
    gap: '1rem'
  },
  statItem: {
    fontSize: '0.875rem',
    color: '#a0aec0',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem'
  },
  statIcon: {
    fontSize: '1rem'
  },
  postActions: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center'
  },
  readMoreButton: {
    padding: '0.5rem 1rem',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    color: '#667eea',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    textDecoration: 'none'
  },
  readMoreIcon: {
    fontSize: '1.1rem',
    transition: 'transform 0.2s'
  },
  deleteButton: {
    padding: '0.5rem 0.75rem',
    background: '#f56565',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    fontSize: '0.875rem',
    cursor: 'pointer'
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '4rem 2rem',
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px'
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem'
  },
  emptyTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '0.5rem'
  },
  emptyText: {
    fontSize: '1rem',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: '1.5rem'
  },
  emptyButton: {
    padding: '0.75rem 2rem',
    background: 'white',
    border: 'none',
    borderRadius: '8px',
    color: '#667eea',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer'
  }
}
