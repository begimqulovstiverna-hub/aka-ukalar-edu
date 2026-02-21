import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../../components/Navbar'   // ✅ Navbar import qilindi

// Importlardan keyin qo'shing (taxminan 5-10-qatorlar atrofida)

interface CourseWithPayment {
  id: string
  title: string
  description: string | null
  price: number | null
  image: string | null
  startDate?: string | null
}

interface EnrollmentWithPayment {
  id: string
  status: string
  createdAt: string
  paidAt?: string | null
  dueDate?: string | null
  amount: number | null
  course: CourseWithPayment
}

interface Enrollment {
  id: string
  status: string
  createdAt: string
  course: {
    id: string
    title: string
    description: string | null
    price: number | null
    image: string | null
  }
}

interface Post {
  id: string
  title: string
  content: string
  createdAt: string
  course?: {
    title: string
  }
  _count?: {
    comments: number
  }
}

interface Comment {
  id: string
  content: string
  createdAt: string
  post: {
    id: string
    title: string
  }
}

interface Payment {
  id: string
  amount: number
  currency: string
  status: string
  provider: string
  createdAt: string
  paidAt: string | null
  course: {
    id: string
    title: string
    price: number
  }
}

interface Purchase {
  id: string
  createdAt: string
  expiresAt: string | null
  course: {
    id: string
    title: string
    price: number
    image: string | null
  }
  payment: Payment
}

export default function Profile() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('courses')
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [image, setImage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [totalSpent, setTotalSpent] = useState(0)
  const [deletingImage, setDeletingImage] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      fetchUserData()
      setName(session.user.name || '')
      setImage((session.user as any)?.image || '')
    }
  }, [session])

  const fetchUserData = async () => {
    try {
      const [enrollmentsRes, postsRes, commentsRes, paymentsRes, purchasesRes] = await Promise.all([
        fetch('/api/enrollments'),
        fetch('/api/forum/posts?userId=' + session?.user?.id),
        fetch('/api/forum/comments?userId=' + session?.user?.id),
        fetch('/api/payments?userId=' + session?.user?.id),
        fetch('/api/purchases?userId=' + session?.user?.id)
      ])

      const enrollmentsData = await enrollmentsRes.json()
      const postsData = await postsRes.json()
      const commentsData = await commentsRes.json()
      const paymentsData = await paymentsRes.json()
      const purchasesData = await purchasesRes.json()

      setEnrollments(enrollmentsData)
      setPosts(postsData)
      setComments(commentsData)
      setPayments(paymentsData)
      setPurchases(purchasesData)
      
      const total = paymentsData
        .filter((p: Payment) => p.status === 'paid')
        .reduce((sum: number, p: Payment) => sum + p.amount, 0)
      setTotalSpent(total)
    } catch (error) {
      console.error('Maʼlumotlarni yuklashda xatolik:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteImage = async () => {
    if (!confirm('Profil rasmini oʻchirishni tasdiqlaysizmi?')) return

    setDeletingImage(true)
    try {
      const res = await fetch('/api/user/delete-avatar', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await res.json()

      if (res.ok) {
        setImage('')
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        alert(data.message || 'Xatolik yuz berdi')
      }
    } catch (error) {
      console.error('Rasm oʻchirishda xatolik:', error)
      alert('Rasm oʻchirishda xatolik yuz berdi')
    } finally {
      setDeletingImage(false)
    }
  }

  const handleClickPayment = async (courseId: string, amount: number | null) => {
    if (!amount) {
      alert('Bu kurs bepul');
      return;
    }
    
    try {
      setLoading(true);
      const res = await fetch('/api/payments/create-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          amount,
          userId: session?.user?.id
        })
      });
      
      const data = await res.json();
      
      if (res.ok && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        alert('Xatolik yuz berdi: ' + data.message);
      }
    } catch (error) {
      console.error('Click to\'lovda xatolik:', error);
      alert('To\'lovni boshlashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleOfflinePayment = async (enrollmentId: string) => {
    if (!confirm('Adminga to\'lov qilganingizni tasdiqlaysizmi?')) return;
    
    try {
      setLoading(true);
      const res = await fetch('/api/payments/offline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollmentId,
          userId: session?.user?.id
        })
      });
      
      if (res.ok) {
        alert('✅ To\'lov ma\'lumoti yuborildi. Admin tekshirib tasdiqlaydi.');
        fetchUserData();
      } else {
        const data = await res.json();
        alert(data.message || 'Xatolik yuz berdi');
      }
    } catch (error) {
      console.error('Offline to\'lovda xatolik:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('avatar', file)

    try {
      const res = await fetch('/api/user/upload-avatar', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (res.ok) {
        setImage(data.imageUrl)
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        alert(data.message || 'Xatolik yuz berdi')
      }
    } catch (error) {
      console.error('Rasm yuklashda xatolik:', error)
      alert('Rasm yuklashda xatolik yuz berdi')
    } finally {
      setUploading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, image })
      })

      if (res.ok) {
        setEditing(false)
        window.location.reload()
      } else {
        alert('Xatolik yuz berdi')
      }
    } catch (error) {
      console.error('Profilyangilashda xatolik:', error)
    }
  }

  if (status === 'loading' || loading) {
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
        {/* Profil header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={styles.profileHeader}
        >
          <div style={styles.profileImageContainer}>
            {image || (session?.user as any)?.image ? (
              <img 
                src={image || (session?.user as any)?.image || ''}
                alt={session?.user?.name || ''} 
                style={styles.profileImage}
                onError={(e) => {
                  console.error('Rasm yuklanmadi:', e.currentTarget.src)
                }}
                onLoad={() => console.log('Rasm yuklandi')}
              />
            ) : (
              <div style={styles.profileImagePlaceholder}>
                {session?.user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            
            {/* Yuklash tugmasi - pastki chap */}
            <label htmlFor="avatar-upload" style={styles.uploadButtonWrapper}>
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={styles.uploadButton}
                title="Rasm yuklash"
              >
                {uploading ? '⏳' : '📷'}
              </motion.div>
            </label>
            
            {/* O'chirish tugmasi - pastki o'ng */}
            {(image || (session?.user as any)?.image) && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleDeleteImage}
                style={styles.deleteButton}
                title="Rasmni o'chirish"
                disabled={deletingImage}
              >
                {deletingImage ? '⏳' : '🗑️'}
              </motion.button>
            )}
          </div>
          <div style={styles.profileInfo}>
            <motion.h1 
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              style={styles.profileName}
            >
              {session?.user?.name}
            </motion.h1>
            <motion.p 
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              transition={{ delay: 0.1 }}
              style={styles.profileEmail}
            >
              {session?.user?.email}
            </motion.p>
            <motion.p 
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              transition={{ delay: 0.2 }}
              style={styles.profileRole}
            >
              {session?.user?.role === 'admin' ? '👑 Administrator' : session?.user?.role === 'creator' ? '⭐ Creator' : '👤 Oʻquvchi'}
            </motion.p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setEditing(!editing)}
              style={styles.editButton}
            >
              {editing ? '✕ Bekor qilish' : '✎ Profilni tahrirlash'}
            </motion.button>
                         
             {session?.user?.role === 'creator' && (
               <Link href="/admin/users" style={styles.adminLink}>
                 👥 Foydalanuvchilarni boshqarish
               </Link>
              )}


          </div>
        </motion.div>

        {/* Tahrirlash formasi */}
        <AnimatePresence>
          {editing && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              style={styles.editForm}
            >
              <h2 style={styles.editTitle}>Profilni tahrirlash</h2>
              <form onSubmit={handleUpdateProfile}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Ism</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Rasm URL</label>
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    style={styles.input}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  style={styles.saveButton}
                >
                  Saqlash
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={styles.tabs}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('courses')}
            style={{
              ...styles.tab,
              ...(activeTab === 'courses' ? styles.tabActive : {})
            }}
          >
            📚 Kurslar ({enrollments.length})
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('posts')}
            style={{
              ...styles.tab,
              ...(activeTab === 'posts' ? styles.tabActive : {})
            }}
          >
            📝 Postlar ({posts.length})
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('comments')}
            style={{
              ...styles.tab,
              ...(activeTab === 'comments' ? styles.tabActive : {})
            }}
          >
            💬 Commentlar ({comments.length})
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('payments')}
            style={{
              ...styles.tab,
              ...(activeTab === 'payments' ? styles.tabActive : {})
            }}
          >
            💰 To'lovlar ({payments.length})
          </motion.button>
        </motion.div>

        {/* Tab content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          style={styles.tabContent}
        >
          {activeTab === 'courses' && (
            <div style={styles.coursesGrid}>
              {enrollments.length > 0 ? (
                enrollments.map((enrollment, index) => (
                  <motion.div
                    key={enrollment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    style={styles.courseCardWrapper}
                  >
                    <Link href={`/courses/${enrollment.course.id}`} style={styles.courseCard}>
                      <div style={styles.courseImage}>
                        {enrollment.course.image ? (
                          <img src={enrollment.course.image} alt={enrollment.course.title} style={styles.courseImg} />
                        ) : (
                          <span style={styles.courseEmoji}>📚</span>
                        )}
                      </div>
                      <div style={styles.courseInfo}>
                        <h3 style={styles.courseTitle}>{enrollment.course.title}</h3>
                        <p style={styles.courseDate}>
                          {new Date(enrollment.createdAt).toLocaleDateString('uz-UZ', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                        <span style={enrollment.course.price ? styles.coursePrice : styles.courseFree}>
                          {enrollment.course.price ? `${enrollment.course.price.toLocaleString()} so'm` : 'Bepul'}
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={styles.emptyState}
                >
                  <span style={styles.emptyIcon}>📚</span>
                  <h3 style={styles.emptyTitle}>Kurslar yo'q</h3>
                  <p style={styles.emptyText}>Hali hech qanday kursga yozilmagansiz</p>
                  <Link href="/courses" style={styles.emptyButton}>
                    Kurslarni ko'rish
                  </Link>
                </motion.div>
              )}
            </div>
          )}

          {activeTab === 'posts' && (
            <div style={styles.postsGrid}>
              {posts.length > 0 ? (
                posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    style={styles.postCardWrapper}
                  >
                    <Link href={`/forum/post/${post.id}`} style={styles.postCard}>
                      <div style={styles.postHeader}>
                        <span style={styles.postCategory}>
                          {post.course?.title || 'Umumiy muhokama'}
                        </span>
                        <span style={styles.postDate}>
                          {new Date(post.createdAt).toLocaleDateString('uz-UZ', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </span>
                      </div>
                      <h3 style={styles.postTitle}>{post.title}</h3>
                      <p style={styles.postPreview}>
                        {post.content.length > 120 
                          ? `${post.content.substring(0, 120)}...` 
                          : post.content}
                      </p>
                      <div style={styles.postFooter}>
                        <div style={styles.postStats}>
                          <span style={styles.postStat}>
                            <span style={styles.statIcon}>💬</span>
                            {post._count?.comments || 0}
                          </span>
                        </div>
                        <span style={styles.readMore}>
                          O'qish →
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={styles.emptyState}
                >
                  <span style={styles.emptyIcon}>📝</span>
                  <h3 style={styles.emptyTitle}>Postlar yo'q</h3>
                  <p style={styles.emptyText}>Hali hech qanday post yozmagansiz</p>
                  <Link href="/forum" style={styles.emptyButton}>
                    Forumga o'tish
                  </Link>
                </motion.div>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div style={styles.commentsGrid}>
              {comments.length > 0 ? (
                comments.map((comment, index) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link href={`/forum/post/${comment.post.id}`} style={styles.commentCard}>
                      <div style={styles.commentHeader}>
                        <span style={styles.commentPostTitle}>{comment.post.title}</span>
                        <span style={styles.commentDate}>
                          {new Date(comment.createdAt).toLocaleDateString('uz-UZ', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </span>
                      </div>
                      <p style={styles.commentText}>{comment.content}</p>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={styles.emptyState}
                >
                  <span style={styles.emptyIcon}>💬</span>
                  <h3 style={styles.emptyTitle}>Commentlar yo'q</h3>
                  <p style={styles.emptyText}>Hali hech qanday comment yozmagansiz</p>
                  <Link href="/forum" style={styles.emptyButton}>
                    Forumga o'tish
                  </Link>
                </motion.div>
              )}
            </div>
          )}

          {activeTab === 'payments' && (
            <div style={styles.paymentsSection}>
              {/* To'lov statistikasi */}
              <div style={styles.paymentsSummary}>
                <h3 style={styles.summaryTitle}>💰 To'lovlar statistikasi</h3>
                
                <div style={styles.statsGrid}>
                  <div style={styles.statCard}>
                    <span style={styles.statLabel}>Jami to'langan:</span>
                    <span style={styles.statValue}>{totalSpent.toLocaleString()} so'm</span>
                  </div>
                  
                  <div style={styles.statCard}>
                    <span style={styles.statLabel}>Sotib olingan kurslar:</span>
                    <span style={styles.statValue}>{purchases.length} ta</span>
                  </div>
                  
                  <div style={styles.statCard}>
                    <span style={styles.statLabel}>To'lov qilinishi kerak:</span>
                    <span style={styles.statValue}>
                      {enrollments.filter(e => e.status === 'pending' || e.status === 'active').length} ta kurs
                    </span>
                  </div>
                </div>
              </div>

              {/* To'lov qilinishi kerak bo'lgan kurslar */}
              {enrollments.filter(e => e.status === 'pending' || e.status === 'active').length > 0 && (
                <div style={styles.pendingPayments}>
                  <h3 style={styles.sectionTitle}>⏳ To'lov qilinishi kerak</h3>
                  
                  {enrollments
                    .filter(e => e.status === 'pending' || e.status === 'active')
                    .map((enrollment, index) => {
                      // To'lov muddatini hisoblash (agar startDate bo'lsa)
                      const daysLeft = (enrollment.course as any).startDate 
                        ? Math.ceil((new Date((enrollment.course as any).startDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
                        : null;
                      
                      return (
                        <div key={enrollment.id} style={styles.pendingCard}>
                          <div style={styles.pendingCardLeft}>
                            <div style={styles.courseIcon}>📚</div>
                            <div style={styles.pendingInfo}>
                              <h4 style={styles.pendingTitle}>{enrollment.course.title}</h4>
                              <p style={styles.pendingMeta}>
                                Kurs narxi: <strong>{(enrollment.course.price || 0).toLocaleString()} so'm</strong>
                              </p>
                              {(enrollment.course as any).startDate && (
                                <p style={styles.pendingMeta}>
                                  Boshlanish sanasi: {new Date((enrollment.course as any).startDate).toLocaleDateString('uz-UZ')}
                                </p>
                              )}
                              {daysLeft !== null && daysLeft > 0 && (
                                <p style={{
                                  ...styles.daysLeft,
                                  color: daysLeft <= 3 ? '#dc2626' : daysLeft <= 7 ? '#f59e0b' : '#10b981'
                                }}>
                                  ⏰ To'lovga {daysLeft} kun qoldi
                                </p>
                              )}
                              {daysLeft !== null && daysLeft <= 0 && (
                                <p style={{...styles.daysLeft, color: '#dc2626'}}>
                                  ⚠️ To'lov muddati o'tgan!
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div style={styles.pendingCardRight}>
                            <span style={styles.pendingAmount}>
                              {(enrollment.course.price || 0).toLocaleString()} so'm
                            </span>
                            
                            <div style={styles.paymentButtons}>
                              {/* Click orqali to'lash */}
                              <button
                                onClick={() => handleClickPayment(enrollment.course.id, enrollment.course.price)}
                                style={styles.clickButton}
                              >
                                🔵 Click orqali to'lash
                              </button>
                              
                              {/* Offline to'lov */}
                              <button
                                onClick={() => handleOfflinePayment(enrollment.id)}
                                style={styles.cashButton}
                              >
                                💵 Adminga to'ladim
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}

              {/* Sotib olingan kurslar */}
              {purchases.length > 0 && (
                <div style={styles.purchasedCourses}>
                  <h3 style={styles.sectionTitle}>✅ Sotib olingan kurslar</h3>
                  
                  <div style={styles.purchasesGrid}>
                    {purchases.map(purchase => (
                      <Link key={purchase.id} href={`/courses/${purchase.course.id}`} style={styles.purchasedCard}>
                        <div style={styles.purchasedImage}>
                          {purchase.course.image ? (
                            <img src={purchase.course.image} alt={purchase.course.title} style={styles.purchasedImg} />
                          ) : (
                            <span style={styles.purchasedEmoji}>📚</span>
                          )}
                        </div>
                        <div style={styles.purchasedContent}>
                          <h4 style={styles.purchasedTitle}>{purchase.course.title}</h4>
                          <p style={styles.purchasedPrice}>
                            {(purchase.course.price || 0).toLocaleString()} so'm
                          </p>
                          <p style={styles.purchasedDate}>
                            {new Date(purchase.createdAt).toLocaleDateString('uz-UZ')}
                          </p>
                          <div style={styles.paymentMethod}>
                            <span style={styles.methodBadge}>
                              {purchase.payment.provider === 'click' ? '🔵 Click' : '💵 Naqd'}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
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
        button {
          cursor: pointer;
        }
        a {
          text-decoration: none;
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
  // Nav stillari butunlay olib tashlandi (endi Navbar komponenti boshqaradi)
  main: {
    maxWidth: '1000px',
    margin: '2rem auto',
    padding: '2rem',
    position: 'relative' as const,
    zIndex: 10
  },
  profileHeader: {
    display: 'flex',
    gap: '3rem',
    alignItems: 'center',
    marginBottom: '2rem',
    padding: '2rem',
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
  },
  profileImageContainer: {
    position: 'relative' as const,
    width: '150px',
    height: '150px'
  },
    profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'cover' as const,
    border: '4px solid white',
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '3rem',
    fontWeight: 'bold',
    border: '4px solid white',
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
  },
  
  // Profil rasmi tugmalari
  uploadButtonWrapper: {
    position: 'absolute' as const,
    bottom: '10px',
    left: '10px',
    cursor: 'pointer',
    display: 'block',
    zIndex: 20
  },
  uploadButton: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#667eea',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    border: '2px solid white',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  deleteButton: {
    position: 'absolute' as const,
    bottom: '10px',
    right: '10px',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#dc2626',
    color: 'white',
    border: '2px solid white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    cursor: 'pointer',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    transition: 'all 0.2s',
    zIndex: 20
  },
  
  profileInfo: {
    flex: 1
  },
  profileName: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: '0.25rem'
  },
  profileEmail: {
    fontSize: '1rem',
    color: '#718096',
    marginBottom: '0.5rem'
  },
  profileRole: {
    fontSize: '0.95rem',
    color: '#667eea',
    marginBottom: '1rem'
  },
  editButton: {
    padding: '0.5rem 1rem',
    background: 'none',
    border: '2px solid #667eea',
    borderRadius: '8px',
    color: '#667eea',
    fontSize: '0.9rem',
    cursor: 'pointer'
  },
  editForm: {
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
  },
  editTitle: {
    fontSize: '1.5rem',
    color: '#2d3748',
    marginBottom: '1rem'
  },
  formGroup: {
    marginBottom: '1rem'
  },
  label: {
    display: 'block',
    fontSize: '0.9rem',
    color: '#718096',
    marginBottom: '0.25rem'
  },
  input: {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    fontSize: '1rem'
  },
  saveButton: {
    padding: '0.5rem 1.5rem',
    background: '#667eea',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '0.9rem',
    cursor: 'pointer'
  },
  tabs: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    flexWrap: 'wrap' as const
  },
  tab: {
    padding: '0.75rem 1.5rem',
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    borderRadius: '20px',
    color: 'white',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  tabActive: {
    background: 'white',
    color: '#667eea',
    fontWeight: '600'
  },
  tabContent: {
    minHeight: '400px'
  },
  coursesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem'
  },
  courseCardWrapper: {
    height: '100%'
  },
  courseCard: {
    display: 'flex',
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    textDecoration: 'none',
    color: 'inherit',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    transition: 'all 0.2s',
    height: '100%'
  },
  courseImage: {
    width: '100px',
    height: '100px',
    background: '#667eea',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  courseImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const
  },
  courseEmoji: {
    fontSize: '2.5rem',
    color: 'white'
  },
  courseInfo: {
    flex: 1,
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column' as const
  },
  courseTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '0.25rem'
  },
  courseDate: {
    fontSize: '0.75rem',
    color: '#718096',
    marginBottom: '0.25rem'
  },
  coursePrice: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#667eea',
    marginTop: 'auto'
  },
  courseFree: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#48bb78',
    marginTop: 'auto'
  },
  postsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem'
  },
  postCardWrapper: {
    height: '100%'
  },
  postCard: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    background: 'white',
    borderRadius: '16px',
    padding: '1.5rem',
    textDecoration: 'none',
    color: 'inherit',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease'
  },
  postHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  postCategory: {
    fontSize: '0.75rem',
    padding: '0.25rem 0.75rem',
    background: 'rgba(102, 126, 234, 0.1)',
    borderRadius: '20px',
    color: '#667eea',
    fontWeight: '600'
  },
  postDate: {
    fontSize: '0.75rem',
    color: '#a0aec0'
  },
  postTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: '0.75rem',
    lineHeight: '1.4'
  },
  postPreview: {
    fontSize: '0.9rem',
    color: '#718096',
    marginBottom: '1.5rem',
    lineHeight: '1.6',
    flex: 1
  },
  postFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: '1rem',
    borderTop: '1px solid #e2e8f0'
  },
  postStats: {
    display: 'flex',
    gap: '1rem'
  },
  postStat: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.85rem',
    color: '#718096'
  },
  statIcon: {
    fontSize: '1rem'
  },
  readMore: {
    fontSize: '0.9rem',
    color: '#667eea',
    fontWeight: '600'
  },
  commentsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem'
  },
  commentCard: {
    display: 'flex',
    flexDirection: 'column' as const,
    background: 'white',
    borderRadius: '12px',
    padding: '1rem',
    textDecoration: 'none',
    color: 'inherit',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    transition: 'all 0.2s'
  },
  commentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem'
  },
  commentPostTitle: {
    fontSize: '0.85rem',
    color: '#667eea',
    fontWeight: '600'
  },
  commentDate: {
    fontSize: '0.7rem',
    color: '#a0aec0'
  },
  commentText: {
    fontSize: '0.95rem',
    color: '#2d3748',
    lineHeight: '1.5'
  },
  paymentsSection: {
    padding: '1rem 0'
  },
  paymentsSummary: {
    background: '#f8fafc',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem'
  },
  summaryTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '1rem'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginTop: '1rem'
  },
  statCard: {
    background: 'white',
    padding: '1rem',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  statLabel: {
    fontSize: '0.85rem',
    color: '#6b7280',
    display: 'block',
    marginBottom: '0.5rem'
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#667eea'
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '1.5rem',
    marginTop: '2rem'
  },
  pendingPayments: {
    marginBottom: '2rem'
  },
  pendingCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'white',
    borderRadius: '16px',
    padding: '1.5rem',
    marginBottom: '1rem',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    flexWrap: 'wrap' as const,
    gap: '1rem'
  },
  pendingCardLeft: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    flex: 1,
    minWidth: '250px'
  },
  courseIcon: {
    width: '50px',
    height: '50px',
    background: '#667eea',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    color: 'white',
    flexShrink: 0
  },
  pendingInfo: {
    flex: 1
  },
  pendingTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '0.25rem'
  },
  pendingMeta: {
    fontSize: '0.9rem',
    color: '#6b7280',
    marginBottom: '0.25rem'
  },
  daysLeft: {
    fontSize: '0.85rem',
    fontWeight: '500',
    marginTop: '0.25rem'
  },
  pendingCardRight: {
    textAlign: 'right' as const,
    minWidth: '200px'
  },
  pendingAmount: {
    display: 'block',
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: '0.5rem'
  },
  paymentButtons: {
    display: 'flex',
    gap: '0.5rem',
    justifyContent: 'flex-end',
    flexWrap: 'wrap' as const
  },
  clickButton: {
    padding: '0.5rem 1rem',
    background: '#00B0F0',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '0.9rem',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const
  },
  cashButton: {
    padding: '0.5rem 1rem',
    background: '#10b981',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '0.9rem',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const
  },
  purchasesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1rem'
  },
  purchasedCard: {
    display: 'flex',
    background: 'white',
    borderRadius: '16px',
    overflow: 'hidden',
    textDecoration: 'none',
    color: 'inherit',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    transition: 'all 0.2s'
  },
  purchasedImage: {
    width: '100px',
    height: '100px',
    background: '#667eea',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  purchasedImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const
  },
  purchasedEmoji: {
    fontSize: '2rem',
    color: 'white'
  },
  purchasedContent: {
    flex: 1,
    padding: '1rem'
  },
  purchasedTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '0.25rem'
  },
  purchasedPrice: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: '0.25rem'
  },
  purchasedDate: {
    fontSize: '0.8rem',
    color: '#9ca3af',
    marginBottom: '0.5rem'
  },
  paymentMethod: {
    marginTop: '0.25rem'
  },
  methodBadge: {
    fontSize: '0.75rem',
    padding: '0.25rem 0.5rem',
    background: '#f3f4f6',
    borderRadius: '4px',
    color: '#4b5563'
  },
  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center' as const,
    padding: '4rem 2rem',
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px'
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
  display: 'inline-block',
  padding: '0.75rem 2rem',
  background: 'white',
  border: 'none',
  borderRadius: '8px',
  color: '#667eea',
  fontSize: '1rem',
  fontWeight: '600',
  textDecoration: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s'
},
purchasedCourses: {
  marginTop: '2rem'
},
adminLink: {
  display: 'inline-block',
  marginLeft: '1rem',
  padding: '0.5rem 1rem',
  background: '#10b981',
  color: 'white',
  borderRadius: '8px',
  textDecoration: 'none',
  fontSize: '0.9rem'
}

}
