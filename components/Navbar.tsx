import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'

export default function Home() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Navbar to'g'ridan-to'g'ri shu yerda */}
      <nav style={{
        background: 'white',
        borderBottom: '2px solid #f0f0f0',
        padding: '0.5rem 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {/* Logo */}
          <Link href="/" style={{
            fontSize: '1.8rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textDecoration: 'none'
          }}>
            AKA·UKALAR
          </Link>

          {/* Burger tugmasi */}
          <button
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-around',
              width: '30px',
              height: '30px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0
            }}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span style={{ width: '30px', height: '3px', background: '#333', borderRadius: '3px' }}></span>
            <span style={{ width: '30px', height: '3px', background: '#333', borderRadius: '3px' }}></span>
            <span style={{ width: '30px', height: '3px', background: '#333', borderRadius: '3px' }}></span>
          </button>

          {/* Menyu (mobil/desktop) */}
          <div style={{
            display: window.innerWidth > 768 ? 'flex' : menuOpen ? 'flex' : 'none',
            flexDirection: window.innerWidth > 768 ? 'row' : 'column',
            width: window.innerWidth > 768 ? 'auto' : '100%',
            background: 'white',
            padding: window.innerWidth > 768 ? 0 : '1rem 0',
            gap: '1.5rem',
            borderTop: window.innerWidth > 768 ? 'none' : '1px solid #f0f0f0',
            marginTop: window.innerWidth > 768 ? 0 : '0.5rem',
            alignItems: 'center'
          }}>
            <Link href="/" style={linkStyle}>Bosh sahifa</Link>
            <Link href="/courses" style={linkStyle}>Kurslar</Link>
            <Link href="/schedule" style={linkStyle}>Dars jadvali</Link>
            <Link href="/forum" style={linkStyle}>Forum</Link>
            <Link href="/groups" style={linkStyle}>Guruhlar</Link>

            <div style={{ width: '1px', height: '30px', background: '#e0e0e0', margin: '0 0.5rem', display: window.innerWidth > 768 ? 'block' : 'none' }}></div>
            <div style={{ width: '100%', height: '1px', background: '#e0e0e0', margin: '0.5rem 0', display: window.innerWidth > 768 ? 'none' : 'block' }}></div>

            {!session ? (
              <>
                <Link href="/login" style={{...buttonStyle, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white'}}>Kirish</Link>
                <Link href="/register" style={{...buttonStyle, background: '#10b981', color: 'white'}}>Ro'yxat</Link>
              </>
            ) : (
              <>
                <Link href="/profile" style={{ color: '#333', textDecoration: 'none' }}>{session.user?.name}</Link>
                <button onClick={() => signOut()} style={{...buttonStyle, background: '#dc2626', color: 'white', border: 'none'}}>Chiqish</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Asosiy kontent */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {/* Sarlavha */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', fontWeight: '800', margin: 0 }}>
            <span style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              AKA·UKALAR
            </span>
          </h1>
          <p style={{ fontSize: 'clamp(1.2rem, 4vw, 2rem)', color: '#4a5568', margin: 0 }}>O'QUV MARKAZI</p>
          <p style={{ fontSize: '1.25rem', color: '#718096', margin: '0.5rem 0' }}>3-QAVAT</p>
          <p style={{ fontSize: '1.25rem', color: '#718096', maxWidth: '48rem', margin: '1.5rem auto 0' }}>
            Professional ta'lim, zamonaviy yondashuv va sifatli bilim
          </p>
        </div>

        {/* Statistika */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          maxWidth: '64rem',
          margin: '0 auto 5rem'
        }}>
          {[
            { number: '50+', label: 'Video darslar', color: '#2563eb' },
            { number: '100+', label: 'O\'quvchilar', color: '#16a34a' },
            { number: '15+', label: 'Mutaxassislar', color: '#9333ea' },
            { number: '24/7', label: 'Qo\'llab-quvvatlash', color: '#ea580c' }
          ].map((item, i) => (
            <div key={i} style={{
              textAlign: 'center',
              padding: '1.5rem',
              background: 'white',
              borderRadius: '0.75rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: item.color }}>
                {item.number}
              </div>
              <div style={{ color: '#718096' }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Kartochkalar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          maxWidth: '72rem',
          margin: '0 auto 5rem'
        }}>
          {[
            { icon: '📚', title: 'Kurslar', desc: 'Frontend, backend, mobile va boshqa yo\'nalishlar', link: '/courses', color: '#2563eb' },
            { icon: '📅', title: 'Dars jadvali', desc: 'Kunlik va haftalik dars vaqtlari', link: '/schedule', color: '#16a34a' },
            { icon: '💬', title: 'Forum', desc: 'Savol-javoblar va muhokamalar', link: '/forum', color: '#9333ea' },
            { icon: '👥', title: 'Guruhlar', desc: 'Qiziqishlar bo\'yicha guruhlar va muloqot', link: '/groups', color: '#d97706' }
          ].map((item, i) => (
            <Link key={i} href={item.link} style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'all 0.2s'
            }}>
              <div style={{
                width: '3.5rem',
                height: '3.5rem',
                borderRadius: '0.75rem',
                background: `${item.color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                marginBottom: '1.5rem'
              }}>{item.icon}</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.75rem' }}>{item.title}</h3>
              <p style={{ color: '#718096', marginBottom: '1.5rem', lineHeight: '1.5' }}>{item.desc}</p>
              <div style={{ color: item.color, fontWeight: '500' }}>Batafsil →</div>
            </Link>
          ))}
        </div>

        {/* Nima uchun aynan biz? */}
        <div style={{
          maxWidth: '64rem',
          margin: '0 auto',
          background: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '2rem' }}>Nima uchun aynan biz?</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1rem'
          }}>
            {[
              { icon: '🎯', text: 'Amaliy yondashuv' },
              { icon: '⏱️', text: 'Moslashuvchan vaqt' },
              { icon: '👥', text: 'Kichik guruhlar' },
              { icon: '🏆', text: 'Sertifikat' }
            ].map((item, i) => (
              <div key={i} style={{ padding: '1rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                <p style={{ fontSize: '0.875rem', color: '#718096', margin: 0 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

// Stillar
const linkStyle = {
  color: '#333',
  textDecoration: 'none',
  fontSize: '1rem',
  padding: '0.5rem 1rem',
  borderRadius: '8px',
  textAlign: 'center' as const,
  width: '100%'
}

const buttonStyle = {
  padding: '0.5rem 1rem',
  borderRadius: '8px',
  fontSize: '0.9rem',
  textDecoration: 'none',
  cursor: 'pointer',
  fontWeight: 500,
  border: 'none',
  textAlign: 'center' as const,
  width: '100%'
}
