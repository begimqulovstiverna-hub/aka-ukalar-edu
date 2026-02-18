import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  // GET - foydalanuvchining commentlarini olish
  if (req.method === 'GET') {
    try {
      const { userId } = req.query
      
      const comments = await prisma.comment.findMany({
        where: { userId: userId as string },
        include: {
          post: {
            select: { id: true, title: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
      
      return res.status(200).json(comments)
    } catch (error) {
      console.error('GET comments error:', error)
      return res.status(500).json({ message: 'Server xatoligi' })
    }
  }

  // POST - yangi comment yozish
  if (req.method === 'POST') {
    if (!session) {
      return res.status(401).json({ message: 'Comment yozish uchun tizimga kiring' })
    }

    const { content, postId, parentId } = req.body

    if (!content || !postId) {
      return res.status(400).json({ message: 'Matn va post ID majburiy' })
    }

    try {
      const comment = await prisma.comment.create({
        data: {
          content,
          userId: session.user.id,
          postId,
          parentId: parentId || null
        },
        include: {
          user: { select: { name: true, image: true, role: true } }
        }
      })
      return res.status(201).json(comment)
    } catch (error) {
      console.error('POST error:', error)
      return res.status(500).json({ message: 'Server xatoligi' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
