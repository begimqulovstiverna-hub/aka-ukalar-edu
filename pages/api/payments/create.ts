import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).json({ message: 'Tizimga kiring' })
  }

  const { courseId, provider, couponCode } = req.body

  try {
    // Kursni tekshirish
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    })

    if (!course) {
      return res.status(404).json({ message: 'Kurs topilmadi' })
    }

    if (!course.price || course.price === 0) {
      return res.status(400).json({ message: 'Bu kurs bepul' })
    }

    // Oldin sotib olinmaganligini tekshirish
    const existing = await prisma.purchase.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId
        }
      }
    })

    if (existing) {
      return res.status(400).json({ message: 'Siz bu kursni allaqachon sotib olgansiz' })
    }

    let amount = course.price

    // Kupon tekshirish
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode }
      })

      if (coupon && (!coupon.expiresAt || coupon.expiresAt > new Date())) {
        if (!coupon.maxUses || coupon.usedCount < coupon.maxUses) {
          amount = amount * (100 - coupon.discount) / 100
        }
      }
    }

    // To'lov yozuvini yaratish
    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        courseId,
        amount,
        provider,
        status: 'pending'
      }
    })

    // To'lov tizimiga qarab URL yaratish
    let paymentUrl = ''
    
    if (provider === 'click') {
      paymentUrl = `https://my.click.uz/services/pay?service_id=${process.env.CLICK_SERVICE_ID}&merchant_id=${process.env.CLICK_MERCHANT_ID}&amount=${amount}&transaction_id=${payment.id}`
    } else if (provider === 'payme') {
      paymentUrl = `https://checkout.payme.uz/${process.env.PAYME_ID}?amount=${amount * 100}&account[payment_id]=${payment.id}`
    }

    return res.status(200).json({
      paymentId: payment.id,
      amount,
      paymentUrl
    })
  } catch (error) {
    console.error('Payment error:', error)
    return res.status(500).json({ message: 'Server xatoligi' })
  }
}
