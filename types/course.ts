export interface Course {
  id: string
  title: string
  description: string | null
  price: number | null
  image: string | null
  published: boolean
  createdAt: string
  updatedAt: string
  lessons?: Lesson[]
}

export interface Lesson {
  id: string
  title: string
  content: string | null
  videoUrl: string | null
  duration: number | null
  order: number
  published: boolean
}

export interface CreateCourseInput {
  title: string
  description?: string
  price?: number
  image?: string
  published?: boolean
}

export interface UpdateCourseInput extends Partial<CreateCourseInput> {}
