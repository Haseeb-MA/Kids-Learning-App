import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { question, correctAnswer, grade, lessonTitle } = await req.json()

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: `You are a friendly teacher explaining a concept to a Grade ${grade} student.

The quiz question was: "${question}"
The correct answer is: "${correctAnswer}"
This is from the lesson: "${lessonTitle}"

Explain WHY this is the correct answer in a simple friendly way that a Grade ${grade} student would understand.
Then give ONE short real life example to help them remember.
Keep your total response under 80 words.
Use encouraging language.
Do not start with "I" or repeat the question back.`,
      }],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    return NextResponse.json({ explanation: content.text })

  } catch (error: any) {
    console.error('Explain question error:', error)
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}