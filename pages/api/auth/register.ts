import { NextApiRequest, NextApiResponse } from "next"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  const { name, email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: "Email va password majburiy" })
  }

  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    return res.status(400).json({ message: "Bu email allaqachon ro'yxatdan o'tgan" })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "user",
    },
  })

  return res.status(201).json({ 
    message: "Foydalanuvchi muvaffaqiyatli yaratildi",
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    }
  })
}
