import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'

interface ScheduleItem {
  id: string
  title: string
  description: string | null
  dayOfWeek: number
  startTime: string
  endTime: string
  teacher: string | null
  room: string | null
  maxStudents: number | null
  status: string
  createdBy: string
  updatedBy: string
  createdAt: string
  updatedAt: string
  course: {
    title: string
    image: string | null
  }
  creator: {
    name: string
    email: string
  }
  updater: {
    name: string
    email: string
  }
}

interface Course {
  id: string
  title: string
}

const daysOfWeek = [
  { id: 0, name: 'Yakshanba', short: 'Yak', color: '#ef4444' },
  { id: 1, name: 'Dushanba', short: 'Dush', color: '#3b82f6' },
  { id: 2, name: 'Seshanba', short: 'Sesh', color: '#10b981' },
  { id: 3, name: 'Chorshanba', short: 'Chor', color: '#f59e0b' },
  { id: 4, name: 'Payshanba', short: 'Pay', color: '#8b5cf6' },
  { id: 5, name: 'Juma', short: 'Jum', color: '#ec4899' },
  { id: 6, name: 'Shanba', short: 'Shan', color: '#14b8a6' }
]

export default function Schedule() {
  const { data: session } = useSession()
  const router = useRouter()
  const [schedules, setSchedules] = useState<ScheduleItem[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number | 'all'>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newSchedule, setNewSchedule] = useState({
    title: '',
    description: '',
    dayOfWeek: '1',
    startTime: '09:00',
    endTime: '10:30',
    courseId: '',
    teacher: '',
    room: '',
    maxStudents: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [schedulesRes, coursesRes] = await Promise.all([
        fetch('/api/schedule'),
        fetch('/api/courses')
      ])
      const schedulesData = await schedulesRes.json()
      const coursesData = await coursesRes.json()
      setSchedules(schedulesData)
      setCourses(coursesData)
    } catch (error) {
      console.error('Maʼlumotlarni yuklashda xatolik:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSchedule)
      })

      if (res.ok) {
        setShowAddForm(false)
        setNewSchedule({
          title: '',
          description: '',
          dayOfWeek: '1',
          startTime: '09:00',
          endTime: '10:30',
          courseId: '',
          teacher: '',
          room: '',
          maxStudents: ''
        })
        fetchData()
      } else {
        const error = await res.json()
        alert(error.message || 'Xatolik yuz berdi')
      }
    } catch (error) {
      console.error('Dars qoʻshishda xatolik:', error)
      alert('Dars qoʻshishda xatolik yuz berdi')
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingId) return

    try {
      const res = await fetch(`/api/schedule/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSchedule)
      })

      if (res.ok) {
        setShowAddForm(false)
        setEditingId(null)
        setNewSchedule({
          title: '',
          description: '',
          dayOfWeek: '1',
          startTime: '09:00',
          endTime: '10:30',
          courseId: '',
          teacher: '',
          room: '',
          maxStudents: ''
        })
        fetchData()
      } else {
        const error = await res.json()
        alert(error.message || 'Xatolik yuz berdi')
      }
    } catch (error) {
      console.error('Darsni tahrirlashda xatolik:', error)
      alert('Darsni tahrirlashda xatolik yuz berdi')
    }
  }

  const handleCancelLesson = async (id: string) => {
    if (!confirm('Bu darsni bekor qilishni tasdiqlaysizmi?')) return

    try {
      const res = await fetch(`/api/schedule/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      })

      if (res.ok) {
        fetchData()
        alert('Dars bekor qilindi')
      }
    } catch (error) {
      console.error('Darsni bekor qilishda xatolik:', error)
    }
  }

  const handleActivateLesson = async (id: string) => {
    try {
      const res = await fetch(`/api/schedule/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' })
      })

      if (res.ok) {
        fetchData()
        alert('Dars qayta tiklandi')
      }
    } catch (error) {
      console.error('Darsni tiklashda xatolik:', error)
    }
  }

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Bu darsni butunlay oʻchirishni tasdiqlaysizmi?')) return

    try {
      const res = await fetch(`/api/schedule/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchData()
        alert('Dars oʻchirildi')
      }
    } catch (error) {
      console.error('Dars oʻchirishda xatolik:', error)
    }
  }

  const handleEdit = (item: ScheduleItem) => {
    setEditingId(item.id)
    setNewSchedule({
      title: item.title,
      description: item.description || '',
      dayOfWeek: item.dayOfWeek.toString(),
      startTime: item.startTime,
      endTime: item.endTime,
      courseId: item.course?.title || '',
      teacher: item.teacher || '',
      room: item.room || '',
      maxStudents: item.maxStudents?.toString() || ''
    })
    setShowAddForm(true)
  }

  const getDayColor = (dayIndex: number) => {
    return daysOfWeek[dayIndex]?.color || '#3b82f6'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('uz-UZ', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredSchedules = selectedDay === 'all' 
    ? schedules 
    : schedules.filter(s => s.dayOfWeek === selectedDay)

  const schedulesByDay = daysOfWeek.map((day) => ({
    ...day,
    items: filteredSchedules.filter(s => s.dayOfWeek === day.id)
  }))

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <div style={styles.loadingText}>Dars jadvali yuklanmoqda...</div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <Navbar />

      <main style={styles.main}>
        {/* Sarlavha */}
        <div style={styles.header}>
          <h1 style={styles.title}>Dars jadvali</h1>
          <p style={styles.subtitle}>Haftalik dars vaqtlari va yangilanishlar</p>
        </div>

        {/* Kun filterlari */}
        <div style={styles.filterContainer}>
          <button
            onClick={() => setSelectedDay('all')}
            style={{
              ...styles.filterButton,
              ...(selectedDay === 'all' ? styles.filterButtonActive : {})
            }}
          >
            <span style={styles.filterButtonText}>Barcha kunlar</span>
            <span style={styles.filterButtonCount}>{schedules.length}</span>
          </button>
          
          {daysOfWeek.map((day) => {
            const count = schedules.filter(s => s.dayOfWeek === day.id).length
            return (
              <button
                key={day.id}
                onClick={() => setSelectedDay(day.id)}
                style={{
                  ...styles.filterButton,
                  ...(selectedDay === day.id ? { ...styles.filterButtonActive, borderColor: day.color, backgroundColor: `${day.color}20` } : {})
                }}
              >
                <span style={styles.filterButtonText}>{day.short}</span>
                <span style={{...styles.filterButtonCount, backgroundColor: day.color}}>{count}</span>
              </button>
            )
          })}
        </div>

        {/* Yangi dars qo'shish/tahrirlash formasi */}
        {showAddForm && (session?.user?.role === 'admin' || session?.user?.role === 'creator') && (
          <div style={styles.formContainer}>
            <h3 style={styles.formTitle}>
              {editingId ? 'Darsni tahrirlash' : 'Yangi dars qo\'shish'}
            </h3>
            <form onSubmit={editingId ? handleUpdate : handleAddSchedule} style={styles.form}>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Dars nomi *</label>
                  <input
                    type="text"
                    required
                    value={newSchedule.title}
                    onChange={(e) => setNewSchedule({ ...newSchedule, title: e.target.value })}
                    style={styles.input}
                    placeholder="Masalan: Matematika"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Kurs *</label>
                  <select
                    required
                    value={newSchedule.courseId}
                    onChange={(e) => setNewSchedule({ ...newSchedule, courseId: e.target.value })}
                    style={styles.input}
                  >
                    <option value="">Kurs tanlang</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Tavsif</label>
                <textarea
                  rows={3}
                  value={newSchedule.description}
                  onChange={(e) => setNewSchedule({ ...newSchedule, description: e.target.value })}
                  style={{...styles.input, resize: 'vertical'}}
                  placeholder="Dars haqida qisqacha ma'lumot"
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Kun *</label>
                  <select
                    required
                    value={newSchedule.dayOfWeek}
                    onChange={(e) => setNewSchedule({ ...newSchedule, dayOfWeek: e.target.value })}
                    style={styles.input}
                  >
                    {daysOfWeek.map((day) => (
                      <option key={day.id} value={day.id}>{day.name}</option>
                    ))}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Boshlanish vaqti *</label>
                  <input
                    type="time"
                    required
                    value={newSchedule.startTime}
                    onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Tugash vaqti *</label>
                  <input
                    type="time"
                    required
                    value={newSchedule.endTime}
                    onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>O'qituvchi</label>
                  <input
                    type="text"
                    value={newSchedule.teacher}
                    onChange={(e) => setNewSchedule({ ...newSchedule, teacher: e.target.value })}
                    style={styles.input}
                    placeholder="Ism familiya"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Xona</label>
                  <input
                    type="text"
                    value={newSchedule.room}
                    onChange={(e) => setNewSchedule({ ...newSchedule, room: e.target.value })}
                    style={styles.input}
                    placeholder="Masalan: 201"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Max. o'quvchilar</label>
                  <input
                    type="number"
                    value={newSchedule.maxStudents}
                    onChange={(e) => setNewSchedule({ ...newSchedule, maxStudents: e.target.value })}
                    style={styles.input}
                    placeholder="30"
                  />
                </div>
              </div>

              <div style={styles.formButtons}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingId(null)
                  }}
                  style={styles.cancelButton}
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  style={styles.saveButton}
                >
                  {editingId ? 'Yangilash' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Dars jadvali grid */}
        <div style={styles.scheduleGrid}>
          {schedulesByDay.map((day) => (
            <div key={day.id} style={styles.dayColumn}>
              <div style={{...styles.dayHeader, borderColor: day.color}}>
                <h3 style={styles.dayName}>{day.name}</h3>
                <span style={{...styles.dayBadge, backgroundColor: day.color}}>
                  {day.items.length} ta dars
                </span>
              </div>
              
              <div style={styles.lessonsContainer}>
                {day.items.length > 0 ? (
                  day.items.map((item) => (
                    <div 
                      key={item.id} 
                      style={{
                        ...styles.lessonCard,
                        opacity: item.status === 'cancelled' ? 0.6 : 1,
                        backgroundColor: item.status === 'cancelled' ? '#fee2e2' : '#f7fafc',
                        borderLeft: item.status === 'cancelled' ? '4px solid #ef4444' : 'none'
                      }}
                    >
                      <div style={{...styles.lessonTime, backgroundColor: `${day.color}20`, color: day.color}}>
                        <span>{item.startTime}</span>
                        <span style={styles.timeSeparator}>-</span>
                        <span>{item.endTime}</span>
                        {item.status === 'cancelled' && (
                          <span style={styles.cancelledBadge}>BEKOR QILINGAN</span>
                        )}
                      </div>
                      
                      <div style={styles.lessonContent}>
                        <h4 style={styles.lessonTitle}>{item.title}</h4>
                        <p style={styles.lessonCourse}>{item.course?.title}</p>
                        
                        {(item.teacher || item.room) && (
                          <div style={styles.lessonMeta}>
                            {item.teacher && (
                              <span style={styles.metaItem}>
                                <span style={styles.metaIcon}>👤</span>
                                {item.teacher}
                              </span>
                            )}
                            {item.room && (
                              <span style={styles.metaItem}>
                                <span style={styles.metaIcon}>📍</span>
                                {item.room}
                              </span>
                            )}
                            {item.maxStudents && (
                              <span style={styles.metaItem}>
                                <span style={styles.metaIcon}>👥</span>
                                {item.maxStudents} o'rin
                              </span>
                            )}
                          </div>
                        )}

                        {item.description && (
                          <p style={styles.lessonDescription}>{item.description}</p>
                        )}

                        {/* Admin ma'lumotlari */}
                        <div style={styles.adminInfo}>
                          <div style={styles.adminInfoItem}>
                            <span style={styles.adminInfoIcon}>👨‍💼</span>
                            <span style={styles.adminInfoText}>
                              Qo'shdi: {item.creator?.name || 'Noma\'lum'}
                            </span>
                          </div>
                          <div style={styles.adminInfoItem}>
                            <span style={styles.adminInfoIcon}>✎</span>
                            <span style={styles.adminInfoText}>
                              So'ngi tahrir: {item.updater?.name || 'Noma\'lum'}
                            </span>
                          </div>
                          <div style={styles.adminInfoItem}>
                            <span style={styles.adminInfoIcon}>🕒</span>
                            <span style={styles.adminInfoText}>
                              {formatDate(item.updatedAt)}
                            </span>
                          </div>
                        </div>

                        {/* Admin tugmalari */}
                        {(session?.user?.role === 'admin' || session?.user?.role === 'creator') && (
                          <div style={styles.adminActions}>
                            <button
                              onClick={() => handleEdit(item)}
                              style={styles.editButton}
                              title="Tahrirlash"
                            >
                              ✎
                            </button>
                            {item.status === 'active' ? (
                              <button
                                onClick={() => handleCancelLesson(item.id)}
                                style={styles.cancelLessonButton}
                                title="Darsni bekor qilish"
                              >
                                ⏸️
                              </button>
                            ) : (
                              <button
                                onClick={() => handleActivateLesson(item.id)}
                                style={styles.activateLessonButton}
                                title="Darsni qayta tiklash"
                              >
                                ▶️
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteSchedule(item.id)}
                              style={styles.deleteButton}
                              title="Butunlay o'chirish"
                            >
                              🗑️
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={styles.emptyDay}>
                    <p style={styles.emptyText}>Darslar mavjud emas</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        button {
          cursor: pointer;
          border: none;
          background: none;
        }
      `}</style>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
  spinner: {
    width: '50px',
    height: '50px',
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    fontSize: '1.2rem',
    color: '#fff'
  },
  // Navigatsiya stillari olib tashlandi (Navbar komponenti boshqaradi)
  main: {
    maxWidth: '1400px',
    margin: '2rem auto',
    padding: '0 2rem'
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '3rem'
  },
  title: {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: '0.5rem'
  },
  subtitle: {
    fontSize: '1.2rem',
    color: 'rgba(255,255,255,0.9)'
  },
  filterContainer: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '2rem',
    flexWrap: 'wrap' as const,
    justifyContent: 'center'
  },
  filterButton: {
    padding: '0.5rem 1rem',
    background: 'rgba(255,255,255,0.1)',
    border: '2px solid transparent',
    borderRadius: '2rem',
    color: '#fff',
    fontSize: '0.875rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s'
  },
  filterButtonActive: {
    background: 'rgba(255,255,255,0.2)',
    borderColor: '#fff'
  },
  filterButtonText: {
    fontWeight: '500'
  },
  filterButtonCount: {
    background: 'rgba(255,255,255,0.2)',
    padding: '0.2rem 0.5rem',
    borderRadius: '1rem',
    fontSize: '0.75rem'
  },
  formContainer: {
    background: 'white',
    borderRadius: '1rem',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
  },
  formTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '1.5rem'
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'border-color 0.2s'
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
    color: '#2d3748',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  saveButton: {
    padding: '0.75rem 1.5rem',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  scheduleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '1rem'
  },
  dayColumn: {
    background: 'white',
    borderRadius: '1rem',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  dayHeader: {
    padding: '1rem',
    borderBottom: '3px solid',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '0.5rem'
  },
  dayName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#2d3748',
    margin: 0
  },
  dayBadge: {
    padding: '0.2rem 0.8rem',
    borderRadius: '1rem',
    fontSize: '0.75rem',
    color: 'white'
  },
  lessonsContainer: {
    padding: '1rem',
    minHeight: '200px'
  },
  lessonCard: {
    background: '#f7fafc',
    borderRadius: '0.5rem',
    marginBottom: '1rem',
    overflow: 'hidden',
    transition: 'transform 0.2s, boxShadow 0.2s'
  },
  lessonTime: {
    padding: '0.5rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    display: 'flex',
    justifyContent: 'center',
    gap: '0.25rem'
  },
  timeSeparator: {
    opacity: 0.5
  },
  cancelledBadge: {
    marginLeft: '0.5rem',
    padding: '0.2rem 0.5rem',
    background: '#ef4444',
    color: 'white',
    borderRadius: '0.25rem',
    fontSize: '0.6rem',
    fontWeight: 'bold'
  },
  lessonContent: {
    padding: '1rem',
    position: 'relative' as const
  },
  lessonTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '0.25rem'
  },
  lessonCourse: {
    fontSize: '0.75rem',
    color: '#718096',
    marginBottom: '0.5rem'
  },
  lessonMeta: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
    marginBottom: '0.5rem'
  },
  metaItem: {
    fontSize: '0.7rem',
    color: '#718096',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem'
  },
  metaIcon: {
    fontSize: '0.8rem'
  },
  lessonDescription: {
    fontSize: '0.75rem',
    color: '#718096',
    marginTop: '0.5rem',
    lineHeight: '1.4'
  },
  adminInfo: {
    marginTop: '0.5rem',
    padding: '0.5rem',
    background: '#edf2f7',
    borderRadius: '0.25rem',
    fontSize: '0.7rem'
  },
  adminInfoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    marginBottom: '0.25rem'
  },
  adminInfoIcon: {
    fontSize: '0.8rem'
  },
  adminInfoText: {
    color: '#4a5568'
  },
  adminActions: {
    position: 'absolute' as const,
    top: '0.5rem',
    right: '0.5rem',
    display: 'flex',
    gap: '0.5rem'
  },
  editButton: {
    padding: '0.25rem 0.5rem',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    cursor: 'pointer'
  },
  cancelLessonButton: {
    padding: '0.25rem 0.5rem',
    background: '#f59e0b',
    color: 'white',
    border: 'none',
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    cursor: 'pointer'
  },
  activateLessonButton: {
    padding: '0.25rem 0.5rem',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    cursor: 'pointer'
  },
  deleteButton: {
    padding: '0.25rem 0.5rem',
    background: '#f56565',
    color: 'white',
    border: 'none',
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    cursor: 'pointer'
  },
  emptyDay: {
    height: '150px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyText: {
    fontSize: '0.875rem',
    color: '#a0aec0',
    textAlign: 'center' as const
  }
}
