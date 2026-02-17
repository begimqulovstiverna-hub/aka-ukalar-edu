import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  // GET - barcha darslarni olish
  if (req.method === 'GET') {
    try {
      const schedules = await prisma.schedule.findMany({
        include: { 
          course: { 
            select: { title: true, image: true } 
          },
          creator: {
            select: { name: true, email: true }
          },
          updater: {
            select: { name: true, email: true }
          }
        },
        orderBy: [
          { dayOfWeek: 'asc' },
          { startTime: 'asc' }
        ]
      })
      return res.status(200).json(schedules)
    } catch (error) {
      console.error('GET error:', error)
      return res.status(500).json({ message: 'Server xatoligi' })
    }
  }

  // POST - yangi dars qo'shish (faqat admin)
  if (req.method === 'POST') {
    if (!session || session.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Ruxsat yo\'q' })
    }

    const { title, description, dayOfWeek, startTime, endTime, courseId, teacher, room, maxStudents } = req.body

    if (!title || dayOfWeek === undefined || !startTime || !endTime || !courseId) {
      return res.status(400).json({ 
        message: 'Majburiy maydonlar: title, dayOfWeek, startTime, endTime, courseId'
      })
    }

    try {
      const schedule = await prisma.schedule.create({
        data: {
          title,
          description: description || '',
          dayOfWeek: parseInt(dayOfWeek),
          startTime,
          endTime,
          courseId,
          teacher: teacher || '',
          room: room || '',
          maxStudents: maxStudents ? parseInt(maxStudents) : null,
          createdBy: session.user.id,
          updatedBy: session.user.id,
          status: 'active'
        },
        include: {
          creator: { select: { name: true } },
          updater: { select: { name: true } }
        }
      })
      return res.status(201).json(schedule)
    } catch (error) {
      console.error('POST error:', error)
      return res.status(500).json({ message: 'Server xatoligi' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
