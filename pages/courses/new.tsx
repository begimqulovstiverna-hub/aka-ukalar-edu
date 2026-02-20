import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function NewCourse() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    image: ''
  })

  // Faqat admin yoki creator ruxsati
  if (status === 'loading') return null
  if (!session || (session.user?.role !== 'admin' && session.user?.role !== 'creator')) {
    router.push('/courses')
    return null
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
        setFormData(prev => ({ ...prev, image: data.imageUrl }))
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          price: formData.price ? parseFloat(formData.price) : null,
          image: formData.image
        })
      })

      const data = await res.json()

      if (res.ok) {
        alert('✅ Kurs muvaffaqiyatli yaratildi!')
        router.push(`/courses/${data.id}`)
      } else {
        alert(data.message || 'Xatolik yuz berdi')
      }
    } catch (error) {
      console.error('Kurs yaratishda xatolik:', error)
      alert('Server bilan bogʻlanishda xatolik')
    } finally {
      setLoading(false)
    }
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
            <Link href="/courses" style={{...styles.navLink, ...styles.navLinkActive}}>Kurslar</Link>
            <Link href="/schedule" style={styles.navLink}>Dars jadvali</Link>
            <Link href="/forum" style={styles.navLink}>Forum</Link>
            <Link href="/groups" style={styles.navLink}>Guruhlar</Link>
          </div>
          <div style={styles.authButtons}>
            <Link href="/profile" style={styles.profileLink}>
              <div style={styles.avatarContainer}>
                {(session.user as any).image ? (
                  <img src={(session.user as any).image} alt={session.user.name || ''} style={styles.avatar} />
                ) : (
                  <div style={styles.avatarPlaceholder}>
                    {session.user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </Link>
          </div>
        </div>
      </nav>

      <main style={styles.main}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={styles.formCard}
        >
          <h1 style={styles.title}>Yangi kurs yaratish</h1>
          
          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Kurs nomi */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Kurs nomi *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                style={styles.input}
                placeholder="Masalan: JavaScript asoslari"
                required
              />
            </div>

            {/* Tavsif */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Tavsif</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                style={styles.textarea}
                rows={4}
                placeholder="Kurs haqida qisqacha ma'lumot..."
              />
            </div>

            {/* Narx */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Narxi (so'm) – bepul bo'lsa bo'sh qoldiring</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                style={styles.input}
                placeholder="280000"
                min="0"
              />
            </div>

            {/* Rasm */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Kurs rasmi</label>
              <div style={styles.imageUploadContainer}>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  style={{...styles.input, marginBottom: '0.5rem'}}
                  placeholder="Rasm URL yoki yuklang"
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
                    {uploading ? '⏳ Yuklanmoqda...' : '📁 Kompyuterdan yuklash'}
                  </label>
                </div>
              </div>
              {formData.image && (
                <div style={styles.imagePreview}>
                  <img src={formData.image} alt="Preview" style={styles.previewImage} />
                </div>
              )}
            </div>

            {/* Tugmalar */}
            <div style={styles.buttonGroup}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => router.push('/courses')}
                style={styles.cancelButton}
                disabled={loading}
              >
                Bekor qilish
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                style={styles.submitButton}
                disabled={loading || uploading}
              >
                {loading ? 'Yaratilmoqda...' : 'Kursni yaratish'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </main>

      <style>{`
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
    gap: '1rem'
  },
  navLink: {
    padding: '0.5rem 1rem',
    color: '#4a5568',
    textDecoration: 'none',
    fontSize: '1rem',
    borderRadius: '30px',
    transition: 'all 0.2s'
  },
  navLinkActive: {
    background: '#667eea',
    color: 'white'
  },
  authButtons: {
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
  main: {
    maxWidth: '800px',
    margin: '2rem auto',
    padding: '0 2rem',
    position: 'relative' as const,
    zIndex: 10
  },
  formCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '2rem',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
  },
  title: {
    fontSize: '2rem',
    color: '#2d3748',
    marginBottom: '2rem',
    textAlign: 'center' as const
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem'
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
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  textarea: {
    padding: '0.75rem',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none',
    resize: 'vertical' as const,
    fontFamily: 'inherit'
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
    borderRadius: '8px',
    color: 'white',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'background 0.2s'
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
  buttonGroup: {
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
    fontSize: '1rem',
    cursor: 'pointer'
  },
  submitButton: {
    padding: '0.75rem 1.5rem',
    background: '#667eea',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '1rem',
    cursor: 'pointer'
  }
}
