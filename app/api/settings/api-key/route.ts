export const runtime = "nodejs"

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET - Get current user's Gemini API key status (not the actual key)
export async function GET() {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { geminiApiKey: true }
        })

        return NextResponse.json({
            hasApiKey: !!user?.geminiApiKey,
            // Mask the key for display (first 10 chars + ...)
            maskedKey: user?.geminiApiKey
                ? `${user.geminiApiKey.substring(0, 10)}...${user.geminiApiKey.slice(-4)}`
                : null
        })
    } catch (error) {
        console.error('Get API key error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST - Save user's Gemini API key
export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { apiKey } = await request.json()

        // Validate API key format (basic check)
        if (apiKey && !apiKey.startsWith('AIza')) {
            return NextResponse.json({ error: 'Invalid Gemini API key format' }, { status: 400 })
        }

        // Update user's API key
        await prisma.user.update({
            where: { id: session.user.id },
            data: { geminiApiKey: apiKey || null }
        })

        return NextResponse.json({
            success: true,
            message: apiKey ? 'API key saved successfully' : 'API key removed'
        })
    } catch (error) {
        console.error('Save API key error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE - Remove user's Gemini API key
export async function DELETE() {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await prisma.user.update({
            where: { id: session.user.id },
            data: { geminiApiKey: null }
        })

        return NextResponse.json({ success: true, message: 'API key removed' })
    } catch (error) {
        console.error('Delete API key error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
