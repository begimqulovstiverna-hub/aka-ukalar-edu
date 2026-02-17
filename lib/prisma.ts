import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

// Diagnostika
console.log('Current working directory:', process.cwd())
const envPath = path.resolve(process.cwd(), '.env')
console.log('Looking for .env at:', envPath)
console.log('.env file exists:', fs.existsSync(envPath))

// .env faylini yuklash
const result = dotenv.config({ path: envPath })
console.log('dotenv config result:', result)

// DATABASE_URL ni tekshirish
console.log('DATABASE_URL from process.env:', process.env.DATABASE_URL ? 'found' : 'NOT FOUND')

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not defined')
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// TO'G'RI YO'L: datasources (ko'plik) ishlatiladi
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
