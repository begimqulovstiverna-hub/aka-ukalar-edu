import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  console.log('Session:', JSON.stringify(session, null, 2))

  if (!session) {
    return res.status(401).json({ enrolled: false })
  }

  console.log('User ID:', session.user?.id)
  console.log('User email:', session.user?.email)
  console.log('User role:', session.user?.role)

  const { courseId } = req.query

  if (!courseId || typeof courseId !== 'string') {
    return res.status(400).json({ message: 'Kurs ID si kerak' })
  }

  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: courseId
        }
      }
    })

    return res.status(200).json({ 
      enrolled: !!enrollment,
      enrollment 
    })
  } catch (error) {
    console.error('Check enrollment error:', error)
    return res.status(500).json({ message: 'Server xatoligi' })
  }
}
