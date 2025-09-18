import { GoogleGenAI, Type } from '@google/genai'

import { GEMINI_API_KEY } from '@/lib/constants'

const genAi = new GoogleGenAI({ apiKey: GEMINI_API_KEY })

export { genAi, Type as GenAiType }
