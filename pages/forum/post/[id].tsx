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
  _count?: {
    comments: number
    likes: number
  }
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
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)

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
      setLikeCount(data._count?.likes || 0)
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

  const handleLike = async () => {
    if (!session) {
      router.push('/login')
      return
    }

    try {
      const res = await fetch(`/api/forum/posts/${id}/like`, {
        method: 'POST'
      })

      if (res.ok) {
        setLiked(!liked)
        setLikeCount(liked ? likeCount - 1 : likeCount + 1)
      }
    } catch (error) {
      console.error('Like xatolik:', error)
    }
  }

  const renderComment = (comment: Comment, depth: number = 0) => {
    const maxDepth = 3
    
    return (
      <motion.div
        key={comment.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          ...styles.commentItem,
          marginLeft: depth * 24,
          borderLeft: depth > 0 ? '2px solid #e2e8f0' : 'none',
          paddingLeft: depth > 0 ? '16px' : '0',
          backgroundColor: depth > 0 ? '#f8fafc' : '#ffffff',
          borderRadius: '12px',
          marginTop: depth > 0 ? '8px' : '12px'
        }}
      >
        <div style={styles.commentHeader}>
          <div style={styles.commentAuthor}>
            <div style={{
              ...styles.commentAvatar,
              width: depth > 0 ? 28 : 36,
              height: depth > 0 ? 28 : 36
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
                  fontSize: depth > 0 ? '0.9rem' : '1rem'
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
            {session && depth < maxDepth && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setReplyingTo({ id: comment.id, name: comment.user.name })}
                style={styles.replyButton}
                title="Javob qaytarish"
              >
                ↩️
              </motion.button>
            )}
            {(session?.user?.email === post?.user.email || session?.user?.role === 'admin') && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleDeleteComment(comment.id)}
                style={styles.commentDeleteButton}
                title="O'chirish"
              >
                🗑️
              </motion.button>
            )}
          </div>
        </div>

        <p style={{
          ...styles.commentContent,
          fontSize: depth > 0 ? '0.9rem' : '0.95rem',
          marginLeft: depth > 0 ? 44 : 52
        }}>
          {comment.parentId && (
            <span style={styles.replyTo}>
              ↪️ 
            </span>
          )}
          {comment.content}
        </p>

        {replyingTo?.id === comment.id && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              ...styles.replyForm,
              marginLeft: depth > 0 ? 44 : 52
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
                {submitting ? '...' : 'Javob yozish'}
              </button>
            </div>
          </motion.div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div style={styles.repliesContainer}>
            {comment.replies.map(reply => renderComment(reply, depth + 1))}
          </div>
        )}
      </motion.div>
    )
  }

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
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/forum')}
          style={styles.backButton}
        >
          Forumga qaytish
        </motion.button>
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
      <div style={styles.circle4}></div>

      {/* Navigatsiya */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        style={styles.nav}
      >
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
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/login')}
                style={styles.loginButton}
              >
                Kirish
              </motion.button>
            ) : (
              <Link href="/profile" style={styles.profileLink}>
                <div style={styles.profileAvatar}>
                  {/* Tuzatilgan qism: session.user.image uchun type assertion */}
                  {(session.user as any)?.image ? (
                    <img src={(session.user as any).image} alt={session.user.name || ''} style={styles.avatarImage} />
                  ) : (
                    <span style={styles.avatarPlaceholder}>
                      {session.user.name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </Link>
            )}
          </div>
        </div>
      </motion.nav>

      <main style={styles.main}>
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          style={styles.breadcrumb}
        >
          <Link href="/" style={styles.breadcrumbLink}>Bosh sahifa</Link>
          <span style={styles.breadcrumbSeparator}>→</span>
          <Link href="/forum" style={styles.breadcrumbLink}>Forum</Link>
          <span style={styles.breadcrumbSeparator}>→</span>
          <span style={styles.breadcrumbCurrent}>{post.title}</span>
        </motion.div>

        {/* Post */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={styles.postCard}
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

            <div style={styles.postActions}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleLike}
                style={styles.likeButton}
              >
                {liked ? '❤️' : '🤍'} {likeCount}
              </motion.button>
              
              {(session?.user?.email === post.user.email || session?.user?.role === 'admin') && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsEditing(!isEditing)}
                    style={styles.editButton}
                  >
                    ✎
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDeletePost}
                    style={styles.deleteButton}
                  >
                    🗑️
                  </motion.button>
                </>
              )}
            </div>
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

          {/* Post stats */}
          <div style={styles.postStats}>
            <span style={styles.statItem}>
              <span style={styles.statIcon}>💬</span>
              {post.comments.length} ta comment
            </span>
          </div>
        </motion.div>

        {/* Comments section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={styles.commentsCard}
        >
          <h2 style={styles.commentsTitle}>
            Comments ({post.comments.length})
          </h2>

          {/* Comment form */}
          {session ? (
            <form onSubmit={handleComment} style={styles.commentForm}>
              {replyingTo && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={styles.replyingTo}
                >
                  <span>Javob qaytarilmoqda: <strong>{replyingTo.name}</strong></span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    style={styles.cancelReplyButton}
                  >
                    ❌
                  </motion.button>
                </motion.div>
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
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={submitting}
                  style={styles.commentSubmitButton}
                >
                  {submitting ? 'Yuborilmoqda...' : (replyingTo ? 'Javob yozish' : 'Yuborish')}
                </motion.button>
              </div>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={styles.loginPrompt}
            >
              <p style={styles.loginPromptText}>
                Comment qoldirish uchun{' '}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => router.push('/login')}
                  style={styles.loginLink}
                >
                  tizimga kiring
                </motion.button>
              </p>
            </motion.div>
          )}

          {/* Comments list */}
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
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'linear-gradient(45deg, #f093fb 0%, #f5576c 100%)',
    top: '-250px',
    right: '-100px',
    opacity: 0.2,
    animation: 'float 12s ease-in-out infinite'
  },
  circle2: {
    position: 'absolute' as const,
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)',
    bottom: '-200px',
    left: '-100px',
    opacity: 0.2,
    animation: 'float 15s ease-in-out infinite reverse'
  },
  circle3: {
    position: 'absolute' as const,
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'linear-gradient(45deg, #43e97b 0%, #38f9d7 100%)',
    top: '20%',
    right: '10%',
    opacity: 0.15,
    animation: 'pulse 8s ease-in-out infinite'
  },
  circle4: {
    position: 'absolute' as const,
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    background: 'linear-gradient(45deg, #fa709a 0%, #fee140 100%)',
    bottom: '15%',
    right: '15%',
    opacity: 0.15,
    animation: 'float 10s ease-in-out infinite'
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
    width: '60px',
    height: '60px',
    border: '4px solid rgba(255,255,255,0.3)',
    borderTop: '4px solid white',
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
    fontSize: '5rem',
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
    padding: '0.75rem 2rem',
    background: 'white',
    border: 'none',
    borderRadius: '30px',
    color: '#667eea',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '1rem',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
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
    fontSize: '1rem',
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
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '30px',
    color: 'white',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  profileLink: {
    textDecoration: 'none'
  },
  profileAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: '2px solid white',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  main: {
    maxWidth: '800px',
    margin: '2rem auto',
    padding: '0 2rem',
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
  postCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 20px 40px -15px rgba(0,0,0,0.2)'
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
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: '2px solid white',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
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
  likeButton: {
    padding: '0.5rem 1rem',
    background: 'none',
    border: '1px solid #e2e8f0',
    borderRadius: '30px',
    fontSize: '0.9rem',
    color: '#718096',
    cursor: 'pointer'
  },
  editButton: {
    padding: '0.5rem',
    background: '#4299e1',
    border: 'none',
    borderRadius: '30px',
    color: 'white',
    fontSize: '0.9rem',
    cursor: 'pointer',
    width: '36px',
    height: '36px'
  },
  deleteButton: {
    padding: '0.5rem',
    background: '#f56565',
    border: 'none',
    borderRadius: '30px',
    color: 'white',
    fontSize: '0.9rem',
    cursor: 'pointer',
    width: '36px',
    height: '36px'
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
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  textarea: {
    padding: '0.75rem',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none',
    resize: 'vertical' as const,
    transition: 'border-color 0.2s',
    minHeight: '150px'
  },
  formButtons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end'
  },
  cancelButton: {
    padding: '0.5rem 1.5rem',
    background: '#cbd5e0',
    border: 'none',
    borderRadius: '8px',
    color: '#2d3748',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  saveButton: {
    padding: '0.5rem 1.5rem',
    background: '#667eea',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  postContent: {
    lineHeight: '1.8'
  },
  postTitle: {
    fontSize: '2.2rem',
    color: '#2d3748',
    marginBottom: '1.5rem',
    fontWeight: '700',
    lineHeight: '1.3'
  },
  postBody: {
    fontSize: '1.1rem',
    color: '#4a5568',
    whiteSpace: 'pre-wrap' as const,
    lineHeight: '1.8'
  },
  postStats: {
    marginTop: '2rem',
    paddingTop: '1rem',
    borderTop: '2px solid #f0f0f0',
    display: 'flex',
    gap: '2rem'
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.95rem',
    color: '#718096'
  },
  statIcon: {
    fontSize: '1.2rem'
  },
  commentsCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '2rem',
    boxShadow: '0 20px 40px -15px rgba(0,0,0,0.2)'
  },
  commentsTitle: {
    fontSize: '1.5rem',
    color: '#2d3748',
    marginBottom: '1.5rem',
    fontWeight: '600'
  },
  commentForm: {
    marginBottom: '2rem'
  },
  replyingTo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    background: '#ebf8ff',
    borderRadius: '8px',
    marginBottom: '1rem'
  },
  cancelReplyButton: {
    background: 'none',
    border: 'none',
    fontSize: '1rem',
    cursor: 'pointer',
    marginLeft: 'auto',
    color: '#718096'
  },
  commentInput: {
    width: '100%',
    padding: '1rem',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '0.95rem',
    outline: 'none',
    resize: 'vertical' as const,
    marginBottom: '1rem',
    transition: 'border-color 0.2s'
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
    borderRadius: '30px',
    color: 'white',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  loginPrompt: {
    padding: '2rem',
    background: '#f7fafc',
    borderRadius: '12px',
    textAlign: 'center' as const,
    marginBottom: '2rem'
  },
  loginPromptText: {
    fontSize: '1rem',
    color: '#4a5568'
  },
  loginLink: {
    background: 'none',
    border: 'none',
    color: '#667eea',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '1rem',
    textDecoration: 'underline'
  },
  commentsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem'
  },
  commentItem: {
    padding: '1rem',
    background: '#ffffff',
    borderRadius: '12px',
    transition: 'all 0.2s'
  },
  commentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.5rem'
  },
  commentAuthor: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center'
  },
  commentAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
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
    fontSize: '1rem',
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
    fontSize: '0.75rem',
    color: '#a0aec0'
  },
  commentActions: {
    display: 'flex',
    gap: '0.5rem'
  },
  replyButton: {
    padding: '0.25rem',
    background: 'none',
    border: 'none',
    fontSize: '1.2rem',
    cursor: 'pointer',
    color: '#667eea',
    transition: 'transform 0.2s'
  },
  commentDeleteButton: {
    padding: '0.25rem',
    background: 'none',
    border: 'none',
    fontSize: '1.2rem',
    cursor: 'pointer',
    color: '#a0aec0',
    transition: 'color 0.2s'
  },
  commentContent: {
    fontSize: '0.95rem',
    color: '#4a5568',
    lineHeight: '1.6',
    marginLeft: '52px'
  },
  replyTo: {
    color: '#667eea',
    fontSize: '0.9rem',
    marginRight: '4px',
    opacity: 0.8
  },
  replyForm: {
    marginTop: '1rem',
    marginLeft: '52px',
    padding: '1rem',
    background: '#f8fafc',
    borderRadius: '12px'
  },
  replyInput: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '0.9rem',
    outline: 'none',
    resize: 'vertical' as const,
    marginBottom: '0.5rem',
    transition: 'border-color 0.2s'
  },
  replyFormButtons: {
    display: 'flex',
    gap: '0.5rem',
    justifyContent: 'flex-end'
  },
  replyCancelButton: {
    padding: '0.5rem 1rem',
    background: '#cbd5e0',
    border: 'none',
    borderRadius: '6px',
    color: '#2d3748',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  replySubmitButton: {
    padding: '0.5rem 1rem',
    background: '#667eea',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  repliesContainer: {
    marginTop: '0.5rem'
  },
  noComments: {
    padding: '3rem',
    textAlign: 'center' as const
  },
  noCommentsText: {
    fontSize: '1rem',
    color: '#a0aec0'
  }
}
