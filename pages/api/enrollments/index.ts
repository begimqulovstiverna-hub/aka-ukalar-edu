import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: 'Tizimga kiring' })
  }

  // POST - kursga yozilish
  if (req.method === 'POST') {
    const { courseId } = req.body

    if (!courseId) {
      return res.status(400).json({ message: 'Kurs ID si kerak' })
    }

    try {
      // Avval yozilganmi tekshirish
      const existing = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: session.user.id,
            courseId: courseId
          }
        }
      })

      if (existing) {
        return res.status(400).json({ message: 'Siz allaqachon bu kursga yozilgansiz' })
      }

      // Yangi yozilish yaratish
      const enrollment = await prisma.enrollment.create({
        data: {
          userId: session.user.id,
          courseId: courseId,
          status: 'active'
        }
      })

      return res.status(201).json({ 
        message: 'Kursga muvaffaqiyatli yozildingiz',
        enrollment 
      })
    } catch (error) {
      console.error('Enrollment error:', error)
      return res.status(500).json({ message: 'Server xatoligi' })
    }
  }

  // GET - foydalanuvchining yozilgan kurslari
  if (req.method === 'GET') {
    try {
      const enrollments = await prisma.enrollment.findMany({
        where: { userId: session.user.id },
        include: { course: true }
      })
      return res.status(200).json(enrollments)
    } catch (error) {
      console.error('GET enrollments error:', error)
      return res.status(500).json({ message: 'Server xatoligi' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
