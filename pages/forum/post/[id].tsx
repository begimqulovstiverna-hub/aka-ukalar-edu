import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

interface Comment {
  id: string
  content: string
  createdAt: string
  parentId: string | null
  user: {
    name: string
    role: string
    image?: string
  }
  replies?: Comment[]
}

interface Post {
  id: string
  title: string
  content: string
  createdAt: string
  user: {
    name: string
    email: string
    role: string
    image?: string
  }
  course?: {
    title: string
  }
  comments: Comment[]
}

export default function PostDetail() {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = router.query
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<{id: string, name: string} | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (id) {
      fetchPost()
    }
  }, [id])

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/forum/posts/${id}`)
      const data = await res.json()
      setPost(data)
      setEditTitle(data.title)
      setEditContent(data.content)
    } catch (error) {
      console.error('Post yuklashda xatolik:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    setSubmitting(true)

    try {
      const res = await fetch('/api/forum/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: newComment, 
          postId: id,
          parentId: replyingTo?.id || null 
        })
      })

      if (res.ok) {
        setNewComment('')
        setReplyingTo(null)
        fetchPost()
      } else {
        const error = await res.json()
        alert(error.message || 'Xatolik yuz berdi')
      }
    } catch (error) {
      console.error('Comment qo\'shishda xatolik:', error)
      alert('Comment qo\'shishda xatolik yuz berdi')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReply = async (parentId: string) => {
    if (!replyContent.trim()) return
    setSubmitting(true)

    try {
      const res = await fetch('/api/forum/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: replyContent, 
          postId: id,
          parentId 
        })
      })

      if (res.ok) {
        setReplyContent('')
        setReplyingTo(null)
        fetchPost()
      } else {
        const error = await res.json()
        alert(error.message || 'Xatolik yuz berdi')
      }
    } catch (error) {
      console.error('Reply qo\'shishda xatolik:', error)
      alert('Reply qo\'shishda xatolik yuz berdi')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditPost = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch(`/api/forum/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle, content: editContent })
      })

      if (res.ok) {
        setIsEditing(false)
        fetchPost()
      } else {
        const error = await res.json()
        alert(error.message || 'Xatolik yuz berdi')
      }
    } catch (error) {
      console.error('Postni tahrirlashda xatolik:', error)
      alert('Postni tahrirlashda xatolik yuz berdi')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeletePost = async () => {
    if (!confirm('Bu postni o\'chirishni tasdiqlaysizmi?')) return

    try {
      const res = await fetch(`/api/forum/posts/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        alert('Post o\'chirildi')
        router.push('/forum')
      } else {
        const error = await res.json()
        alert(error.message || 'Xatolik yuz berdi')
      }
    } catch (error) {
      console.error('Post o\'chirishda xatolik:', error)
      alert('Post o\'chirishda xatolik yuz berdi')
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Bu commentni o\'chirishni tasdiqlaysizmi?')) return

    try {
      const res = await fetch(`/api/forum/comments/${commentId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        fetchPost()
      } else {
        const error = await res.json()
        alert(error.message || 'Xatolik yuz berdi')
      }
    } catch (error) {
      console.error('Comment o\'chirishda xatolik:', error)
      alert('Comment o\'chirishda xatolik yuz berdi')
    }
  }

const renderComment = (comment: Comment, depth: number = 0) => {
  // Maksimal 3 qavat reply (Telegram uslubida)
  const maxDepth = 3
  const currentDepth = Math.min(depth, maxDepth)
  
  return (
    <motion.div>
      key={comment.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        ...styles.commentItem,
        marginLeft: depth > 0 ? 12 : 0, // Faqat 12px margin
        borderLeft: depth > 0 ? '2px solid #e2e8f0' : 'none',
        paddingLeft: depth > 0 ? '12px' : '0',
        backgroundColor: depth > 0 ? '#f8fafc' : '#f7fafc',
        borderRadius: '8px',
        marginTop: depth > 0 ? '8px' : '12px'
      }}
    >
      {/* Comment header */}
      <div style={styles.commentHeader}>
        <div style={styles.commentAuthor}>
          <div style={{
            ...styles.commentAvatar,
            width: depth > 0 ? '24px' : '32px',
            height: depth > 0 ? '24px' : '32px',
            fontSize: depth > 0 ? '0.8rem' : '1rem'
          }}>
            {comment.user.image ? (
              <img src={comment.user.image} alt={comment.user.name} style={styles.avatarImage} />
            ) : (
              <span style={styles.avatarPlaceholder}>
                {comment.user.name?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div style={styles.commentAuthorInfo}>
            <div style={styles.commentAuthorNameWrapper}>
              <span style={{
                ...styles.commentAuthorName,
                fontSize: depth > 0 ? '0.85rem' : '0.95rem'
              }}>
                {comment.user.name}
              </span>
              {comment.user.role === 'admin' && (
                <span style={styles.commentAdminBadge}>Admin</span>
              )}
            </div>
            <span style={styles.commentDate}>
              {new Date(comment.createdAt).toLocaleDateString('uz-UZ', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>

        <div style={styles.commentActions}>
          {session && depth < maxDepth && ( // Maksimal 3 qavat reply
            <button
              onClick={() => setReplyingTo({ id: comment.id, name: comment.user.name })}
              style={styles.replyButton}
              title="Javob qaytarish"
            >
              ↩️
            </button>
          )}
          {(session?.user?.email === post?.user.email || session?.user?.role === 'admin') && (
            <button
              onClick={() => handleDeleteComment(comment.id)}
              style={styles.commentDeleteButton}
              title="O'chirish"
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      <p style={{
        ...styles.commentContent,
        fontSize: depth > 0 ? '0.9rem' : '0.95rem',
        marginLeft: depth > 0 ? '36px' : '42px'
      }}>
        {/* Reply bo'lsa, kimga javob qaytarilganini ko'rsatish */}
        {comment.parentId && (
          <span style={styles.replyTo}>
            ↪️ 
          </span>
        )}
        {comment.content}
      </p>

      {/* Reply formasi */}
      {replyingTo?.id === comment.id && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            ...styles.replyForm,
            marginLeft: depth > 0 ? '36px' : '42px'
          }}
        >
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder={`${comment.user.name}ga javob yozish...`}
            style={styles.replyInput}
            rows={2}
          />
          <div style={styles.replyFormButtons}>
            <button
              onClick={() => setReplyingTo(null)}
              style={styles.replyCancelButton}
            >
              Bekor qilish
            </button>
            <button
              onClick={() => handleReply(comment.id)}
              disabled={submitting}
              style={styles.replySubmitButton}
            >
              {submitting ? 'Yuborilmoqda...' : 'Javob yozish'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div style={styles.repliesContainer}>
          {comment.replies.map(reply => renderComment(reply, depth + 1))}
        </div>
      )}
    </motion.div>
  )
}
      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div style={styles.repliesContainer}>
          {comment.replies.map(reply => renderComment(reply, depth + 1))}
        </div>
      )}
    </motion.div>
  )

  // Commentlarni parent-child munosabatida tashkil qilish
  const organizeComments = (comments: Comment[]) => {
    const commentMap = new Map()
    const rootComments: Comment[] = []

    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] })
    })

    comments.forEach(comment => {
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId)
        if (parent) {
          parent.replies.push(commentMap.get(comment.id))
        }
      } else {
        rootComments.push(commentMap.get(comment.id))
      }
    })

    return rootComments
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <div style={styles.loadingText}>Post yuklanmoqda...</div>
      </div>
    )
  }

  if (!post) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>😕</div>
        <h2 style={styles.errorTitle}>Post topilmadi</h2>
        <p style={styles.errorText}>Soʻralgan post mavjud emas yoki oʻchirilgan.</p>
        <button onClick={() => router.push('/forum')} style={styles.backButton}>
          Forumga qaytish
        </button>
      </div>
    )
  }

  const organizedComments = organizeComments(post.comments)

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
        {/* Breadcrumb */}
        <div style={styles.breadcrumb}>
          <Link href="/" style={styles.breadcrumbLink}>Bosh sahifa</Link>
          <span style={styles.breadcrumbSeparator}>→</span>
          <Link href="/forum" style={styles.breadcrumbLink}>Forum</Link>
          <span style={styles.breadcrumbSeparator}>→</span>
          <span style={styles.breadcrumbCurrent}>{post.title}</span>
        </div>

        {/* Post */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={styles.postContainer}
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
                <div style={styles.authorNameWrapper}>
                  <span style={styles.authorName}>{post.user.name}</span>
                  {post.user.role === 'admin' && (
                    <span style={styles.adminBadge}>Admin</span>
                  )}
                </div>
                <div style={styles.postMeta}>
                  <span style={styles.postDate}>
                    {new Date(post.createdAt).toLocaleDateString('uz-UZ', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  {post.course && (
                    <>
                      <span style={styles.metaSeparator}>•</span>
                      <span style={styles.courseBadge}>{post.course.title}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Admin actions */}
            {(session?.user?.email === post.user.email || session?.user?.role === 'admin') && (
              <div style={styles.postActions}>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsEditing(!isEditing)}
                  style={styles.editButton}
                  title="Tahrirlash"
                >
                  ✎
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleDeletePost}
                  style={styles.deleteButton}
                  title="O'chirish"
                >
                  🗑️
                </motion.button>
              </div>
            )}
          </div>

          {/* Post content */}
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.form
                key="edit"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onSubmit={handleEditPost}
                style={styles.editForm}
              >
                <div style={styles.formGroup}>
                  <label style={styles.label}>Sarlavha</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Matn</label>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    style={styles.textarea}
                    rows={8}
                    required
                  />
                </div>
                <div style={styles.formButtons}>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    style={styles.cancelButton}
                    disabled={submitting}
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    style={styles.saveButton}
                    disabled={submitting}
                  >
                    {submitting ? 'Saqlanmoqda...' : 'Saqlash'}
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.div
                key="view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={styles.postContent}
              >
                <h1 style={styles.postTitle}>{post.title}</h1>
                <div style={styles.postBody}>{post.content}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Comments section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={styles.commentsContainer}
        >
          <h2 style={styles.commentsTitle}>
            Comments ({post.comments.length})
          </h2>

          {/* Comment form */}
          {session ? (
            <form onSubmit={handleComment} style={styles.commentForm}>
              {replyingTo && (
                <div style={styles.replyingTo}>
                  <span>Javob qaytarilmoqda: <strong>{replyingTo.name}</strong></span>
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    style={styles.cancelReplyButton}
                  >
                    ❌
                  </button>
                </div>
              )}
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={replyingTo ? `${replyingTo.name}ga javob yozish...` : "Comment yozing..."}
                style={styles.commentInput}
                rows={replyingTo ? 2 : 3}
                required
              />
              <div style={styles.commentFormFooter}>
                <span style={styles.commentHint}>
                  💡 Hurmatli munosabatda boʻling
                </span>
                <button
                  type="submit"
                  disabled={submitting}
                  style={styles.commentSubmitButton}
                >
                  {submitting ? 'Yuborilmoqda...' : (replyingTo ? 'Javob yozish' : 'Yuborish')}
                </button>
              </div>
            </form>
          ) : (
            <div style={styles.loginPrompt}>
              <p style={styles.loginPromptText}>
                Comment qoldirish uchun{' '}
                <button onClick={() => router.push('/login')} style={styles.loginLink}>
                  tizimga kiring
                </button>
              </p>
            </div>
          )}

          {/* Comments list with replies */}
          <div style={styles.commentsList}>
            <AnimatePresence>
              {organizedComments.length > 0 ? (
                organizedComments.map(comment => renderComment(comment))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={styles.noComments}
                >
                  <p style={styles.noCommentsText}>Hozircha hech qanday comment yo'q</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
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
  errorContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  errorIcon: {
    fontSize: '4rem',
    color: 'white'
  },
  errorTitle: {
    fontSize: '2rem',
    color: 'white',
    margin: 0
  },
  errorText: {
    fontSize: '1rem',
    color: 'rgba(255,255,255,0.8)',
    margin: 0
  },
  backButton: {
    padding: '0.75rem 1.5rem',
    background: 'white',
    border: 'none',
    borderRadius: '8px',
    color: '#667eea',
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: '1rem'
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
    maxWidth: '1000px',
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
    cursor: 'pointer'
  },
  registerButton: {
    padding: '0.5rem 1.5rem',
    background: '#667eea',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  userName: {
    padding: '0.5rem 1rem',
    background: 'rgba(102, 126, 234, 0.1)',
    borderRadius: '8px',
    color: '#667eea',
    fontWeight: '600'
  },
  main: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem',
    position: 'relative' as const,
    zIndex: 10
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '2rem',
    color: 'white'
  },
  breadcrumbLink: {
    color: 'rgba(255,255,255,0.8)',
    textDecoration: 'none',
    fontSize: '0.9rem'
  },
  breadcrumbSeparator: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.9rem'
  },
  breadcrumbCurrent: {
    color: 'white',
    fontSize: '0.9rem',
    fontWeight: '600'
  },
  postContainer: {
    background: 'white',
    borderRadius: '12px',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
  },
  postHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '2px solid #f0f0f0'
  },
  postAuthor: {
    display: 'flex',
    gap: '1rem'
  },
  authorAvatar: {
    width: '48px',
    height: '48px',
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
    flexDirection: 'column' as const,
    gap: '0.25rem'
  },
  authorNameWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  authorName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#2d3748'
  },
  adminBadge: {
    padding: '0.2rem 0.5rem',
    background: 'rgba(102, 126, 234, 0.1)',
    borderRadius: '20px',
    color: '#667eea',
    fontSize: '0.7rem',
    fontWeight: '600'
  },
  postMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
    color: '#a0aec0'
  },
  metaSeparator: {
    color: '#cbd5e0'
  },
  courseBadge: {
    padding: '0.2rem 0.5rem',
    background: '#ebf8ff',
    borderRadius: '20px',
    color: '#4299e1',
    fontSize: '0.7rem',
    fontWeight: '600'
  },
  postActions: {
    display: 'flex',
    gap: '0.5rem'
  },
  editButton: {
    padding: '0.5rem 1rem',
    background: '#4299e1',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    fontSize: '0.9rem',
    cursor: 'pointer'
  },
  deleteButton: {
    padding: '0.5rem 1rem',
    background: '#f56565',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    fontSize: '0.9rem',
    cursor: 'pointer'
  },
  editForm: {
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
    fontSize: '0.9rem',
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
    justifyContent: 'flex-end'
  },
  cancelButton: {
    padding: '0.5rem 1rem',
    background: '#cbd5e0',
    border: 'none',
    borderRadius: '6px',
    color: '#2d3748',
    fontSize: '0.9rem',
    cursor: 'pointer'
  },
  saveButton: {
    padding: '0.5rem 1rem',
    background: '#667eea',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    fontSize: '0.9rem',
    cursor: 'pointer'
  },
  postContent: {
    lineHeight: '1.8'
  },
  postTitle: {
    fontSize: '2rem',
    color: '#2d3748',
    marginBottom: '1rem'
  },
  postBody: {
    fontSize: '1rem',
    color: '#4a5568',
    whiteSpace: 'pre-wrap' as const
  },
  commentsContainer: {
    background: 'white',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
  },
  commentsTitle: {
    fontSize: '1.5rem',
    color: '#2d3748',
    marginBottom: '1.5rem',
    paddingBottom: '0.5rem',
    borderBottom: '2px solid #f0f0f0'
  },
  commentForm: {
    marginBottom: '2rem'
  },
  replyingTo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem',
    background: '#ebf8ff',
    borderRadius: '6px',
    marginBottom: '0.5rem'
  },
  cancelReplyButton: {
    background: 'none',
    border: 'none',
    fontSize: '1rem',
    cursor: 'pointer',
    marginLeft: 'auto'
  },
  commentInput: {
    width: '100%',
    padding: '0.75rem',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '0.95rem',
    outline: 'none',
    resize: 'vertical' as const,
    marginBottom: '0.5rem'
  },
  commentFormFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  commentHint: {
    fontSize: '0.85rem',
    color: '#a0aec0'
  },
  commentSubmitButton: {
    padding: '0.5rem 1.5rem',
    background: '#667eea',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    fontSize: '0.9rem',
    cursor: 'pointer'
  },
  loginPrompt: {
    padding: '1rem',
    background: '#f7fafc',
    borderRadius: '8px',
    textAlign: 'center' as const,
    marginBottom: '2rem'
  },
  loginPromptText: {
    fontSize: '0.95rem',
    color: '#4a5568'
  },
  loginLink: {
    background: 'none',
    border: 'none',
    color: '#667eea',
    textDecoration: 'underline',
    cursor: 'pointer',
    fontSize: '0.95rem'
  },
  commentsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem'
  },
  commentItem: {
    padding: '1rem',
    background: '#f7fafc',
    borderRadius: '8px'
  },
  commentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.5rem'
  },
  commentAuthor: {
    display: 'flex',
    gap: '0.75rem'
  },
  commentAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'  // TUZATILDI: string to'liq yozildi
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
  commentAuthorInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.1rem'
  },
  commentAuthorNameWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  commentAuthorName: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#2d3748'
  },
  commentAdminBadge: {
    padding: '0.1rem 0.4rem',
    background: 'rgba(102, 126, 234, 0.1)',
    borderRadius: '20px',
    color: '#667eea',
    fontSize: '0.65rem',
    fontWeight: '600'
  },
  commentDate: {
    fontSize: '0.7rem',
    color: '#a0aec0'
  },
  commentActions: {
    display: 'flex',
    gap: '0.5rem'
  },
  replyButton: {
    padding: '0.25rem 0.5rem',
    background: 'none',
    border: 'none',
    fontSize: '1rem',
    cursor: 'pointer',
    color: '#667eea'
  },
  commentDeleteButton: {
    padding: '0.25rem 0.5rem',
    background: 'none',
    border: 'none',
    fontSize: '1rem',
    cursor: 'pointer',
    color: '#a0aec0'
  },
  commentContent: {
    fontSize: '0.95rem',
    color: '#4a5568',
    lineHeight: '1.6',
    marginLeft: '2.75rem'
  },
  replyForm: {
    marginTop: '1rem',
    marginLeft: '2.75rem',
    padding: '1rem',
    background: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  replyInput: {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '0.9rem',
    outline: 'none',
    resize: 'vertical' as const,
    marginBottom: '0.5rem'
  },
  replyFormButtons: {
    display: 'flex',
    gap: '0.5rem',
    justifyContent: 'flex-end'
  },
  replyCancelButton: {
    padding: '0.25rem 1rem',
    background: '#cbd5e0',
    border: 'none',
    borderRadius: '6px',
    color: '#2d3748',
    fontSize: '0.85rem',
    cursor: 'pointer'
  },
  replySubmitButton: {
    padding: '0.25rem 1rem',
    background: '#667eea',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    fontSize: '0.85rem',
    cursor: 'pointer'
  },
  repliesContainer: {
    marginTop: '1rem'
  },
  noComments: {
    padding: '2rem',
    textAlign: 'center' as const
  },
  noCommentsText: {
    fontSize: '0.95rem',
    color: '#a0aec0'
  }
}
