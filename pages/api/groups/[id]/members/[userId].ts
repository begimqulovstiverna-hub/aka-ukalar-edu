import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  const { id, userId } = req.query

  if (!id || typeof id !== 'string' || !userId || typeof userId !== 'string') {
    return res.status(400).json({ message: 'ID noto\'g\'ri' })
  }

  // DELETE - a'zoni guruhdan chiqarish
  if (req.method === 'DELETE') {
    if (!session) {
      return res.status(401).json({ message: 'Ruxsat yo\'q' })
    }

    try {
      // Foydalanuvchi adminligini tekshirish
      const adminMember = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: id,
            userId: session.user.id
          }
        }
      })

      // O'zini chiqarish yoki admin tomonidan chiqarish
      const isSelf = session.user.id === userId
      const isAdmin = adminMember?.role === 'admin' || session.user.role === 'admin'

      if (!isSelf && !isAdmin) {
        return res.status(403).json({ message: 'Siz faqat o\'zingizni chiqara olasiz' })
      }

      // Oxirgi adminni chiqarib bo'lmaydi
      if (userId !== session.user.id) {
        const adminCount = await prisma.groupMember.count({
          where: {
            groupId: id,
            role: 'admin'
          }
        })

        if (adminCount <= 1 && isAdmin) {
          return res.status(400).json({ message: 'Guruhda kamida bitta admin bo\'lishi kerak' })
        }
      }

      await prisma.groupMember.delete({
        where: {
          groupId_userId: {
            groupId: id,
            userId: userId as string
          }
        }
      })

      return res.status(200).json({ message: 'A\'zo guruhdan chiqarildi' })
    } catch (error) {
      console.error('DELETE member error:', error)
      return res.status(500).json({ message: 'Server xatoligi' })
    }
  }

  // PUT - a'zo rolini o'zgartirish
  if (req.method === 'PUT') {
    if (!session) {
      return res.status(401).json({ message: 'Ruxsat yo\'q' })
    }

    try {
      const adminMember = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: id,
            userId: session.user.id
          }
        }
      })

      if (adminMember?.role !== 'admin' && session.user.role !== 'admin') {
        return res.status(403).json({ message: 'Siz guruh admini emassiz' })
      }

      const { role } = req.body

      if (role !== 'admin' && role !== 'member') {
        return res.status(400).json({ message: 'Noto\'g\'ri rol' })
      }

      // Oxirgi adminni o'zgartirib bo'lmaydi
      if (role !== 'admin') {
        const adminCount = await prisma.groupMember.count({
          where: {
            groupId: id,
            role: 'admin'
          }
        })

        if (adminCount <= 1) {
          return res.status(400).json({ message: 'Guruhda kamida bitta admin bo\'lishi kerak' })
        }
      }

      const member = await prisma.groupMember.update({
        where: {
          groupId_userId: {
            groupId: id,
            userId: userId as string
          }
        },
        data: { role },
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true }
          }
        }
      })

      return res.status(200).json(member)
    } catch (error) {
      console.error('PUT member error:', error)
      return res.status(500).json({ message: 'Server xatoligi' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
