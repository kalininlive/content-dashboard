import OpenAI from "openai"
import { db } from "@/db"
import { adminSettings } from "@/db/schema"
import { decrypt } from "./crypto"

/** Returns an OpenAI client using the key stored in admin_settings. */
export async function getOpenAIClient(): Promise<OpenAI> {
  const [settings] = await db.select().from(adminSettings).limit(1)
  if (!settings?.openaiKeyEnc) {
    throw new Error("OpenAI API key not configured. Add it in Admin Settings.")
  }
  const apiKey = decrypt(settings.openaiKeyEnc)
  return new OpenAI({ apiKey })
}

const MODEL = "gpt-4o-mini"

/** Generate a social media caption. */
export async function generateCaption(params: {
  topic: string
  style: string
  language: "ru" | "en"
  accountContext?: string
}): Promise<string> {
  const client = await getOpenAIClient()

  const systemPrompt = params.language === "ru"
    ? `Ты эксперт по SMM. Пишешь цепляющие подписи для Instagram на русском языке. Стиль: ${params.style}.${params.accountContext ? ` Контекст аккаунта: ${params.accountContext}` : ""}`
    : `You are an SMM expert. Write engaging Instagram captions in English. Style: ${params.style}.${params.accountContext ? ` Account context: ${params.accountContext}` : ""}`

  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Напиши подпись для поста на тему: "${params.topic}". Без хэштегов. Максимум 2200 символов.` },
    ],
    max_tokens: 600,
  })

  return completion.choices[0]?.message?.content?.trim() ?? ""
}

/** Generate relevant hashtags. */
export async function generateHashtags(caption: string, language: "ru" | "en" = "ru"): Promise<string[]> {
  const client = await getOpenAIClient()

  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: language === "ru"
          ? "Ты эксперт по Instagram-маркетингу. Выбираешь наиболее эффективные хэштеги."
          : "You are an Instagram marketing expert. Select the most effective hashtags.",
      },
      {
        role: "user",
        content: `Для этой подписи предложи 15-20 хэштегов (смешай популярные и нишевые). Верни только хэштеги через пробел, без лишнего текста.\n\n${caption}`,
      },
    ],
    max_tokens: 200,
  })

  const text = completion.choices[0]?.message?.content?.trim() ?? ""
  return text.split(/\s+/).filter((t) => t.startsWith("#"))
}

/** Summarize a news article. */
export async function summarizeNews(title: string, content: string): Promise<string> {
  const client = await getOpenAIClient()

  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: "Кратко резюмируй новость в 2-3 предложения на русском языке." },
      { role: "user", content: `Заголовок: ${title}\n\nТекст: ${content}` },
    ],
    max_tokens: 200,
  })

  return completion.choices[0]?.message?.content?.trim() ?? ""
}

/** AI insights about a competitor. */
export async function analyzeCompetitor(params: {
  handle: string
  followers: number
  engagementRate: number
  postsPerWeek: number
  growth30d: number[]
}): Promise<string> {
  const client = await getOpenAIClient()

  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: "Ты аналитик социальных сетей. Анализируй данные конкурента и давай практические советы на русском языке.",
      },
      {
        role: "user",
        content: `Конкурент @${params.handle}:
- Подписчики: ${params.followers.toLocaleString()}
- Вовлечённость: ${params.engagementRate.toFixed(2)}%
- Постов в неделю: ${params.postsPerWeek}
- Рост за 30 дней: ${params.growth30d.join(", ")}

Дай 3-4 коротких инсайта и совета для улучшения моей стратегии.`,
      },
    ],
    max_tokens: 400,
  })

  return completion.choices[0]?.message?.content?.trim() ?? ""
}

/** Generate a topic/idea for auto-pilot. */
export async function generateTopic(accountContext: string): Promise<string> {
  const client = await getOpenAIClient()

  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: `Ты генерируешь идеи для постов в Instagram. Аккаунт: ${accountContext}`,
      },
      {
        role: "user",
        content: "Предложи одну конкретную тему для поста. Только тема, без объяснений. Одно предложение.",
      },
    ],
    max_tokens: 100,
  })

  return completion.choices[0]?.message?.content?.trim() ?? ""
}
