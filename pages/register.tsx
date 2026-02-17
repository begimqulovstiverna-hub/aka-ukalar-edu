import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function Register() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Parolni tekshirish
    if (formData.password !== formData.confirmPassword) {
      setError('Parollar mos kelmadi')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Parol kamida 6 belgidan iborat bo\'lishi kerak')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      })

      const data = await res.json()

      if (res.ok) {
        router.push('/login?registered=true')
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
        
        <h1 style={styles.title}>Ro'yxatdan o'tish</h1>
        <p style={styles.subtitle}>Hisob yarating va bilim olishni boshlang</p>

        {/* Xatolik xabari */}
        {error && (
          <div style={styles.errorAlert}>
            <span style={styles.errorIcon}>⚠️</span>
            <span style={styles.errorText}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Ism maydoni */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>👤</span>
              Ism
            </label>
            <div style={styles.inputWrapper}>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={styles.input}
                placeholder="Ism familiya"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Email maydoni */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>📧</span>
              Email
            </label>
            <div style={styles.inputWrapper}>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={styles.input}
                placeholder="your@email.com"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Parol maydoni */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>🔒</span>
              Parol
            </label>
            <div style={styles.inputWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
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
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
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
              <li style={formData.password.length >= 6 ? styles.requirementMet : styles.requirement}>
                <span style={styles.requirementIcon}>
                  {formData.password.length >= 6 ? '✅' : '❌'}
                </span>
                Kamida 6 belgi
              </li>
              <li style={formData.password === formData.confirmPassword && formData.password ? styles.requirementMet : styles.requirement}>
                <span style={styles.requirementIcon}>
                  {formData.password === formData.confirmPassword && formData.password ? '✅' : '❌'}
                </span>
                Parollar mos kelishi
              </li>
            </ul>
          </div>

          {/* Ro'yxatdan o'tish tugmasi */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.registerButton,
              ...(loading ? styles.registerButtonDisabled : {})
            }}
          >
            {loading ? (
              <span style={styles.loadingContainer}>
                <span style={styles.loadingSpinner}></span>
                Ro'yxatdan o'tish...
              </span>
            ) : (
              "Ro'yxatdan o'tish"
            )}
          </button>
        </form>

        {/* Kirish linki */}
        <div style={styles.loginSection}>
          <p style={styles.loginText}>
            Hisobingiz bormi?{' '}
            <Link href="/login" style={styles.loginLink}>
              Tizimga kirish
            </Link>
          </p>
        </div>

        {/* Foydalanish shartlari */}
        <div style={styles.terms}>
          <p style={styles.termsText}>
            Ro'yxatdan o'tish orqali siz{' '}
            <Link href="/terms" style={styles.termsLink}>
              foydalanish shartlari
            </Link>{' '}
            va{' '}
            <Link href="/privacy" style={styles.termsLink}>
              maxfiylik siyosati
            </Link>{' '}
            ni qabul qilasiz
          </p>
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
    maxWidth: '500px',
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
  registerButton: {
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
  registerButtonDisabled: {
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
  loginSection: {
    marginTop: '2rem',
    textAlign: 'center' as const
  },
  loginText: {
    color: '#718096',
    fontSize: '0.875rem'
  },
  loginLink: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: '600'
  },
  terms: {
    marginTop: '1.5rem',
    textAlign: 'center' as const
  },
  termsText: {
    color: '#a0aec0',
    fontSize: '0.75rem'
  },
  termsLink: {
    color: '#667eea',
    textDecoration: 'none'
  }
}
