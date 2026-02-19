import { useRouter } from 'next/router'
import Link from 'next/link'

export default function Privacy() {
  const router = useRouter()

  return (
    <div style={styles.container}>
      {/* Dekorativ elementlar */}
      <div style={styles.circle1}></div>
      <div style={styles.circle2}></div>
      
      <div style={styles.card}>
        {/* Navigatsiya */}
        <div style={styles.nav}>
          <Link href="/" style={styles.logo}>
            aka-ukalar
          </Link>
          <div style={styles.navLinks}>
            <Link href="/" style={styles.navLink}>
              Bosh sahifa
            </Link>
            <Link href="/courses" style={styles.navLink}>
              Kurslar
            </Link>
            <Link href="/schedule" style={styles.navLink}>
              Dars jadvali
            </Link>
            <Link href="/forum" style={styles.navLink}>
              Forum
            </Link>
          </div>
        </div>

        {/* Asosiy qism */}
        <div style={styles.content}>
          <h1 style={styles.title}>Maxfiylik siyosati</h1>
          <p style={styles.lastUpdated}>Oxirgi yangilanish: 17-fevral, 2026</p>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>1. Ma'lumotlar to'plami</h2>
            <p style={styles.text}>
              AKA-UKALAR o'quv markazi quyidagi ma'lumotlarni to'playdi:
            </p>
            <ul style={styles.list}>
              <li style={styles.listItem}>Ism va familiya</li>
              <li style={styles.listItem}>Email manzili</li>
              <li style={styles.listItem}>Telefon raqami (ixtiyoriy)</li>
              <li style={styles.listItem}>Kurslardagi faoliyatingiz</li>
              <li style={styles.listItem}>Forumdagi post va commentlar</li>
            </ul>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>2. Ma'lumotlardan foydalanish</h2>
            <p style={styles.text}>
              Sizning ma'lumotlaringiz quyidagi maqsadlarda ishlatiladi:
            </p>
            <ul style={styles.list}>
              <li style={styles.listItem}>Platforma xizmatlarini ko'rsatish</li>
              <li style={styles.listItem}>Kurslaringizni kuzatib borish</li>
              <li style={styles.listItem}>Yangi kurslar haqida xabardor qilish</li>
              <li style={styles.listItem}>Forumda muloqot qilish</li>
              <li style={styles.listItem}>Platformani yaxshilash</li>
            </ul>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>3. Ma'lumotlarni himoya qilish</h2>
            <p style={styles.text}>
              Sizning ma'lumotlaringiz xavfsizligi uchun:
            </p>
            <ul style={styles.list}>
              <li style={styles.listItem}>Barcha ma'lumotlar shifrlangan holda saqlanadi</li>
              <li style={styles.listItem}>Parollaringiz hech kimga ko'rsatilmaydi</li>
              <li style={styles.listItem}>Ma'lumotlar faqat ruxsat etilgan xodimlar tomonidan ko'riladi</li>
              <li style={styles.listItem}>Muntazam xavfsizlik tekshiruvlari o'tkaziladi</li>
            </ul>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>4. Cookies</h2>
            <p style={styles.text}>
              Platformamizda quyidagi cookies'lardan foydalanamiz:
            </p>
            <ul style={styles.list}>
              <li style={styles.listItem}>Sessiya cookies'i – tizimga kirganingizni eslab qolish uchun</li>
              <li style={styles.listItem}>Sozlamalar cookies'i – sizning sozlamalaringizni saqlash uchun</li>
              <li style={styles.listItem}>Analitika cookies'i – platformadan foydalanish statistikasi uchun</li>
            </ul>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>5. Uchinchi tomonlar</h2>
            <p style={styles.text}>
              Ma'lumotlaringiz quyidagi hollarda uchinchi tomonlarga uzatilishi mumkin:
            </p>
            <ul style={styles.list}>
              <li style={styles.listItem}>Qonun talabi bilan</li>
              <li style={styles.listItem}>Sizning roziligingiz bilan</li>
              <li style={styles.listItem}>To'lov tizimlari bilan (faqat to'lov ma'lumotlari)</li>
            </ul>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>6. Huquqlaringiz</h2>
            <p style={styles.text}>
              Siz quyidagi huquqlarga egasiz:
            </p>
            <ul style={styles.list}>
              <li style={styles.listItem}>Ma'lumotlaringizni ko'rish</li>
              <li style={styles.listItem}>Ma'lumotlaringizni tuzatish</li>
              <li style={styles.listItem}>Ma'lumotlaringizni o'chirish</li>
              <li style={styles.listItem}>Ma'lumotlaringizni eksport qilish</li>
              <li style={styles.listItem}>Marketing xabarlaridan voz kechish</li>
            </ul>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>7. Ma'lumotlarni saqlash muddati</h2>
            <p style={styles.text}>
              Ma'lumotlaringiz:
            </p>
            <ul style={styles.list}>
              <li style={styles.listItem}>Hisobingiz faol bo'lgan muddat davomida saqlanadi</li>
              <li style={styles.listItem}>Hisob o'chirilgandan so'ng 30 kun ichida o'chiriladi</li>
              <li style={styles.listItem}>Forum postlari anonim holda saqlanishi mumkin</li>
            </ul>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>8. O'zgarishlar</h2>
            <p style={styles.text}>
              Maxfiylik siyosati vaqti-vaqti bilan yangilanib turiladi. Katta o'zgarishlar bo'lganda, sizga email orqali xabar beriladi.
            </p>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>9. Bog'lanish</h2>
            <p style={styles.text}>
              Maxfiylik masalalari bo'yicha:
            </p>
            <div style={styles.contactInfo}>
              <p style={styles.contactItem}>📧 Email: privacy@aka-ukalar.uz</p>
              <p style={styles.contactItem}>📞 Telefon: +998 xx xxx xx xx</p>
              <p style={styles.contactItem}>📍 Manzil: Samarqand Shahar, Ishtixon tumani, </p>
            </div>
          </div>

          <div style={styles.acceptSection}>
            <p style={styles.acceptText}>
              Ro'yxatdan o'tish orqali siz ushbu maxfiylik siyosatini qabul qilasiz.
            </p>
            <Link href="/register" style={styles.backButton}>
              ← Ro'yxatdan o'tish sahifasiga qaytish
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>© 2026 AKA-UKALAR o'quv markazi. Barcha huquqlar himoyalangan.</p>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 50%, #f5f3ff 100%)',
    fontFamily: 'sans-serif',
    position: 'relative' as const,
    overflow: 'hidden'
  },
  circle1: {
    position: 'absolute' as const,
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
    top: '-100px',
    right: '-100px',
    opacity: 0.2,
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
    opacity: 0.2,
    animation: 'float 8s ease-in-out infinite reverse'
  },
  card: {
    maxWidth: '1000px',
    margin: '2rem auto',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    position: 'relative' as const,
    zIndex: 10
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem 2rem',
    borderBottom: '1px solid #e2e8f0'
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#667eea',
    textDecoration: 'none'
  },
  navLinks: {
    display: 'flex',
    gap: '1.5rem'
  },
  navLink: {
    color: '#4a5568',
    textDecoration: 'none',
    fontSize: '0.95rem'
  },
  content: {
    padding: '2rem'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: '0.5rem'
  },
  lastUpdated: {
    fontSize: '0.875rem',
    color: '#718096',
    marginBottom: '2rem'
  },
  section: {
    marginBottom: '2rem'
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '1rem'
  },
  text: {
    fontSize: '0.95rem',
    color: '#4a5568',
    lineHeight: '1.6',
    marginBottom: '1rem'
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  },
  listItem: {
    fontSize: '0.95rem',
    color: '#4a5568',
    padding: '0.5rem 0 0.5rem 1.5rem',
    position: 'relative' as const
  },
  contactInfo: {
    background: '#f7fafc',
    padding: '1rem',
    borderRadius: '8px'
  },
  contactItem: {
    fontSize: '0.95rem',
    color: '#4a5568',
    margin: '0.5rem 0'
  },
  acceptSection: {
    marginTop: '3rem',
    padding: '2rem',
    background: '#f7fafc',
    borderRadius: '8px',
    textAlign: 'center' as const
  },
  acceptText: {
    fontSize: '1rem',
    color: '#2d3748',
    marginBottom: '1rem'
  },
  backButton: {
    display: 'inline-block',
    padding: '0.75rem 2rem',
    background: '#667eea',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '0.95rem'
  },
  footer: {
    padding: '1.5rem 2rem',
    borderTop: '1px solid #e2e8f0',
    textAlign: 'center' as const
  },
  footerText: {
    fontSize: '0.875rem',
    color: '#718096'
  }
}
