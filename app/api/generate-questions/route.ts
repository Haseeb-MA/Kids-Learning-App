import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { lessonTitle, lessonContent, gradeLevel, subjectName } = await req.json()

    if (!lessonContent) {
      return NextResponse.json(
        { error: 'Lesson content is required' },
        { status: 400 }
      )
    }

    const prompt = `You are an expert educator creating multiple choice quiz questions for primary and secondary school students.

Generate 5 multiple choice questions based on this lesson:

Subject: ${subjectName}
Grade Level: ${gradeLevel}
Lesson Title: ${lessonTitle}
Lesson Content: ${lessonContent}

Rules:
1. Questions must be appropriate for Grade ${gradeLevel} students
2. Each question must have exactly 4 options (a, b, c, d)
3. Only one option should be correct
4. Questions should test understanding not just memorisation
5. Use simple clear language appropriate for the grade level
6. Vary the difficulty — mix easy, medium and hard questions

Return ONLY a valid JSON array with no markdown, no backticks, no explanation. Just the raw JSON array like this:
[
  {
    "question": "Question text here?",
    "option_a": "First option",
    "option_b": "Second option",
    "option_c": "Third option",
    "option_d": "Fourth option",
    "correct_answer": "a",
    "explanation": "Brief explanation of why this is correct"
  }
]`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    const cleaned = content.text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    const questions = JSON.parse(cleaned)

    return NextResponse.json({ questions })

  } catch (error: any) {
    console.error('Generate questions error:', error)
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}