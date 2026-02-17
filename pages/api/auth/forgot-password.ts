import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { sendPasswordResetEmail } from '../../../lib/email'
import crypto from 'crypto'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { email } = req.body

  if (!email) {
    return res.status(400).json({ message: 'Email kiritish majburiy' })
  }

  try {
    // Foydalanuvchini tekshirish
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(404).json({ message: 'Bu email bilan foydalanuvchi topilmadi' })
    }

    // Xavfsiz token yaratish [citation:4]
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 soat

    // Tokenni saqlash (Verification jadvali kerak yoki User ga qo'shish kerak)
    // Hozircha User modeliga resetToken va resetTokenExpiry qo'shish kerak
    
    // Email yuborish
    try {
      await sendPasswordResetEmail(email, resetToken)
      
      // Tokenlarni saqlash (keyingi qadamda)
      // await prisma.user.update({
      //   where: { email },
      //   data: {
      //     resetToken,
      //     resetTokenExpiry
      //   }
      // })

      return res.status(200).json({ 
        message: 'Parolni tiklash bo\'yicha ko\'rsatmalar email manzilingizga yuborildi' 
      })
    } catch (emailError) {
      console.error('Email yuborishda xatolik:', emailError)
      return res.status(500).json({ 
        message: 'Email yuborishda xatolik yuz berdi. Iltimos, qaytadan urinib ko\'ring.' 
      })
    }
  } catch (error) {
    console.error('Forgot password error:', error)
    return res.status(500).json({ message: 'Server xatoligi' })
  }
}
