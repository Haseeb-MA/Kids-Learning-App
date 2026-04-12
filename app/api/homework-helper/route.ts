import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { question, grade, subject, messages } = await req.json()

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      )
    }

    const systemPrompt = `You are a friendly and encouraging learning assistant for BrightMinds, 
a kids learning app. You are helping a Grade ${grade} student with ${subject}.

Your role is to GUIDE students to find answers themselves, never give direct answers.
Follow these rules strictly:

1. Always give hints and clues, never the direct answer
2. Use simple language appropriate for Grade ${grade}
3. Use encouraging and friendly tone — celebrate effort
4. If asked for an example, give a DIFFERENT but similar example
5. Break down complex concepts into small simple steps
6. Use analogies and real life examples kids can relate to
7. If a child seems frustrated, be extra encouraging
8. Keep responses short and easy to read — maximum 4 sentences
9. End every response with a question that guides them to think further
10. Never make a child feel bad for not knowing something`

    const formattedMessages = messages.map((m: any) => ({
      role: m.role,
      content: m.content,
    }))

    formattedMessages.push({
      role: 'user',
      content: question,
    })

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: formattedMessages,
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    return NextResponse.json({ reply: content.text })

  } catch (error: any) {
    console.error('Homework helper error:', JSON.stringify(error, null, 2))
console.error('Error message:', error.message)
console.error('API Key exists:', !!process.env.ANTHROPIC_API_KEY)
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}