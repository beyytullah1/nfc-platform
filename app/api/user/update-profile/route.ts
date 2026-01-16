export const runtime = "nodejs"

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { username } = await req.json()

        if (!username || username.length < 3 || username.length > 20) {
            return NextResponse.json(
                { error: 'Kullanıcı adı 3-20 karakter olmalıdır' },
                { status: 400 }
            )
        }

        // Check if username is already taken
        const existingUser = await prisma.user.findUnique({
            where: { username }
        })

        if (existingUser && existingUser.id !== session.user.id) {
            return NextResponse.json(
                { error: 'Bu kullanıcı adı zaten kullanılıyor' },
                { status: 400 }
            )
        }

        // Update user
        await prisma.user.update({
            where: { id: session.user.id },
            data: { username }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Profile update error:', error)
        return NextResponse.json(
            { error: 'Sunucu hatası' },
            { status: 500 }
        )
    }
}
