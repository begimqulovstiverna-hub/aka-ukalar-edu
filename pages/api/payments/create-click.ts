import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { courseId, amount } = req.body

    // Click to'lov URL'ini yaratish (o'z ma'lumotlaringizni yozing)
    const paymentUrl = `https://my.click.uz/services/pay?service_id=12345&merchant_id=12345&amount=${amount}&transaction_param=${courseId}&return_url=${process.env.NEXTAUTH_URL}/profile`

    res.status(200).json({ 
      success: true, 
      paymentUrl
    })
  } catch (error) {
    console.error('Click to\'lov xatolik:', error)
    res.status(500).json({ message: 'Server xatoligi' })
  }
}
