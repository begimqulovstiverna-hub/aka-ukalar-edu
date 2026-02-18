import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  const { id, lessonId } = req.query

  if (!id || typeof id !== 'string' || !lessonId || typeof lessonId !== 'string') {
    return res.status(400).json({ message: 'ID noto\'g\'ri' })
  }

  // PUT - darsni tahrirlash (faqat admin)
  if (req.method === 'PUT') {
    if (!session || session.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Ruxsat yo\'q' })
    }

    const { title, duration, videoUrl } = req.body

    try {
      const lesson = await prisma.lesson.update({
        where: { id: lessonId },
        data: {
          title,
          duration: duration ? parseInt(duration) : null,
          videoUrl
        }
      })

      return res.status(200).json(lesson)
    } catch (error) {
      console.error('PUT lesson error:', error)
      return res.status(500).json({ message: 'Server xatoligi' })
    }
  }

  // DELETE - darsni o'chirish (faqat admin)
  if (req.method === 'DELETE') {
    if (!session || session.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Ruxsat yo\'q' })
    }

    try {
      await prisma.lesson.delete({
        where: { id: lessonId }
      })

      return res.status(200).json({ message: 'Dars o\'chirildi' })
    } catch (error) {
      console.error('DELETE lesson error:', error)
      return res.status(500).json({ message: 'Server xatoligi' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
