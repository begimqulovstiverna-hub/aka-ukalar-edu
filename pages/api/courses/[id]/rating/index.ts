import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'ID noto\'g\'ri' })
  }

  // GET - foydalanuvchining ovozini olish
  if (req.method === 'GET') {
    if (!session) {
      return res.status(200).json({ userRating: 0 })
    }

    try {
      const rating = await prisma.rating.findUnique({
        where: {
          userId_courseId: {
            userId: session.user.id,
            courseId: id
          }
        }
      })

      return res.status(200).json({ 
        userRating: rating?.value || 0,
        averageRating: 0,
        totalRatings: 0
      })
    } catch (error) {
      console.error('GET rating error:', error)
      return res.status(500).json({ message: 'Server xatoligi' })
    }
  }

  // POST - ovoz berish
  if (req.method === 'POST') {
    if (!session) {
      return res.status(401).json({ message: 'Ovoz berish uchun tizimga kiring' })
    }

    const { value } = req.body

    if (!value || value < 1 || value > 5) {
      return res.status(400).json({ message: '1-5 oralig\'ida baho bering' })
    }

    try {
      // Avval ovoz berilganmi tekshirish
      const existingRating = await prisma.rating.findUnique({
        where: {
          userId_courseId: {
            userId: session.user.id,
            courseId: id
          }
        }
      })

      if (existingRating) {
        // Ovozni yangilash
        await prisma.rating.update({
          where: {
            userId_courseId: {
              userId: session.user.id,
              courseId: id
            }
          },
          data: { value }
        })
      } else {
        // Yangi ovoz qo'shish
        await prisma.rating.create({
          data: {
            value,
            userId: session.user.id,
            courseId: id
          }
        })
      }

      // Kursning o'rtacha reytingini hisoblash
      const ratings = await prisma.rating.findMany({
        where: { courseId: id }
      })

      const totalRatings = ratings.length
      const averageRating = ratings.reduce((acc, r) => acc + r.value, 0) / totalRatings

      // Kurs ma'lumotlarini yangilash
      await prisma.course.update({
        where: { id },
        data: {
          averageRating,
          ratingCount: totalRatings
        }
      })

      return res.status(200).json({ 
        message: existingRating ? 'Ovoz yangilandi' : 'Ovoz qabul qilindi',
        averageRating,
        totalRatings
      })
    } catch (error) {
      console.error('POST rating error:', error)
      return res.status(500).json({ message: 'Server xatoligi' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
