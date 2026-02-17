import { useRouter } from 'next/router'
import Link from 'next/link'

export default function Terms() {
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
          <h1 style={styles.title}>Foydalanish shartlari</h1>
          <p style={styles.lastUpdated}>Oxirgi yangilanish: 17-fevral, 2026</p>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>1. Umumiy qoidalar</h2>
            <p style={styles.text}>
              AKA-UKALAR o'quv markazi platformasiga xush kelibsiz. Ushbu platformadan foydalanish orqali siz quyidagi shartlarni qabul qilasiz:
            </p>
            <ul style={styles.list}>
              <li style={styles.listItem}>Platformadan faqat shaxsiy maqsadlarda foydalanish</li>
              <li style={styles.listItem}>Boshqa foydalanuvchilarning huquqlarini hurmat qilish</li>
              <li style={styles.listItem}>Noqonuniy yoki zararli kontent joylamaslik</li>
              <li style={styles.listItem}>Platforma xavfsizligini buzmaslik</li>
            </ul>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>2. Hisob qaydnomasi</h2>
            <p style={styles.text}>
              Ro'yxatdan o'tishda siz:
            </p>
            <ul style={styles.list}>
              <li style={styles.listItem}>To'g'ri va haqiqiy ma'lumotlarni taqdim etishingiz kerak</li>
              <li style={styles.listItem}>Hisobingiz xavfsizligi uchun javobgarsiz</li>
              <li style={styles.listItem}>Bitta hisobdan bir necha kishi foydalanishi mumkin emas</li>
              <li style={styles.listItem}>Hisobingizdagi barcha harakatlar uchun javobgarsiz</li>
            </ul>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>3. Kurslar va to'lovlar</h2>
            <p style={styles.text}>
              Kurslar haqida muhim ma'lumotlar:
            </p>
            <ul style={styles.list}>
              <li style={styles.listItem}>Barcha kurslar 14 kun ichida to'liq qaytarib berish kafolati bilan</li>
              <li style={styles.listItem}>Kurs materiallari faqat shaxsiy foydalanish uchun</li>
              <li style={styles.listItem}>Kurs narxlari oldindan bildirilgan holda o'zgarishi mumkin</li>
              <li style={styles.listItem}>Maxsus aksiyalar va chegirmalar boshqa takliflar bilan birlashtirilmaydi</li>
            </ul>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>4. Intellektual mulk</h2>
            <p style={styles.text}>
              Platformadagi barcha materiallar (video darslar, matnlar, testlar) AKA-UKALAR o'quv markazining intellektual mulki hisoblanadi. Ularni:
            </p>
            <ul style={styles.list}>
              <li style={styles.listItem}>Nusxalash va tarqatish taqiqlanadi</li>
              <li style={styles.listItem}>Tijorat maqsadlarida ishlatish mumkin emas</li>
              <li style={styles.listItem}>O'zgartirish va qayta joylashtirish man etiladi</li>
            </ul>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>5. Forum qoidalari</h2>
            <p style={styles.text}>
              Forumda:
            </p>
            <ul style={styles.list}>
              <li style={styles.listItem}>Hurmatli munosabatda bo'ling</li>
              <li style={styles.listItem}>Spam va reklama joylamang</li>
              <li style={styles.listItem}>Haqorat va kamsitish taqiqlanadi</li>
              <li style={styles.listItem}>Nomaqbul kontent uchun hisob bloklanishi mumkin</li>
            </ul>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>6. Hisobni to'xtatish</h2>
            <p style={styles.text}>
              AKA-UKALAR o'quv markazi quyidagi hollarda hisobingizni to'xtatish huquqiga ega:
            </p>
            <ul style={styles.list}>
              <li style={styles.listItem}>Shartlarni buzganingizda</li>
              <li style={styles.listItem}>Noqonuniy faoliyat olib borganingizda</li>
              <li style={styles.listItem}>Uzoq muddat faol bo'lmaganingizda</li>
              <li style={styles.listItem}>Sizning iltimosingiz bo'yicha</li>
            </ul>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>7. O'zgartirishlar</h2>
            <p style={styles.text}>
              Ushbu shartlar istalgan vaqtda o'zgartirilishi mumkin. O'zgarishlar haqida foydalanuvchilar email orqali xabardor qilinadi. Platformadan foydalanishni davom ettirish orqali siz yangi shartlarni qabul qilgan hisoblanasiz.
            </p>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>8. Bog'lanish</h2>
            <p style={styles.text}>
              Savol va takliflar uchun:
            </p>
            <div style={styles.contactInfo}>
              <p style={styles.contactItem}>📧 Email: support@aka-ukalar.uz</p>
              <p style={styles.contactItem}>📞 Telefon: +998 90 123 45 67</p>
              <p style={styles.contactItem}>📍 Manzil: Toshkent sh., Chilonzor tumani, 3-qavat</p>
            </div>
          </div>

          <div style={styles.acceptSection}>
            <p style={styles.acceptText}>
              Ro'yxatdan o'tish orqali siz ushbu shartlarni to'liq qabul qilasiz.
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
