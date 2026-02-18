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

  // GET - bitta guruhni olish
  if (req.method === 'GET') {
    try {
      const group = await prisma.group.findUnique({
        where: { id },
        include: {
          createdBy: {
            select: { name: true, email: true, image: true }
          },
          settings: true,
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true, image: true, role: true }
              }
            },
            orderBy: {
              joinedAt: 'asc'
            }
          },
          posts: {
            where: { pinned: true },
            take: 3,
            orderBy: { createdAt: 'desc' }
          },
          _count: {
            select: { members: true, posts: true }
          }
        }
      })

      if (!group) {
        return res.status(404).json({ message: 'Guruh topilmadi' })
      }

      // Foydalanuvchi a'zoligini tekshirish
      let isMember = false
      let memberRole = null
      
      if (session) {
        const member = group.members.find(m => m.userId === session.user.id)
        isMember = !!member
        memberRole = member?.role
      }

      return res.status(200).json({
        ...group,
        isMember,
        memberRole
      })
    } catch (error) {
      console.error('GET group error:', error)
      return res.status(500).json({ message: 'Server xatoligi' })
    }
  }

  // PUT - guruhni tahrirlash
  if (req.method === 'PUT') {
    if (!session) {
      return res.status(401).json({ message: 'Ruxsat yo\'q' })
    }

    try {
      // Foydalanuvchi adminligini tekshirish
      const member = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: id,
            userId: session.user.id
          }
        }
      })

      if (!member || (member.role !== 'admin' && session.user.role !== 'admin')) {
        return res.status(403).json({ message: 'Siz guruh admini emassiz' })
      }

      const { name, description, avatar, settings } = req.body

      const group = await prisma.group.update({
        where: { id },
        data: {
          name,
          description,
          avatar,
          settings: settings ? {
            update: settings
          } : undefined
        },
        include: {
          settings: true
        }
      })

      return res.status(200).json(group)
    } catch (error) {
      console.error('PUT group error:', error)
      return res.status(500).json({ message: 'Server xatoligi' })
    }
  }

  // DELETE - guruhni o'chirish
  if (req.method === 'DELETE') {
    if (!session) {
      return res.status(401).json({ message: 'Ruxsat yo\'q' })
    }

    try {
      const member = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: id,
            userId: session.user.id
          }
        }
      })

      if (!member || (member.role !== 'admin' && session.user.role !== 'admin')) {
        return res.status(403).json({ message: 'Siz guruh admini emassiz' })
      }

      await prisma.group.delete({ where: { id } })
      return res.status(200).json({ message: 'Guruh o\'chirildi' })
    } catch (error) {
      console.error('DELETE group error:', error)
      return res.status(500).json({ message: 'Server xatoligi' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
