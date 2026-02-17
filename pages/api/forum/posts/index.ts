import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  // GET - barcha postlarni olish
  if (req.method === 'GET') {
    try {
      const posts = await prisma.post.findMany({
        include: {
          user: { select: { name: true, email: true } },
          course: { select: { title: true } },
          comments: {
            include: {
              user: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
      return res.status(200).json(posts)
    } catch (error) {
      console.error('GET error:', error)
      return res.status(500).json({ message: 'Server xatoligi' })
    }
  }

  // POST - yangi post yozish
  if (req.method === 'POST') {
    if (!session) {
      return res.status(401).json({ message: 'Post yozish uchun tizimga kiring' })
    }

    const { title, content, courseId } = req.body

    if (!title || !content) {
      return res.status(400).json({ message: 'Sarlavha va matn majburiy' })
    }

    try {
      const post = await prisma.post.create({
        data: {
          title,
          content,
          userId: session.user.id,
          courseId: courseId || null
        },
        include: {
          user: { select: { name: true } }
        }
      })
      return res.status(201).json(post)
    } catch (error) {
      console.error('POST error:', error)
      return res.status(500).json({ message: 'Server xatoligi' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
