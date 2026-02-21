import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'ID noto\'g\'ri' })
  }

  // GET - bitta kursni olish (statistika bilan)
  if (req.method === 'GET') {
    try {
      const course = await prisma.course.findUnique({
        where: { id },
        include: { 
          lessons: { 
            orderBy: { order: 'asc' },
            where: { published: true }
          },
          _count: {
            select: { 
              enrollments: true  // Yozilganlar soni
            }
          }
        }
      })

      if (!course) {
        return res.status(404).json({ message: 'Kurs topilmadi' })
      }

      return res.status(200).json(course)
    } catch (error) {
      console.error('GET error:', error)
      return res.status(500).json({ message: 'Server xatoligi' })
    }
  }

  // PUT - kursni tahrirlash (admin yoki creator)
  if (req.method === 'PUT') {
    if (!session || (session.user?.role !== 'admin' && session.user?.role !== 'creator')) {
      return res.status(403).json({ message: 'Ruxsat yo\'q' })
    }

    const { title, description, price, image, published } = req.body

    if (!title) {
      return res.status(400).json({ message: 'Kurs nomi majburiy' })
    }

    try {
      const course = await prisma.course.update({
        where: { id },
        data: {
          title,
          description,
          price: price ? parseFloat(price) : null,
          image,
          published: published !== undefined ? published : true
        },
        include: {
          _count: {
            select: { enrollments: true }
          }
        }
      })
      return res.status(200).json(course)
    } catch (error) {
      console.error('PUT error:', error)
      return res.status(500).json({ message: 'Server xatoligi' })
    }
  }

  // DELETE - kursni o'chirish (admin yoki creator)
  if (req.method === 'DELETE') {
    if (!session || (session.user?.role !== 'admin' && session.user?.role !== 'creator')) {
      return res.status(403).json({ message: 'Ruxsat yo\'q' })
    }

    try {
      // Avval bog'liq yozuvlarni o'chirish
      await prisma.enrollment.deleteMany({
        where: { courseId: id }
      })

      // Kursni o'chirish
      await prisma.course.delete({ 
        where: { id } 
      })
      
      return res.status(200).json({ message: 'Kurs o\'chirildi' })
    } catch (error) {
      console.error('DELETE error:', error)
      return res.status(500).json({ message: 'Server xatoligi' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
