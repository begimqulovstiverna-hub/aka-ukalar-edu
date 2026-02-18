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

  // Kurs mavjudligini tekshirish
  const course = await prisma.course.findUnique({
    where: { id }
  })

  if (!course) {
    return res.status(404).json({ message: 'Kurs topilmadi' })
  }

  // POST - yangi dars qo'shish (faqat admin)
  if (req.method === 'POST') {
    if (!session || session.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Ruxsat yo\'q' })
    }

    const { title, duration, videoUrl, order } = req.body

    if (!title) {
      return res.status(400).json({ message: 'Dars nomi majburiy' })
    }

    try {
      const lesson = await prisma.lesson.create({
        data: {
          title,
          duration: duration ? parseInt(duration) : null,
          videoUrl,
          order: order || 0,
          published: true,
          courseId: id
        }
      })

      return res.status(201).json(lesson)
    } catch (error) {
      console.error('POST lesson error:', error)
      return res.status(500).json({ message: 'Server xatoligi' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
