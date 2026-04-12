import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { subjectName, gradeLevel, topic } = await req.json()

    if (!subjectName || !gradeLevel) {
      return NextResponse.json(
        { error: 'Subject and grade are required' },
        { status: 400 }
      )
    }

    const prompt = `You are an expert educator writing lesson content for school students.

Write a clear engaging lesson for:
Subject: ${subjectName}
Grade Level: ${gradeLevel}
Topic: ${topic || subjectName}

Rules:
1. Write appropriate content for Grade ${gradeLevel} students
2. Use simple clear language
3. Include key terms in CAPITALS when first introduced
4. Include real world examples kids can relate to
5. Keep it between 150 and 250 words
6. Structure it as flowing paragraphs not bullet points
7. Make it engaging and interesting

Return ONLY a valid JSON object with no markdown, no backticks, no explanation:
{
  "title": "Lesson title here",
  "content": "Full lesson content here as a single string with paragraph breaks using \\n\\n"
}`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
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

    const lesson = JSON.parse(cleaned)
    return NextResponse.json({ lesson })

  } catch (error: any) {
    console.error('Generate lesson error:', error)
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}