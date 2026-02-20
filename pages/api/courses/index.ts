import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  // GET - barcha kurslarni olish (hamma ko'ra oladi)
  if (req.method === 'GET') {
    try {
      const courses = await prisma.course.findMany({
        where: { published: true },
        include: { lessons: { orderBy: { order: 'asc' } } },
        orderBy: { createdAt: 'desc' }
      })
      return res.status(200).json(courses)
    } catch (error) {
      return res.status(500).json({ message: 'Server xatoligi' })
    }
  }

  // POST - yangi kurs yaratish (faqat admin yoki creator)
  if (req.method === 'POST') {
    if (!session || (session.user?.role !== 'admin' && session.user?.role !== 'creator')) {
      return res.status(403).json({ message: 'Ruxsat yo\'q' })
    }

    const { title, description, price, image, published } = req.body

    if (!title) {
      return res.status(400).json({ message: 'Kurs nomi majburiy' })
    }

    try {
      // Yangi kurs default published = true (agar client tomonidan so'ralmasa)
      const course = await prisma.course.create({
        data: {
          title,
          description,
          price: price ? parseFloat(price) : null,
          image,
          published: published ?? true   // published kelmasa, true qil
        }
      })
      return res.status(201).json(course)
    } catch (error) {
      return res.status(500).json({ message: 'Server xatoligi' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
