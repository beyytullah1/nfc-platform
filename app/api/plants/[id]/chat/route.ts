export const runtime = "nodejs"

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const { message } = await request.json()

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 })
        }

        // Fetch plant with logs
        const plant = await prisma.plant.findUnique({
            where: { id },
            include: {
                owner: { select: { name: true } },
                logs: {
                    orderBy: { createdAt: 'desc' },
                    take: 50
                },
                chats: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                }
            }
        })

        if (!plant) {
            return NextResponse.json({ error: 'Plant not found' }, { status: 404 })
        }

        // Check ownership
        const isOwner = plant.ownerId === session.user.id
        if (!isOwner) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // Calculate plant statistics
        const daysOwned = Math.floor((Date.now() - new Date(plant.createdAt).getTime()) / (1000 * 60 * 60 * 24))
        const wateringCount = plant.logs.filter(l => l.logType === 'water').length
        const fertilizeCount = plant.logs.filter(l => l.logType === 'fertilize').length
        const lastWatered = plant.logs.find(l => l.logType === 'water')
        const lastWateredDays = lastWatered
            ? Math.floor((Date.now() - new Date(lastWatered.createdAt).getTime()) / (1000 * 60 * 60 * 24))
            : null

        // Build conversation context
        const conversationHistory = plant.chats.reverse().map(chat => ({
            role: chat.role,
            content: chat.content
        }))

        // Build system context
        const systemContext = `Sen bir bitki bakım asistanısın. Kullanıcının "${plant.name}" adlı ${plant.species || 'bitkisi'} hakkında sorularını yanıtlıyorsun.

Bitki Bilgileri:
- İsim: ${plant.name}
- Tür: ${plant.species || 'Bilinmiyor'}
- Sahip olunma süresi: ${daysOwned} gün
- Toplam sulama: ${wateringCount} kez
- Toplam gübreleme: ${fertilizeCount} kez
${lastWateredDays !== null ? `- Son sulama: ${lastWateredDays} gün önce` : '- Henüz sulanmamış'}

Lütfen Türkçe cevap ver ve bitki bakımı konusunda yardımcı ol. Kısa ve anlaşılır cevaplar ver.`

        // Build Gemini request
        const contents = [
            {
                role: 'user',
                parts: [{ text: systemContext }]
            },
            ...conversationHistory.map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            })),
            {
                role: 'user',
                parts: [{ text: message }]
            }
        ]

        // Get API key - first check user's custom key, then default env variable
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { geminiApiKey: true }
        })
        const apiKey = user?.geminiApiKey || process.env.GEMINI_API_KEY

        if (!apiKey) {
            return NextResponse.json({ error: 'Gemini API key not configured. Please add your key in settings.' }, { status: 500 })
        }

        // Call Gemini API (using URL parameter for API key)
        const geminiApiUrl = `${GEMINI_API_URL}?key=${apiKey}`
        const geminiResponse = await fetch(geminiApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ contents })
        })

        if (!geminiResponse.ok) {
            const errorData = await geminiResponse.json().catch(() => ({}))
            console.error('Gemini API error:', {
                status: geminiResponse.status,
                statusText: geminiResponse.statusText,
                error: errorData
            })
            return NextResponse.json({
                error: 'AI service error',
                details: errorData?.error?.message || geminiResponse.statusText
            }, { status: 502 })
        }

        const geminiData = await geminiResponse.json()
        const reply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'Üzgünüm, bir yanıt oluşturamadım.'

        // Save conversation to database
        await prisma.$transaction([
            prisma.plantAiChat.create({
                data: {
                    plantId: id,
                    userId: session.user.id,
                    role: 'user',
                    content: message
                }
            }),
            prisma.plantAiChat.create({
                data: {
                    plantId: id,
                    userId: session.user.id,
                    role: 'assistant',
                    content: reply
                }
            })
        ])

        return NextResponse.json({ reply })
    } catch (error) {
        console.error('Plant chat error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// GET - Fetch chat history
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        const plant = await prisma.plant.findUnique({
            where: { id },
            select: { ownerId: true }
        })

        if (!plant || plant.ownerId !== session.user.id) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 })
        }

        const chats = await prisma.plantAiChat.findMany({
            where: { plantId: id },
            orderBy: { createdAt: 'asc' },
            take: 50
        })

        return NextResponse.json({ chats })
    } catch (error) {
        console.error('Fetch chat error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
