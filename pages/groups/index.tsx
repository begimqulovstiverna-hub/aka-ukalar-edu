import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

interface Group {
  id: string
  name: string
  description: string | null
  avatar: string | null
  createdAt: string
  createdBy: {
    name: string
    email: string
  }
  _count: {
    members: number
    posts: number
  }
}

export default function Groups() {
  const { data: session } = useSession()
  const router = useRouter()
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    avatar: ''
  })

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      const res = await fetch('/api/groups')
      const data = await res.json()
      setGroups(data)
    } catch (error) {
      console.error('Guruhlarni yuklashda xatolik:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setShowCreateForm(false)
        setFormData({ name: '', description: '', avatar: '' })
        fetchGroups()
      } else {
        const error = await res.json()
        alert(error.message || 'Xatolik yuz berdi')
      }
    } catch (error) {
      console.error('Guruh yaratishda xatolik:', error)
    }
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <div style={styles.loadingText}>Guruhlar yuklanmoqda...</div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Dekorativ doiralar */}
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
            <Link href="/forum" style={styles.navLink}>Forum</Link>
            <Link href="/groups" style={{...styles.navLink, ...styles.navLinkActive}}>Guruhlar</Link>
          </div>
          <div style={styles.authButtons}>
            {!session ? (
              <button onClick={() => router.push('/login')} style={styles.loginButton}>
                Kirish
              </button>
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
                </Link>
                <button onClick={() => setShowCreateForm(true)} style={styles.createButton}>
                  + Guruh yaratish
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main style={styles.main}>
        {/* Sarlavha */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.header}
        >
          <h1 style={styles.title}>Guruhlar</h1>
          <p style={styles.subtitle}>Qiziqishlaringiz bo'yicha guruhlarga qo'shiling va muloqot qiling</p>
        </motion.div>

        {/* Guruh yaratish formasi */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={styles.formContainer}
            >
              <h2 style={styles.formTitle}>Yangi guruh yaratish</h2>
              <form onSubmit={handleCreateGroup}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Guruh nomi *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Tavsif</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    style={styles.textarea}
                    rows={3}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Rasm URL</label>
                  <input
                    type="url"
                    value={formData.avatar}
                    onChange={(e) => setFormData({...formData, avatar: e.target.value})}
                    style={styles.input}
                    placeholder="https://example.com/group.jpg"
                  />
                </div>
                <div style={styles.formButtons}>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    style={styles.cancelButton}
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    style={styles.submitButton}
                  >
                    Yaratish
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Guruhlar grid */}
        <div style={styles.groupsGrid}>
          {groups.length > 0 ? (
            groups.map((group, index) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                style={styles.groupCard}
                onClick={() => router.push(`/groups/${group.id}`)}
              >
                <div style={styles.groupAvatar}>
                  {group.avatar ? (
                    <img src={group.avatar} alt={group.name} style={styles.avatarImage} />
                  ) : (
                    <span style={styles.avatarEmoji}>👥</span>
                  )}
                </div>
                <div style={styles.groupInfo}>
                  <h3 style={styles.groupName}>{group.name}</h3>
                  <p style={styles.groupDescription}>
                    {group.description || 'Tavsif yo\'q'}
                  </p>
                  <div style={styles.groupStats}>
                    <span style={styles.statItem}>
                      👥 {group._count.members} a'zo
                    </span>
                    <span style={styles.statItem}>
                      📝 {group._count.posts} post
                    </span>
                  </div>
                  <div style={styles.groupFooter}>
                    <span style={styles.createdBy}>
                      Yaratgan: {group.createdBy.name}
                    </span>
                    <span style={styles.joinButton}>Qo'shilish →</span>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>👥</span>
              <h3 style={styles.emptyTitle}>Hali guruhlar yo'q</h3>
              <p style={styles.emptyText}>
                {session ? 'Birinchi guruhni yarating!' : 'Guruhlarni ko\'rish uchun tizimga kiring'}
              </p>
              {session && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  style={styles.emptyButton}
                >
                  Guruh yaratish
                </button>
              )}
            </div>
          )}
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
    opacity: 0.2,
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
    opacity: 0.2,
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
    opacity: 0.1,
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
    color: '#667eea',
    textDecoration: 'none'
  },
  navLinks: {
    display: 'flex',
    gap: '2rem'
  },
  navLink: {
    color: '#4a5568',
    textDecoration: 'none',
    fontSize: '1rem',
    transition: 'color 0.2s'
  },
  navLinkActive: {
    color: '#667eea',
    fontWeight: '600'
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
    cursor: 'pointer'
  },
  userMenu: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
  },
  profileLink: {
    textDecoration: 'none'
  },
  avatarContainer: {
    width: '40px',
    height: '40px',
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
    fontSize: '1.2rem',
    fontWeight: 'bold'
  },
  createButton: {
    padding: '0.5rem 1rem',
    background: '#10b981',
    border: 'none',
    borderRadius: '30px',
    color: 'white',
    fontSize: '0.9rem',
    cursor: 'pointer'
  },
  main: {
    maxWidth: '1200px',
    margin: '2rem auto',
    padding: '0 2rem',
    position: 'relative' as const,
    zIndex: 10
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '3rem'
  },
  title: {
    fontSize: '3rem',
    color: 'white',
    marginBottom: '0.5rem'
  },
  subtitle: {
    fontSize: '1.2rem',
    color: 'rgba(255,255,255,0.9)'
  },
  formContainer: {
    background: 'white',
    borderRadius: '12px',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
  },
  formTitle: {
    fontSize: '1.5rem',
    color: '#2d3748',
    marginBottom: '1.5rem'
  },
  formGroup: {
    marginBottom: '1rem'
  },
  label: {
    display: 'block',
    fontSize: '0.9rem',
    color: '#4a5568',
    marginBottom: '0.25rem'
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    fontSize: '1rem'
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #e2e8f0',
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
    padding: '0.5rem 1rem',
    background: '#cbd5e0',
    border: 'none',
    borderRadius: '4px',
    color: '#2d3748',
    fontSize: '0.9rem',
    cursor: 'pointer'
  },
  submitButton: {
    padding: '0.5rem 1rem',
    background: '#667eea',
    border: 'none',
    borderRadius: '4px',
    color: 'white',
    fontSize: '0.9rem',
    cursor: 'pointer'
  },
  groupsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '2rem'
  },
  groupCard: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s',
    cursor: 'pointer'
  },
  groupAvatar: {
    height: '150px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const
  },
  avatarEmoji: {
    fontSize: '4rem'
  },
  groupInfo: {
    padding: '1.5rem'
  },
  groupName: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '0.5rem'
  },
  groupDescription: {
    fontSize: '0.95rem',
    color: '#718096',
    marginBottom: '1rem',
    lineHeight: '1.5'
  },
  groupStats: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem'
  },
  statItem: {
    fontSize: '0.85rem',
    color: '#a0aec0'
  },
  groupFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '1rem',
    borderTop: '1px solid #e2e8f0'
  },
  createdBy: {
    fontSize: '0.8rem',
    color: '#a0aec0'
  },
  joinButton: {
    fontSize: '0.9rem',
    color: '#667eea',
    fontWeight: '600'
  },
  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center' as const,
    padding: '4rem',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '12px'
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
    display: 'block'
  },
  emptyTitle: {
    fontSize: '1.5rem',
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
    cursor: 'pointer'
  }
}
