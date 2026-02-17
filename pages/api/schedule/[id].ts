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

  // GET - bitta darsni olish
  if (req.method === 'GET') {
    try {
      const schedule = await prisma.schedule.findUnique({
        where: { id },
        include: { 
          course: true,
          creator: { select: { name: true, email: true } },
          updater: { select: { name: true, email: true } }
        }
      })

      if (!schedule) {
        return res.status(404).json({ message: 'Dars topilmadi' })
      }

      return res.status(200).json(schedule)
    } catch (error) {
      console.error('GET error:', error)
      return res.status(500).json({ message: 'Server xatoligi' })
    }
  }

  // PUT - darsni tahrirlash (faqat admin)
  if (req.method === 'PUT') {
    if (!session || session.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Ruxsat yo\'q' })
    }

    const { title, description, dayOfWeek, startTime, endTime, courseId, teacher, room, maxStudents, status } = req.body

    try {
      const schedule = await prisma.schedule.update({
        where: { id },
        data: {
          title,
          description,
          dayOfWeek: dayOfWeek !== undefined ? parseInt(dayOfWeek) : undefined,
          startTime,
          endTime,
          courseId,
          teacher,
          room,
          maxStudents: maxStudents !== undefined ? parseInt(maxStudents) : undefined,
          status,
          updatedBy: session.user.id
        },
        include: {
          updater: { select: { name: true } }
        }
      })
      return res.status(200).json(schedule)
    } catch (error) {
      console.error('PUT error:', error)
      return res.status(500).json({ message: 'Server xatoligi' })
    }
  }

  // DELETE - darsni o'chirish (faqat admin)
  if (req.method === 'DELETE') {
    if (!session || session.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Ruxsat yo\'q' })
    }

    try {
      await prisma.schedule.delete({ where: { id } })
      return res.status(200).json({ message: 'Dars o\'chirildi' })
    } catch (error) {
      console.error('DELETE error:', error)
      return res.status(500).json({ message: 'Server xatoligi' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
