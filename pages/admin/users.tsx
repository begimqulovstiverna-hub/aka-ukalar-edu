import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

export default function AdminUsers() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user?.role !== 'creator') {
      router.push('/')
    }
  }, [session, status, router])

  useEffect(() => {
    if (session?.user?.role === 'creator') {
      fetchUsers()
    }
  }, [session])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      setUsers(data)
    } catch (error) {
      console.error('Xatolik:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole })
      })
      if (res.ok) {
        fetchUsers()
      } else {
        alert('Xatolik yuz berdi')
      }
    } catch (error) {
      console.error('Rolni yangilashda xatolik:', error)
    }
  }

  if (status === 'loading' || loading) {
    return <div style={styles.loading}>Yuklanmoqda...</div>
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Foydalanuvchilarni boshqarish</h1>
      <table style={styles.table}>
        <thead>
          <tr>
            <th>Ism</th>
            <th>Email</th>
            <th>Joriy rol</th>
            <th>Rolni o'zgartirish</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <select
                  value={user.role}
                  onChange={(e) => updateRole(user.id, e.target.value)}
                  style={styles.select}
                >
                  <option value="user">👤 O'quvchi</option>
                  <option value="admin">👑 Admin</option>
                  <option value="creator">⭐ Creator</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link href="/" style={styles.backButton}>← Bosh sahifaga</Link>
    </div>
  )
}

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1000px',
    margin: '0 auto',
    fontFamily: 'sans-serif'
  },
  title: {
    fontSize: '2rem',
    marginBottom: '2rem'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  select: {
    padding: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #ccc'
  },
  loading: {
    textAlign: 'center' as const,
    padding: '2rem'
  },
  backButton: {
    display: 'inline-block',
    marginTop: '2rem',
    color: '#667eea',
    textDecoration: 'none'
  }
}
