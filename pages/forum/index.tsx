import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Navbar from '../../components/Navbar'   // ✅ Navbar import qilindi

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
  _count?: {
    comments: number
    likes: number
  }
}

export default function Forum() {
  const { data: session } = useSession()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/forum/posts')
      const data = await res.json()
      setPosts(data)
    } catch (error) {
      console.error('Xatolik:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <div style={styles.loadingText}>Yuklanmoqda...</div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Dekorativ doiralar */}
      <div style={styles.circle1}></div>
      <div style={styles.circle2}></div>
      <div style={styles.circle3}></div>

      {/* ✅ Navbar */}
      <Navbar />

      <main style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>Forum</h1>
          <p style={styles.subtitle}>Savol-javoblar va muhokamalar</p>
        </div>

        <div style={styles.posts}>
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={styles.postCard}
              onClick={() => router.push(`/forum/post/${post.id}`)}
            >
              <div style={styles.postHeader}>
                <div style={styles.postAuthor}>
                  {post.user.image ? (
                    <img src={post.user.image} alt={post.user.name} style={styles.avatar} />
                  ) : (
                    <div style={styles.avatarPlaceholder}>
                      {post.user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span style={styles.authorName}>{post.user.name}</span>
                </div>
                <span style={styles.postDate}>
                  {new Date(post.createdAt).toLocaleDateString('uz-UZ')}
                </span>
              </div>

              <h3 style={styles.postTitle}>{post.title}</h3>
              <p style={styles.postContent}>
                {post.content.length > 200
                  ? `${post.content.substring(0, 200)}...`
                  : post.content}
              </p>

              <div style={styles.postFooter}>
                <span style={styles.commentCount}>
                  💬 {post._count?.comments || 0}
                </span>
                <span style={styles.readMore}>Batafsil →</span>
              </div>
            </motion.div>
          ))}

          {posts.length === 0 && (
            <div style={styles.emptyState}>
              <p style={styles.emptyText}>Hozircha hech qanday post yo‘q</p>
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
  // Navigatsiya stillari olib tashlandi (Navbar komponenti boshqaradi)
  main: {
    maxWidth: '900px',
    margin: '2rem auto',
    padding: '2rem',
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
  posts: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem'
  },
  postCard: {
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    padding: '1.5rem',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s'
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
    gap: '0.5rem'
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    objectFit: 'cover' as const
  },
  avatarPlaceholder: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#667eea',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    fontWeight: 'bold'
  },
  authorName: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#2d3748'
  },
  postDate: {
    fontSize: '0.8rem',
    color: '#718096'
  },
  postTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: '0.5rem'
  },
  postContent: {
    fontSize: '1rem',
    color: '#4a5568',
    marginBottom: '1rem',
    lineHeight: '1.6'
  },
  postFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '1rem',
    borderTop: '1px solid #e2e8f0'
  },
  commentCount: {
    fontSize: '0.9rem',
    color: '#718096'
  },
  readMore: {
    fontSize: '0.9rem',
    color: '#667eea',
    fontWeight: '600'
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '3rem',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '12px'
  },
  emptyText: {
    fontSize: '1.2rem',
    color: 'white'
  }
}
