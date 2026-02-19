import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'

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

interface Lesson {
  id: string
  title: string
  duration: number | null
  order: number
  videoUrl?: string
}

interface RatingStats {
  averageRating: number
  totalRatings: number
  rank: number
  totalCourses: number
  distribution: Array<{ stars: number; count: number }>
}

export default function CourseDetail() {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = router.query
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrolled, setEnrolled] = useState(false)
  const [enrolling, setEnrolling] = useState(false)
  const [unenrolling, setUnenrolling] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isAddingLesson, setIsAddingLesson] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [uploading, setUploading] = useState(false)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    price: '',
    image: ''
  })
  const [lessonForm, setLessonForm] = useState({
    title: '',
    duration: '',
    videoUrl: ''
  })
  const [totalDuration, setTotalDuration] = useState(0)
  
  // Reyting uchun state'lar
  const [userRating, setUserRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [ratingStats, setRatingStats] = useState<RatingStats>({
    averageRating: 0,
    totalRatings: 0,
    rank: 0,
    totalCourses: 0,
    distribution: []
  })

  useEffect(() => {
    if (id) {
      fetchCourse()
      fetchRatingStats()
    }
  }, [id])

  useEffect(() => {
    if (id && session) {
      checkEnrollment()
      fetchUserRating()
    }
  }, [id, session])

  const fetchCourse = async () => {
    try {
      const res = await fetch(`/api/courses/${id}`)
      const data = await res.json()
      setCourse(data)
      setEditForm({
        title: data.title || '',
        description: data.description || '',
        price: data.price || '',
        image: data.image || ''
      })
      
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

  const fetchRatingStats = async () => {
    try {
      const res = await fetch(`/api/courses/${id}/rating/stats`)
      const data = await res.json()
      setRatingStats(data)
    } catch (error) {
      console.error('Reyting yuklashda xatolik:', error)
    }
  }

  const fetchUserRating = async () => {
    if (!session) return
    try {
      const res = await fetch(`/api/courses/${id}/rating`)
      const data = await res.json()
      setUserRating(data.userRating)
    } catch (error) {
      console.error('User rating yuklashda xatolik:', error)
    }
  }

  const handleRate = async (value: number) => {
    if (!session) {
      router.push('/login')
      return
    }

    try {
      const res = await fetch(`/api/courses/${id}/rating`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value })
      })

      if (res.ok) {
        setUserRating(value)
        fetchRatingStats()
      } else {
        const error = await res.json()
        alert(error.message || 'Xatolik yuz berdi')
      }
    } catch (error) {
      console.error('Ovoz berishda xatolik:', error)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('image', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (res.ok) {
        setEditForm({...editForm, image: data.imageUrl})
        alert('Rasm muvaffaqiyatli yuklandi!')
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

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`/api/courses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          price: editForm.price ? parseFloat(editForm.price) : null,
          image: editForm.image
        })
      })

      if (res.ok) {
        setIsEditing(false)
        fetchCourse()
        alert('Kurs muvaffaqiyatli yangilandi!')
      } else {
        const error = await res.json()
        alert(error.message || 'Xatolik yuz berdi')
      }
    } catch (error) {
      console.error('Edit error:', error)
      alert('Kursni tahrirlashda xatolik yuz berdi')
    }
  }

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`/api/courses/${id}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: lessonForm.title,
          duration: lessonForm.duration ? parseInt(lessonForm.duration) : null,
          videoUrl: lessonForm.videoUrl,
          order: course?.lessons?.length || 0
        })
      })

      if (res.ok) {
        setIsAddingLesson(false)
        setLessonForm({ title: '', duration: '', videoUrl: '' })
        fetchCourse()
        alert('Dars muvaffaqiyatli qo\'shildi!')
      } else {
        const error = await res.json()
        alert(error.message || 'Xatolik yuz berdi')
      }
    } catch (error) {
      console.error('Add lesson error:', error)
      alert('Dars qo\'shishda xatolik yuz berdi')
    }
  }

  const handleEditLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingLesson) return

    try {
      const res = await fetch(`/api/courses/${id}/lessons/${editingLesson.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: lessonForm.title,
          duration: lessonForm.duration ? parseInt(lessonForm.duration) : null,
          videoUrl: lessonForm.videoUrl
        })
      })

      if (res.ok) {
        setEditingLesson(null)
        setLessonForm({ title: '', duration: '', videoUrl: '' })
        fetchCourse()
        alert('Dars muvaffaqiyatli yangilandi!')
      } else {
        const error = await res.json()
        alert(error.message || 'Xatolik yuz berdi')
      }
    } catch (error) {
      console.error('Edit lesson error:', error)
      alert('Darsni tahrirlashda xatolik yuz berdi')
    }
  }

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Bu darsni oʻchirishni tasdiqlaysizmi?')) return

    try {
      const res = await fetch(`/api/courses/${id}/lessons/${lessonId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        fetchCourse()
        alert('Dars oʻchirildi!')
      } else {
        const error = await res.json()
        alert(error.message || 'Xatolik yuz berdi')
      }
    } catch (error) {
      console.error('Delete lesson error:', error)
      alert('Darsni oʻchirishda xatolik yuz berdi')
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

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <div style={styles.loading}>Yuklanmoqda...</div>
      </div>
    )
  }

  if (!course) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>😕</div>
        <h2 style={styles.errorTitle}>Kurs topilmadi</h2>
        <p style={styles.errorText}>Soʻralgan kurs mavjud emas yoki oʻchirilgan.</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/courses')}
          style={styles.backButton}
        >
          Kurslar sahifasiga qaytish
        </motion.button>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Dekorativ doiralar */}
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
          <motion.div 
            whileHover={{ scale: 1.05 }}
            style={styles.logo}
            onClick={() => router.push('/')}
          >
            aka-ukalar
          </motion.div>
          <div style={styles.navLinks}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/')}
              style={styles.navButton}
            >
              Bosh sahifa
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/courses')}
              style={{...styles.navButton, ...styles.navButtonActive}}
            >
              Kurslar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/schedule')}
              style={styles.navButton}
            >
              Dars jadvali
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/forum')}
              style={styles.navButton}
            >
              Forum
            </motion.button>
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
              <motion.div
                whileHover={{ scale: 1.05 }}
                style={styles.profileAvatar}
                onClick={() => router.push('/profile')}
              >
                {(session.user as any).image ? (
                  <img src={(session.user as any).image} alt={session.user.name || ''} style={styles.avatarImage} />
                ) : (
                  <span style={styles.avatarPlaceholder}>
                    {session.user.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </motion.nav>

      <main style={styles.main}>
        {/* Admin panel */}
        <AnimatePresence>
          {session?.user?.role === 'admin' && !isEditing && !isAddingLesson && !editingLesson && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={styles.adminPanel}
            >
              <h3 style={styles.adminTitle}>⚙️ Admin panel</h3>
              <div style={styles.adminButtons}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(true)}
                  style={styles.editButton}
                >
                  ✎ Kursni tahrirlash
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsAddingLesson(true)}
                  style={styles.addLessonButton}
                >
                  + Dars qo'shish
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDelete}
                  style={styles.deleteButton}
                >
                  🗑️ Kursni o'chirish
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Kursni tahrirlash formasi */}
        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={styles.editForm}
            >
              <h2 style={styles.editTitle}>Kursni tahrirlash</h2>
              <form onSubmit={handleEdit}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Kurs nomi</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Tavsif</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    style={styles.textarea}
                    rows={4}
                  />
                </div>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Narxi (so'm)</label>
                    <input
                      type="number"
                      value={editForm.price}
                      onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Rasm</label>
                    <div style={styles.imageUploadContainer}>
                      <input
                        type="text"
                        value={editForm.image}
                        onChange={(e) => setEditForm({...editForm, image: e.target.value})}
                        style={{...styles.input, marginBottom: '0.5rem'}}
                        placeholder="Rasm URL yoki yuklangan rasm"
                      />
                      <div style={styles.uploadButtons}>
                        <label htmlFor="image-upload" style={styles.uploadButton}>
                          <input
                            type="file"
                            id="image-upload"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                          />
                          {uploading ? '⏳' : '📁 Galereyadan yuklash'}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                {editForm.image && (
                  <div style={styles.imagePreview}>
                    <img src={editForm.image} alt="Preview" style={styles.previewImage} />
                  </div>
                )}
                <div style={styles.formButtons}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => setIsEditing(false)}
                    style={styles.cancelButton}
                  >
                    Bekor qilish
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    style={styles.saveButton}
                  >
                    Saqlash
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dars qo'shish formasi */}
        <AnimatePresence>
          {isAddingLesson && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={styles.editForm}
            >
              <h2 style={styles.editTitle}>Yangi dars qo'shish</h2>
              <form onSubmit={handleAddLesson}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Dars nomi</label>
                  <input
                    type="text"
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm({...lessonForm, title: e.target.value})}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Davomiyligi (daqiqa)</label>
                    <input
                      type="number"
                      value={lessonForm.duration}
                      onChange={(e) => setLessonForm({...lessonForm, duration: e.target.value})}
                      style={styles.input}
                      placeholder="45"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Video URL</label>
                    <input
                      type="url"
                      value={lessonForm.videoUrl}
                      onChange={(e) => setLessonForm({...lessonForm, videoUrl: e.target.value})}
                      style={styles.input}
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                </div>
                <div style={styles.formButtons}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => {
                      setIsAddingLesson(false)
                      setLessonForm({ title: '', duration: '', videoUrl: '' })
                    }}
                    style={styles.cancelButton}
                  >
                    Bekor qilish
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    style={styles.saveButton}
                  >
                    Qo'shish
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Darsni tahrirlash formasi */}
        <AnimatePresence>
          {editingLesson && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={styles.editForm}
            >
              <h2 style={styles.editTitle}>Darsni tahrirlash</h2>
              <form onSubmit={handleEditLesson}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Dars nomi</label>
                  <input
                    type="text"
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm({...lessonForm, title: e.target.value})}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Davomiyligi (daqiqa)</label>
                    <input
                      type="number"
                      value={lessonForm.duration}
                      onChange={(e) => setLessonForm({...lessonForm, duration: e.target.value})}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Video URL</label>
                    <input
                      type="url"
                      value={lessonForm.videoUrl}
                      onChange={(e) => setLessonForm({...lessonForm, videoUrl: e.target.value})}
                      style={styles.input}
                    />
                  </div>
                </div>
                <div style={styles.formButtons}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => {
                      setEditingLesson(null)
                      setLessonForm({ title: '', duration: '', videoUrl: '' })
                    }}
                    style={styles.cancelButton}
                  >
                    Bekor qilish
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    style={styles.saveButton}
                  >
                    Saqlash
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Kurs ma'lumotlari */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={styles.courseCard}
        >
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
                <div style={styles.statValue}>{ratingStats.averageRating.toFixed(1)}</div>
                <div style={styles.statLabel}>Reyting</div>
              </div>
            </div>
          </div>

          <p style={styles.description}>{course.description || 'Tavsif mavjud emas'}</p>
          
          <div style={styles.price}>
            Narxi: <strong>{course.price ? `${course.price.toLocaleString()} so'm` : 'BEPUL'}</strong>
          </div>

          {/* ⭐ REYTING QISMI */}
          <div style={styles.ratingSection}>
            <div style={styles.ratingHeader}>
              <h3 style={styles.ratingTitle}>Kurs reytingi</h3>
              <div style={styles.ratingBadge}>
                <span style={styles.rankBadge}>#{ratingStats.rank}</span>
                <span style={styles.rankText}> / {ratingStats.totalCourses} kurs</span>
              </div>
            </div>

            <div style={styles.ratingMain}>
              <div style={styles.ratingScore}>
                <span style={styles.averageRating}>
                  {ratingStats.averageRating.toFixed(1)}
                </span>
                <div style={styles.starsDisplay}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} style={{
                      ...styles.starIcon,
                      color: star <= Math.round(ratingStats.averageRating) ? '#ffc107' : '#e4e5e9'
                    }}>★</span>
                  ))}
                </div>
                <span style={styles.totalRatings}>
                  {ratingStats.totalRatings} ta ovoz
                </span>
              </div>

              {session ? (
                <div style={styles.ratingInput}>
                  <p style={styles.ratingLabel}>Sizning bahoingiz:</p>
                  <div style={styles.starsInput}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.button
                        key={star}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleRate(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        style={styles.starButton}
                      >
                        <span style={{
                          ...styles.starIcon,
                          fontSize: '2rem',
                          color: star <= (hoverRating || userRating) ? '#ffc107' : '#e4e5e9'
                        }}>★</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/login')}
                  style={styles.loginToRateButton}
                >
                  Baholash uchun kiring
                </motion.button>
              )}
            </div>

            {/* Baholar statistikasi */}
            <div style={styles.ratingDistribution}>
              {ratingStats.distribution.map((item: any) => (
                <div key={item.stars} style={styles.distributionRow}>
                  <span style={styles.distributionLabel}>{item.stars} ★</span>
                  <div style={styles.progressBarContainer}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${ratingStats.totalRatings > 0 ? (item.count / ratingStats.totalRatings) * 100 : 0}%` }}
                      transition={{ duration: 0.5 }}
                      style={styles.progressBar}
                    />
                  </div>
                  <span style={styles.distributionCount}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Darslar ro'yxati */}
          {course.lessons && course.lessons.length > 0 && (
            <div style={styles.lessonsSection}>
              <div style={styles.lessonsHeader}>
                <h3 style={styles.sectionTitle}>Darslar ro'yxati</h3>
                {session?.user?.role === 'admin' && !isEditing && !isAddingLesson && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsAddingLesson(true)}
                    style={styles.addSmallButton}
                  >
                    + Yangi dars
                  </motion.button>
                )}
              </div>
              <div style={styles.lessonsList}>
                {course.lessons.map((lesson, index) => (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={styles.lessonItem}
                  >
                    <div style={styles.lessonNumber}>{index + 1}</div>
                    <div style={styles.lessonInfo}>
                      <div style={styles.lessonTitle}>{lesson.title}</div>
                      {lesson.duration && (
                        <div style={styles.lessonDuration}>{lesson.duration} daqiqa</div>
                      )}
                    </div>
                    {session?.user?.role === 'admin' && (
                      <div style={styles.lessonActions}>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            setEditingLesson(lesson)
                            setLessonForm({
                              title: lesson.title,
                              duration: lesson.duration?.toString() || '',
                              videoUrl: ''
                            })
                          }}
                          style={styles.lessonEditButton}
                        >
                          ✎
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteLesson(lesson.id)}
                          style={styles.lessonDeleteButton}
                        >
                          🗑️
                        </motion.button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* YOZILISH / TARK ETISH TUGMALARI */}
          <div style={styles.enrollSection}>
            {enrolled ? (
              <div style={styles.enrolledContainer}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={styles.enrolledMessage}
                >
                  <span style={styles.enrolledIcon}>✅</span>
                  <span style={styles.enrolledText}>Siz bu kursga yozilgansiz</span>
                </motion.div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleUnenroll}
                  disabled={unenrolling}
                  style={{
                    ...styles.unenrollButton,
                    opacity: unenrolling ? 0.7 : 1,
                    cursor: unenrolling ? 'not-allowed' : 'pointer'
                  }}
                >
                  {unenrolling ? 'Tark etilmoqda...' : 'Kursni tark etish'}
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEnroll}
                disabled={enrolling}
                style={{
                  ...styles.enrollButton,
                  opacity: enrolling ? 0.7 : 1,
                  cursor: enrolling ? 'not-allowed' : 'pointer'
                }}
              >
                {enrolling ? 'Yozilmoqda...' : (session ? 'Kursga yozilish' : 'Yozilish uchun kiring')}
              </motion.button>
            )}
            
            {!session && !enrolled && (
              <p style={styles.loginHint}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => router.push('/login')}
                  style={styles.linkButton}
                >
                  Tizimga kiring
                </motion.button> va kursga yoziling
              </p>
            )}
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
  loading: {
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
    cursor: 'pointer'
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
    color: '#4a5568',
    borderRadius: '30px',
    transition: 'all 0.2s'
  },
  navButtonActive: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white'
  },
  authButtons: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
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
  profileAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: '2px solid white',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    cursor: 'pointer'
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
  main: {
    maxWidth: '800px',
    margin: '2rem auto',
    padding: '2rem',
    position: 'relative' as const,
    zIndex: 10
  },
  courseCard: {
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '2rem',
    boxShadow: '0 20px 40px -15px rgba(0,0,0,0.2)'
  },
  adminPanel: {
    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    borderRadius: '12px',
    padding: '1rem',
    marginBottom: '1rem'
  },
  adminTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#92400e',
    marginBottom: '0.5rem'
  },
  adminButtons: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap' as const
  },
  editButton: {
    padding: '0.5rem 1rem',
    background: '#f59e0b',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '0.9rem',
    cursor: 'pointer'
  },
  addLessonButton: {
    padding: '0.5rem 1rem',
    background: '#10b981',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '0.9rem',
    cursor: 'pointer'
  },
  deleteButton: {
    padding: '0.5rem 1rem',
    background: '#dc2626',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '0.9rem',
    cursor: 'pointer'
  },
  editForm: {
    background: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1rem'
  },
  editTitle: {
    fontSize: '1.3rem',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '1rem'
  },
  formGroup: {
    marginBottom: '1rem'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem'
  },
  label: {
    display: 'block',
    fontSize: '0.9rem',
    color: '#4a5568',
    marginBottom: '0.25rem'
  },
  input: {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    fontSize: '1rem'
  },
  textarea: {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    fontSize: '1rem',
    resize: 'vertical' as const
  },
  imageUploadContainer: {
    width: '100%'
  },
  uploadButtons: {
    marginTop: '0.5rem'
  },
  uploadButton: {
    display: 'inline-block',
    padding: '0.5rem 1rem',
    background: '#667eea',
    border: 'none',
    borderRadius: '4px',
    color: 'white',
    fontSize: '0.9rem',
    cursor: 'pointer'
  },
  imagePreview: {
    marginTop: '1rem',
    textAlign: 'center' as const
  },
  previewImage: {
    maxWidth: '100%',
    maxHeight: '200px',
    borderRadius: '8px'
  },
  formButtons: {
    display: 'flex',
    gap: '0.5rem',
    justifyContent: 'flex-end'
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
  saveButton: {
    padding: '0.5rem 1rem',
    background: '#667eea',
    border: 'none',
    borderRadius: '4px',
    color: 'white',
    fontSize: '0.9rem',
    cursor: 'pointer'
  },
  title: {
    fontSize: '2rem',
    marginBottom: '1rem',
    color: '#2d3748'
  },
  image: {
    width: '100%',
    maxHeight: '400px',
    objectFit: 'cover' as const,
    borderRadius: '12px',
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
    borderRadius: '12px',
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
    color: '#2d3748'
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#718096'
  },
  description: {
    fontSize: '1rem',
    lineHeight: '1.6',
    color: '#4a5568',
    marginBottom: '1rem'
  },
  price: {
    fontSize: '1.25rem',
    padding: '1rem',
    background: '#f8fafc',
    borderRadius: '8px',
    marginBottom: '2rem'
  },
  ratingSection: {
    marginTop: '2rem',
    padding: '1.5rem',
    background: '#f8fafc',
    borderRadius: '12px',
    marginBottom: '2rem'
  },
  ratingHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  ratingTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#2d3748',
    margin: 0
  },
  ratingBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  rankBadge: {
    padding: '0.25rem 0.75rem',
    background: '#667eea',
    borderRadius: '20px',
    color: 'white',
    fontSize: '0.9rem',
    fontWeight: '600'
  },
  rankText: {
    fontSize: '0.9rem',
    color: '#718096'
  },
  ratingMain: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
    marginBottom: '1.5rem'
  },
  ratingScore: {
    textAlign: 'center' as const,
    minWidth: '120px'
  },
  averageRating: {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: '#2d3748',
    lineHeight: '1'
  },
  starsDisplay: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.25rem',
    margin: '0.5rem 0'
  },
  starIcon: {
    fontSize: '1.5rem',
    transition: 'color 0.2s'
  },
  totalRatings: {
    fontSize: '0.9rem',
    color: '#718096'
  },
  ratingInput: {
    flex: 1
  },
  ratingLabel: {
    fontSize: '0.9rem',
    color: '#4a5568',
    marginBottom: '0.5rem'
  },
  starsInput: {
    display: 'flex',
    gap: '0.25rem'
  },
  starButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0
  },
  loginToRateButton: {
    padding: '0.75rem 1.5rem',
    background: 'none',
    border: '2px solid #667eea',
    borderRadius: '8px',
    color: '#667eea',
    fontSize: '0.9rem',
    cursor: 'pointer'
  },
  ratingDistribution: {
    marginTop: '1rem'
  },
  distributionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem'
  },
  distributionLabel: {
    width: '40px',
    fontSize: '0.9rem',
    color: '#4a5568'
  },
  progressBarContainer: {
    flex: 1,
    height: '8px',
    background: '#e2e8f0',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    background: '#667eea',
    borderRadius: '4px',
    transition: 'width 0.3s ease'
  },
  distributionCount: {
    width: '40px',
    fontSize: '0.9rem',
    color: '#718096',
    textAlign: 'right' as const
  },
  lessonsSection: {
    marginBottom: '2rem'
  },
  lessonsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#2d3748',
    margin: 0
  },
  addSmallButton: {
    padding: '0.25rem 0.75rem',
    background: '#10b981',
    border: 'none',
    borderRadius: '4px',
    color: 'white',
    fontSize: '0.8rem',
    cursor: 'pointer'
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
    borderRadius: '8px'
  },
  lessonNumber: {
    width: '2rem',
    height: '2rem',
    background: '#667eea',
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
    color: '#2d3748'
  },
  lessonDuration: {
    fontSize: '0.875rem',
    color: '#718096'
  },
  lessonActions: {
    display: 'flex',
    gap: '0.5rem'
  },
  lessonEditButton: {
    padding: '0.25rem 0.5rem',
    background: '#f59e0b',
    border: 'none',
    borderRadius: '4px',
    color: 'white',
    fontSize: '0.8rem',
    cursor: 'pointer'
  },
  lessonDeleteButton: {
    padding: '0.25rem 0.5rem',
    background: '#dc2626',
    border: 'none',
    borderRadius: '4px',
    color: 'white',
    fontSize: '0.8rem',
    cursor: 'pointer'
  },
  enrollSection: {
    marginTop: '2rem'
  },
  enrollButton: {
    width: '100%',
    padding: '1rem',
    background: '#667eea',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
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
    background: '#48bb78',
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
    background: '#f56565',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  loginHint: {
    marginTop: '1rem',
    color: '#718096',
    fontSize: '0.875rem',
    textAlign: 'center' as const
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#667eea',
    textDecoration: 'underline',
    cursor: 'pointer',
    fontSize: '0.875rem'
  }
}
