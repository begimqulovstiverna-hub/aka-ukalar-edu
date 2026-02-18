import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { enrollmentId } = req.body

    // Bu yerda ma'lumotlar bazasiga saqlash kerak
    // Hozircha oddiygina muvaffaqiyatli deb qaytaramiz

    res.status(200).json({ 
      success: true, 
      message: 'To\'lov ma\'lumoti yuborildi' 
    })
  } catch (error) {
    console.error('Offline to\'lov xatolik:', error)
    res.status(500).json({ message: 'Server xatoligi' })
  }
}
