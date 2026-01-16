export const runtime = "nodejs"

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

// Kullanıcı bilgilerini getir
export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Giriş yapmanız gerekiyor.' },
                { status: 401 }
            )
        }

        let user
        try {
            user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    username: true,
                    bio: true,
                    avatarUrl: true,
                    createdAt: true
                }
            })

            if (!user) {
                return NextResponse.json(
                    { error: 'Kullanıcı bulunamadı.' },
                    { status: 404 }
                )
            }
        } catch (error) {
            console.error('Database error loading user:', error)
            return NextResponse.json(
                { error: 'Veritabanı hatası. Lütfen daha sonra tekrar deneyin.' },
                { status: 500 }
            )
        }

        return NextResponse.json({ user })
    } catch (error) {
        console.error('Get user error:', error)
        return NextResponse.json(
            { error: 'Bir hata oluştu.' },
            { status: 500 }
        )
    }
}

// Kullanıcı bilgilerini güncelle
export async function PATCH(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Giriş yapmanız gerekiyor.' },
                { status: 401 }
            )
        }

        // Input validation
        const { validateRequest, updateProfileSchema } = await import('@/lib/validations')
        const validation = await validateRequest(updateProfileSchema, request)
        if (validation.error) {
            return validation.error
        }

        const { username, bio, avatarUrl } = validation.data!

        // Additional username uniqueness check
        if (username !== undefined) {

            // Başka biri kullanıyor mu?
            const existingUser = await prisma.user.findUnique({
                where: { username }
            })

            if (existingUser && existingUser.id !== session.user.id) {
                return NextResponse.json(
                    { error: 'Bu username zaten kullanılıyor.' },
                    { status: 400 }
                )
            }
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                ...(username !== undefined && { username }),
                ...(bio !== undefined && { bio }),
                ...(avatarUrl !== undefined && { avatarUrl })
            },
            select: {
                id: true,
                name: true,
                email: true,
                username: true,
                bio: true,
                avatarUrl: true
            }
        })

        return NextResponse.json({ success: true, user: updatedUser })
    } catch (error) {
        console.error('Update user error:', error)
        return NextResponse.json(
            { error: 'Bir hata oluştu.' },
            { status: 500 }
        )
    }
}
