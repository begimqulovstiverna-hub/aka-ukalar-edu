import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function ResetPassword() {
  const router = useRouter()
  const { token } = router.query
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    if (!token && router.isReady) {
      router.push('/forgot-password')
    }
  }, [token, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password.length < 6) {
      setError('Parol kamida 6 belgidan iborat bo\'lishi kerak')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Parollar mos kelmadi')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        setError(data.message || 'Xatolik yuz berdi')
      }
    } catch (error) {
      setError('Server bilan bogʻlanishda xatolik')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      {/* Dekorativ elementlar */}
      <div style={styles.circle1}></div>
      <div style={styles.circle2}></div>
      
      <div style={styles.card}>
        {/* Logo va sarlavha */}
        <div style={styles.logoContainer}>
          <Link href="/" style={styles.logo}>
            aka-ukalar
          </Link>
        </div>
        
        <h1 style={styles.title}>Yangi parol o'rnatish</h1>
        <p style={styles.subtitle}>
          Yangi parolingizni kiriting
        </p>

        {/* Xatolik xabari */}
        {error && (
          <div style={styles.errorAlert}>
            <span style={styles.errorIcon}>⚠️</span>
            <span style={styles.errorText}>{error}</span>
          </div>
        )}

        {/* Muvaffaqiyat xabari */}
        {success && (
          <div style={styles.successAlert}>
            <span style={styles.successIcon}>✅</span>
            <div style={styles.successContent}>
              <p style={styles.successTitle}>Parol muvaffaqiyatli o'zgartirildi!</p>
              <p style={styles.successText}>
                Tizimga qayta kirishingiz mumkin. 3 soniyadan so'ng login sahifasiga o'tasiz.
              </p>
            </div>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Yangi parol */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>🔒</span>
                Yangi parol
              </label>
              <div style={styles.inputWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={styles.input}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.passwordToggle}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* Parolni tasdiqlash */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>🔒</span>
                Parolni tasdiqlang
              </label>
              <div style={styles.inputWrapper}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={styles.input}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.passwordToggle}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* Parol talablari */}
            <div style={styles.passwordRequirements}>
              <p style={styles.requirementsTitle}>Parol talablari:</p>
              <ul style={styles.requirementsList}>
                <li style={password.length >= 6 ? styles.requirementMet : styles.requirement}>
                  <span style={styles.requirementIcon}>
                    {password.length >= 6 ? '✅' : '❌'}
                  </span>
                  Kamida 6 belgi
                </li>
                <li style={password === confirmPassword && password ? styles.requirementMet : styles.requirement}>
                  <span style={styles.requirementIcon}>
                    {password === confirmPassword && password ? '✅' : '❌'}
                  </span>
                  Parollar mos kelishi
                </li>
              </ul>
            </div>

            {/* Saqlash tugmasi */}
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitButton,
                ...(loading ? styles.submitButtonDisabled : {})
              }}
            >
              {loading ? (
                <span style={styles.loadingContainer}>
                  <span style={styles.loadingSpinner}></span>
                  Saqlanmoqda...
                </span>
              ) : (
                'Saqlash'
              )}
            </button>
          </form>
        )}

        {/* Qaytish linki */}
        <div style={styles.links}>
          <Link href="/login" style={styles.link}>
            ← Tizimga kirish
          </Link>
        </div>
      </div>

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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative' as const,
    overflow: 'hidden'
  },
  circle1: {
    position: 'absolute' as const,
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'linear-gradient(45deg, #f093fb 0%, #f5576c 100%)',
    top: '-100px',
    right: '-100px',
    animation: 'float 6s ease-in-out infinite'
  },
  circle2: {
    position: 'absolute' as const,
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    background: 'linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)',
    bottom: '-50px',
    left: '-50px',
    animation: 'float 8s ease-in-out infinite reverse'
  },
  card: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '3rem',
    width: '100%',
    maxWidth: '450px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    position: 'relative' as const,
    zIndex: 10
  },
  logoContainer: {
    textAlign: 'center' as const,
    marginBottom: '2rem'
  },
  logo: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#667eea',
    textDecoration: 'none'
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: '0.5rem',
    textAlign: 'center' as const
  },
  subtitle: {
    fontSize: '0.95rem',
    color: '#718096',
    marginBottom: '2rem',
    textAlign: 'center' as const
  },
  errorAlert: {
    background: '#fed7d7',
    border: '1px solid #fc8181',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  errorIcon: {
    fontSize: '1.1rem'
  },
  errorText: {
    color: '#c53030',
    fontSize: '0.875rem'
  },
  successAlert: {
    background: '#c6f6d5',
    border: '1px solid #9ae6b4',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1.5rem',
    display: 'flex',
    gap: '0.75rem'
  },
  successIcon: {
    fontSize: '1.5rem'
  },
  successContent: {
    flex: 1
  },
  successTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#22543d',
    marginBottom: '0.25rem'
  },
  successText: {
    fontSize: '0.875rem',
    color: '#276749'
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem'
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#4a5568',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  labelIcon: {
    fontSize: '1rem'
  },
  inputWrapper: {
    position: 'relative' as const
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  passwordToggle: {
    position: 'absolute' as const,
    right: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    fontSize: '1.2rem',
    cursor: 'pointer',
    color: '#718096'
  },
  passwordRequirements: {
    background: '#f7fafc',
    padding: '1rem',
    borderRadius: '8px'
  },
  requirementsTitle: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: '0.5rem'
  },
  requirementsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  },
  requirement: {
    fontSize: '0.875rem',
    color: '#a0aec0',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.25rem'
  },
  requirementMet: {
    fontSize: '0.875rem',
    color: '#48bb78',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.25rem'
  },
  requirementIcon: {
    fontSize: '0.875rem'
  },
  submitButton: {
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    padding: '1rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  submitButtonDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed'
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem'
  },
  loadingSpinner: {
    width: '1.2rem',
    height: '1.2rem',
    border: '2px solid #ffffff',
    borderTop: '2px solid transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  links: {
    marginTop: '2rem',
    textAlign: 'center' as const
  },
  link: {
    color: '#667eea',
    textDecoration: 'none',
    fontSize: '0.875rem'
  }
}
