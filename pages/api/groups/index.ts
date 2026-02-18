import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  // GET - barcha guruhlarni olish
  if (req.method === 'GET') {
    try {
      const groups = await prisma.group.findMany({
        include: {
          _count: {
            select: { members: true, posts: true }
          },
          createdBy: {
            select: { name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
      return res.status(200).json(groups)
    } catch (error) {
      console.error('GET groups error:', error)
      return res.status(500).json({ message: 'Server xatoligi' })
    }
  }

  // POST - yangi guruh yaratish
  if (req.method === 'POST') {
    if (!session) {
      return res.status(401).json({ message: 'Guruh yaratish uchun tizimga kiring' })
    }

    const { name, description, avatar } = req.body

    if (!name) {
      return res.status(400).json({ message: 'Guruh nomi majburiy' })
    }

    try {
      // Guruh yaratish
      const group = await prisma.group.create({
        data: {
          name,
          description,
          avatar,
          createdById: session.user.id,
          settings: {
            create: {
              onlyAdminsCanPost: true,
              joinRequiresApproval: false
            }
          },
          members: {
            create: {
              userId: session.user.id,
              role: 'admin'
            }
          }
        },
        include: {
          createdBy: {
            select: { name: true, email: true }
          },
          members: {
            include: {
              user: {
                select: { name: true, email: true, image: true }
              }
            }
          }
        }
      })

      return res.status(201).json(group)
    } catch (error) {
      console.error('POST group error:', error)
      return res.status(500).json({ message: 'Server xatoligi' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
