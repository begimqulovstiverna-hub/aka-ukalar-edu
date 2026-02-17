import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import bcrypt from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { token, password } = req.body

  if (!token || !password) {
    return res.status(400).json({ message: 'Token va parol majburiy' })
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Parol kamida 6 belgidan iborat bo\'lishi kerak' })
  }

  try {
    // Tokenni tekshirish (User modeliga resetToken va resetTokenExpiry qo'shilgandan keyin)
    /*
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }
      }
    })

    if (!user) {
      return res.status(400).json({ message: 'Yaroqsiz yoki muddati o\'tgan token' })
    }

    // Yangi parolni hash qilish
    const hashedPassword = await bcrypt.hash(password, 10)

    // Parolni yangilash va tokenni tozalash
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    })
    */

    // Hozircha test uchun
    return res.status(200).json({ message: 'Parol muvaffaqiyatli o\'zgartirildi' })
  } catch (error) {
    console.error('Reset password error:', error)
    return res.status(500).json({ message: 'Server xatoligi' })
  }
}
