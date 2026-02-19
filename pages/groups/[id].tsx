import { useState, useEffect, useRef } from 'react'
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
    image: string | null
  }
  settings: {
    onlyAdminsCanPost: boolean
    joinRequiresApproval: boolean
  }
  members: GroupMember[]
  posts: GroupPost[]
  isMember: boolean
  memberRole: string | null
  _count: {
    members: number
    posts: number
  }
}

interface GroupMember {
  id: string
  role: string
  joinedAt: string
  user: {
    id: string
    name: string
    email: string
    image: string | null
    role: string
  }
}

interface GroupPost {
  id: string
  content: string
  media: string | null
  pinned: boolean
  createdAt: string
  user: {
    id: string
    name: string
    image: string | null
    role: string
  }
  comments: GroupComment[]
  reactions: GroupReaction[]
  _count?: {
    comments: number
    reactions: number
  }
}

interface GroupComment {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    name: string
    image: string | null
    role: string
  }
  reactions: GroupReaction[]
}

interface GroupReaction {
  id: string
  type: string
  userId: string
}

export default function GroupDetail() {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = router.query
  const [group, setGroup] = useState<Group | null>(null)
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<GroupPost[]>([])
  const [newPost, setNewPost] = useState('')
  const [replyTo, setReplyTo] = useState<{id: string, name: string} | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [showMembers, setShowMembers] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (id) {
      fetchGroup()
      fetchPosts()
    }
  }, [id])

  useEffect(() => {
    scrollToBottom()
  }, [posts])

  const fetchGroup = async () => {
    try {
      const res = await fetch(`/api/groups/${id}`)
      const data = await res.json()
      setGroup(data)
    } catch (error) {
      console.error('Guruh yuklashda xatolik:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPosts = async () => {
    try {
      const res = await fetch(`/api/groups/${id}/posts`)
      const data = await res.json()
      setPosts(data)
    } catch (error) {
      console.error('Postlarni yuklashda xatolik:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleJoinGroup = async () => {
    try {
      const res = await fetch(`/api/groups/${id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (res.ok) {
        fetchGroup()
      } else {
        const error = await res.json()
        alert(error.message || 'Xatolik yuz berdi')
      }
    } catch (error) {
      console.error('Qo\'shilishda xatolik:', error)
    }
  }

  const handleLeaveGroup = async () => {
    if (!confirm('Guruhni tark etmoqchimisiz?')) return

    try {
      const res = await fetch(`/api/groups/${id}/members/${session?.user?.id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        router.push('/groups')
      } else {
        const error = await res.json()
        alert(error.message || 'Xatolik yuz berdi')
      }
    } catch (error) {
      console.error('Chiqishda xatolik:', error)
    }
  }

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPost.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/groups/${id}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newPost })
      })

      if (res.ok) {
        setNewPost('')
        fetchPosts()
      } else {
        const error = await res.json()
        alert(error.message || 'Xatolik yuz berdi')
      }
    } catch (error) {
      console.error('Post yaratishda xatolik:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddComment = async (postId: string) => {
    if (!replyContent.trim() || !replyTo) return

    try {
      const res = await fetch(`/api/groups/${id}/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: replyContent,
          parentId: replyTo.id 
        })
      })

      if (res.ok) {
        setReplyContent('')
        setReplyTo(null)
        fetchPosts()
      } else {
        const error = await res.json()
        alert(error.message || 'Xatolik yuz berdi')
      }
    } catch (error) {
      console.error('Comment qo\'shishda xatolik:', error)
    }
  }

  const handleReaction = async (postId: string, type: string) => {
    try {
      const res = await fetch(`/api/groups/${id}/posts/${postId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      })

      if (res.ok) {
        fetchPosts()
      }
    } catch (error) {
      console.error('Reaction qo\'shishda xatolik:', error)
    }
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <div style={styles.loadingText}>Guruh yuklanmoqda...</div>
      </div>
    )
  }

  if (!group) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>😕</div>
        <h2 style={styles.errorTitle}>Guruh topilmadi</h2>
        <p style={styles.errorText}>Soʻralgan guruh mavjud emas yoki oʻchirilgan.</p>
        <button onClick={() => router.push('/groups')} style={styles.backButton}>
          Guruhlar sahifasiga qaytish
        </button>
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
            )}
          </div>
        </div>
      </nav>

      <main style={styles.main}>
        {/* Guruh header */}
        <div style={styles.groupHeader}>
          <div style={styles.groupInfo}>
            <div style={styles.groupAvatar}>
              {group.avatar ? (
                <img src={group.avatar} alt={group.name} style={styles.groupAvatarImage} />
              ) : (
                <span style={styles.groupAvatarEmoji}>👥</span>
              )}
            </div>
            <div style={styles.groupDetails}>
              <h1 style={styles.groupName}>{group.name}</h1>
              <p style={styles.groupDescription}>{group.description || 'Tavsif yo\'q'}</p>
              <div style={styles.groupStats}>
                <span style={styles.statItem}>👥 {group._count.members} a'zo</span>
                <span style={styles.statItem}>📝 {group._count.posts} post</span>
                <span style={styles.statItem}>📅 {new Date(group.createdAt).toLocaleDateString('uz-UZ')}</span>
              </div>
            </div>
          </div>

          <div style={styles.groupActions}>
            {!group.isMember ? (
              <button onClick={handleJoinGroup} style={styles.joinButton}>
                Guruhga qo'shilish
              </button>
            ) : (
              <>
                <button onClick={() => setShowMembers(!showMembers)} style={styles.membersButton}>
                  👥 A'zolar ({group._count.members})
                </button>
                {(group.memberRole === 'admin' || session?.user?.role === 'admin' || session?.user?.role === 'creator') && (
                  <button onClick={() => setShowSettings(!showSettings)} style={styles.settingsButton}>
                    ⚙️ Sozlamalar
                  </button>
                )}
                <button onClick={handleLeaveGroup} style={styles.leaveButton}>
                  🚪 Chiqish
                </button>
              </>
            )}
          </div>
        </div>

        {/* A'zolar paneli */}
        <AnimatePresence>
          {showMembers && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={styles.membersPanel}
            >
              <h3 style={styles.panelTitle}>Guruh a'zolari</h3>
              <div style={styles.membersList}>
                {group.members.map((member) => (
                  <div key={member.id} style={styles.memberItem}>
                    <div style={styles.memberAvatar}>
                      {member.user.image ? (
                        <img src={member.user.image} alt={member.user.name} style={styles.memberAvatarImage} />
                      ) : (
                        <span style={styles.memberAvatarPlaceholder}>
                          {member.user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div style={styles.memberInfo}>
                      <span style={styles.memberName}>{member.user.name}</span>
                      <span style={styles.memberRole}>
                        {member.role === 'admin' || member.role === 'creator' ? '👑 Admin' : "👤 A'zo"}
                      </span>
                    </div>
                    <span style={styles.memberJoined}>
                      {new Date(member.joinedAt).toLocaleDateString('uz-UZ')}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sozlamalar paneli */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={styles.settingsPanel}
            >
              <h3 style={styles.panelTitle}>Guruh sozlamalari</h3>
              <div style={styles.settingsList}>
                <label style={styles.settingItem}>
                  <input
                    type="checkbox"
                    checked={group.settings.onlyAdminsCanPost}
                    onChange={() => {}}
                  />
                  <span>Faqat adminlar post yozishi mumkin</span>
                </label>
                <label style={styles.settingItem}>
                  <input
                    type="checkbox"
                    checked={group.settings.joinRequiresApproval}
                    onChange={() => {}}
                  />
                  <span>Qo'shilish uchun tasdiq kerak</span>
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Post yozish formasi (faqat a'zolar uchun) */}
        {group.isMember && (!group.settings.onlyAdminsCanPost || group.memberRole === 'admin') && (
          <form onSubmit={handleCreatePost} style={styles.postForm}>
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Xabar yozish..."
              style={styles.postInput}
              rows={3}
            />
            <div style={styles.postFormFooter}>
              <span style={styles.postHint}>💬 Guruh a'zolari ko'rishi mumkin</span>
              <button
                type="submit"
                disabled={submitting}
                style={styles.postButton}
              >
                {submitting ? 'Yuborilmoqda...' : 'Yuborish'}
              </button>
            </div>
          </form>
        )}

        {/* Postlar */}
        <div style={styles.postsList}>
          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} style={styles.postCard}>
                <div style={styles.postHeader}>
                  <div style={styles.postAuthor}>
                    <div style={styles.postAuthorAvatar}>
                      {post.user.image ? (
                        <img src={post.user.image} alt={post.user.name} style={styles.postAvatarImage} />
                      ) : (
                        <span style={styles.postAvatarPlaceholder}>
                          {post.user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div style={styles.postAuthorInfo}>
                      <span style={styles.postAuthorName}>{post.user.name}</span>
                      {(post.user.role === 'admin' || post.user.role === 'creator') && (
                        <span style={styles.postAdminBadge}>Admin</span>
                      )}
                      <span style={styles.postDate}>
                        {new Date(post.createdAt).toLocaleString('uz-UZ', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: 'numeric',
                          month: 'short'
                        })}
                      </span>
                    </div>
                  </div>
                  {post.pinned && <span style={styles.pinnedBadge}>📌</span>}
                </div>

                <p style={styles.postContent}>{post.content}</p>

                {/* Reactions */}
                <div style={styles.reactionsBar}>
                  {['👍', '❤️', '😂', '😮', '😢', '😡'].map((reaction) => {
                    const count = post.reactions?.filter(r => r.type === reaction).length || 0
                    return (
                      <button
                        key={reaction}
                        onClick={() => handleReaction(post.id, reaction)}
                        style={styles.reactionButton}
                      >
                        <span style={styles.reactionEmoji}>{reaction}</span>
                        {count > 0 && <span style={styles.reactionCount}>{count}</span>}
                      </button>
                    )
                  })}
                </div>

                {/* Commentlar */}
                {post.comments && post.comments.length > 0 && (
                  <div style={styles.commentsList}>
                    {post.comments.map((comment) => (
                      <div key={comment.id} style={styles.commentItem}>
                        <div style={styles.commentHeader}>
                          <span style={styles.commentAuthor}>{comment.user.name}</span>
                          <span style={styles.commentDate}>
                            {new Date(comment.createdAt).toLocaleTimeString('uz-UZ', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p style={styles.commentContent}>{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Comment yozish */}
                {group.isMember && (
                  <div style={styles.commentForm}>
                    <input
                      type="text"
                      placeholder="Comment yozish..."
                      value={replyTo?.id === post.id ? replyContent : ''}
                      onChange={(e) => {
                        setReplyTo({ id: post.id, name: '' })
                        setReplyContent(e.target.value)
                      }}
                      onFocus={() => setReplyTo({ id: post.id, name: '' })}
                      style={styles.commentInput}
                    />
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={styles.emptyState}>
              <p style={styles.emptyText}>Hali hech qanday xabar yo'q</p>
            </div>
          )}
          <div ref={messagesEndRef} />
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
    padding: '0.75rem 2rem',
    background: 'white',
    border: 'none',
    borderRadius: '8px',
    color: '#667eea',
    fontSize: '1rem',
    cursor: 'pointer'
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
  main: {
    maxWidth: '800px',
    margin: '2rem auto',
    padding: '0 2rem',
    position: 'relative' as const,
    zIndex: 10
  },
  groupHeader: {
    background: 'rgba(255,255,255,0.95)',
    borderRadius: '12px',
    padding: '2rem',
    marginBottom: '1rem'
  },
  groupInfo: {
    display: 'flex',
    gap: '2rem',
    marginBottom: '1rem'
  },
  groupAvatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    overflow: 'hidden',
    background: '#667eea',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  groupAvatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const
  },
  groupAvatarEmoji: {
    fontSize: '3rem'
  },
  groupDetails: {
    flex: 1
  },
  groupName: {
    fontSize: '2rem',
    color: '#2d3748',
    marginBottom: '0.5rem'
  },
  groupDescription: {
    fontSize: '1rem',
    color: '#718096',
    marginBottom: '0.5rem'
  },
  groupStats: {
    display: 'flex',
    gap: '1rem'
  },
  statItem: {
    fontSize: '0.9rem',
    color: '#a0aec0'
  },
  groupActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end'
  },
  joinButton: {
    padding: '0.5rem 2rem',
    background: '#10b981',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '1rem',
    cursor: 'pointer'
  },
  membersButton: {
    padding: '0.5rem 1rem',
    background: '#667eea',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '0.9rem',
    cursor: 'pointer'
  },
  settingsButton: {
    padding: '0.5rem 1rem',
    background: '#f59e0b',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '0.9rem',
    cursor: 'pointer'
  },
  leaveButton: {
    padding: '0.5rem 1rem',
    background: '#dc2626',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '0.9rem',
    cursor: 'pointer'
  },
  membersPanel: {
    background: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1rem'
  },
  panelTitle: {
    fontSize: '1.2rem',
    color: '#2d3748',
    marginBottom: '1rem'
  },
  membersList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    maxHeight: '300px',
    overflowY: 'auto' as const
  },
  memberItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.5rem',
    borderRadius: '8px',
    transition: 'background 0.2s'
  },
  memberAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    overflow: 'hidden',
    background: '#667eea'
  },
  memberAvatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const
  },
  memberAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '1.2rem',
    fontWeight: 'bold'
  },
  memberInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const
  },
  memberName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#2d3748'
  },
  memberRole: {
    fontSize: '0.8rem',
    color: '#718096'
  },
  memberJoined: {
    fontSize: '0.8rem',
    color: '#a0aec0'
  },
  settingsPanel: {
    background: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1rem'
  },
  settingsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem'
  },
  settingItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer'
  },
  postForm: {
    background: 'white',
    borderRadius: '12px',
    padding: '1rem',
    marginBottom: '1rem'
  },
  postInput: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none',
    resize: 'vertical' as const,
    marginBottom: '0.5rem'
  },
  postFormFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  postHint: {
    fontSize: '0.85rem',
    color: '#a0aec0'
  },
  postButton: {
    padding: '0.5rem 1.5rem',
    background: '#667eea',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '0.9rem',
    cursor: 'pointer'
  },
  postsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem'
  },
  postCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '1rem'
  },
  postHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem'
  },
  postAuthor: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center'
  },
  postAuthorAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    overflow: 'hidden',
    background: '#667eea'
  },
  postAvatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const
  },
  postAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '1.2rem',
    fontWeight: 'bold'
  },
  postAuthorInfo: {
    display: 'flex',
    flexDirection: 'column' as const
  },
  postAuthorName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#2d3748'
  },
  postAdminBadge: {
    fontSize: '0.7rem',
    padding: '0.1rem 0.3rem',
    background: '#667eea',
    color: 'white',
    borderRadius: '4px',
    marginLeft: '0.5rem'
  },
  postDate: {
    fontSize: '0.7rem',
    color: '#a0aec0'
  },
  pinnedBadge: {
    fontSize: '1.2rem'
  },
  postContent: {
    fontSize: '1rem',
    color: '#4a5568',
    marginBottom: '0.5rem',
    lineHeight: '1.5'
  },
  reactionsBar: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '0.5rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid #e2e8f0'
  },
  reactionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    background: '#f7fafc',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer'
  },
  reactionEmoji: {
    fontSize: '1.2rem'
  },
  reactionCount: {
    fontSize: '0.8rem',
    color: '#718096'
  },
  commentsList: {
    marginTop: '0.5rem',
    paddingLeft: '1rem',
    borderLeft: '2px solid #e2e8f0'
  },
  commentItem: {
    marginBottom: '0.5rem'
  },
  commentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.25rem'
  },
  commentAuthor: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#2d3748'
  },
  commentDate: {
    fontSize: '0.7rem',
    color: '#a0aec0'
  },
  commentContent: {
    fontSize: '0.9rem',
    color: '#4a5568'
  },
  commentForm: {
    marginTop: '0.5rem'
  },
  commentInput: {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #e2e8f0',
    borderRadius: '20px',
    fontSize: '0.9rem',
    outline: 'none'
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '3rem',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '12px'
  },
  emptyText: {
    fontSize: '1rem',
    color: 'white'
  }
}
