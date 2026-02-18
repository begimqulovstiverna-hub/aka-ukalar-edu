import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'ID noto\'g\'ri' })
  }

  try {
    // Kursni olish
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        ratings: {
          select: { value: true }
        }
      }
    })

    if (!course) {
      return res.status(404).json({ message: 'Kurs topilmadi' })
    }

    // Barcha kurslarni reyting bo'yicha tartiblash
    const allCourses = await prisma.course.findMany({
      orderBy: {
        averageRating: 'desc'
      },
      select: { id: true }
    })

    const rank = allCourses.findIndex(c => c.id === id) + 1

    // Har bir baho uchun statistikani hisoblash
    const ratingDistribution = Array.from({ length: 5 }, (_, i) => ({
      stars: i + 1,
      count: course.ratings.filter(r => r.value === i + 1).length
    }))

    return res.status(200).json({
      averageRating: course.averageRating,
      totalRatings: course.ratingCount,
      rank,
      totalCourses: allCourses.length,
      distribution: ratingDistribution
    })
  } catch (error) {
    console.error('Rating stats error:', error)
    return res.status(500).json({ message: 'Server xatoligi' })
  }
}
