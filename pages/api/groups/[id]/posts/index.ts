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

  // GET - guruhdagi barcha postlarni olish
  if (req.method === 'GET') {
    try {
      const posts = await prisma.groupPost.findMany({
        where: { groupId: id },
        include: {
          user: {
            select: { id: true, name: true, image: true, role: true }
          },
          comments: {
            include: {
              user: {
                select: { id: true, name: true, image: true, role: true }
              },
              reactions: true
            },
            orderBy: { createdAt: 'asc' }
          },
          reactions: true,
          _count: {
            select: { comments: true, reactions: true }
          }
        },
        orderBy: [
          { pinned: 'desc' },
          { createdAt: 'desc' }
        ]
      })
      return res.status(200).json(posts)
    } catch (error) {
      console.error('GET posts error:', error)
      return res.status(500).json({ message: 'Server xatoligi' })
    }
  }

  // POST - yangi post yaratish
  if (req.method === 'POST') {
    if (!session) {
      return res.status(401).json({ message: 'Post yozish uchun tizimga kiring' })
    }

    try {
      // Guruh mavjudligini va a'zolikni tekshirish
      const member = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: id,
            userId: session.user.id
          }
        },
        include: {
          group: {
            include: { settings: true }
          }
        }
      })

      if (!member) {
        return res.status(403).json({ message: 'Siz guruh a\'zosi emassiz' })
      }

      // Agar faqat adminlar post yozishi mumkin bo'lsa
      if (member.group.settings?.onlyAdminsCanPost && member.role !== 'admin' && session.user.role !== 'admin') {
        return res.status(403).json({ message: 'Faqat adminlar post yozishi mumkin' })
      }

      const { content } = req.body

      if (!content) {
        return res.status(400).json({ message: 'Post matni majburiy' })
      }

      const post = await prisma.groupPost.create({
        data: {
          content,
          groupId: id,
          userId: session.user.id
        },
        include: {
          user: {
            select: { id: true, name: true, image: true, role: true }
          }
        }
      })

      return res.status(201).json(post)
    } catch (error) {
      console.error('POST post error:', error)
      return res.status(500).json({ message: 'Server xatoligi' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
