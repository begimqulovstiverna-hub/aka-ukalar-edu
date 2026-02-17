import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: 'Tizimga kiring' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { courseId } = req.body

  if (!courseId) {
    return res.status(400).json({ message: 'Kurs ID si kerak' })
  }

  try {
    // Yozilganligini tekshirish
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: courseId
        }
      }
    })

    if (!enrollment) {
      return res.status(400).json({ message: 'Siz bu kursga yozilmagansiz' })
    }

    // Kursni tark etish (o'chirish)
    await prisma.enrollment.delete({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: courseId
        }
      }
    })

    return res.status(200).json({ 
      message: 'Kurs muvaffaqiyatli tark etildi'
    })
  } catch (error) {
    console.error('Unenroll error:', error)
    return res.status(500).json({ message: 'Server xatoligi' })
  }
}
