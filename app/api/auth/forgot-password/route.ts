export const runtime = "nodejs"

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendPasswordResetEmail } from '@/lib/email'
import { randomUUID } from 'crypto'

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json()

        if (!email) {
            return NextResponse.json(
                { error: 'Email gerekli' },
                { status: 400 }
            )
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, name: true, email: true }
        })

        // Always return success to prevent email enumeration
        // (Güvenlik: Email'in sistemde olup olmadığını belli etme)
        if (!user) {
            return NextResponse.json({
                success: true,
                message: 'Eğer bu email sistemde kayıtlıysa, şifre sıfırlama linki gönderildi.'
            })
        }

        // Delete old unused tokens for this user
        await prisma.passwordResetToken.deleteMany({
            where: {
                userId: user.id,
                OR: [
                    { used: true },
                    { expiresAt: { lt: new Date() } }
                ]
            }
        })

        // Check rate limiting (max 3 requests per hour)
        const recentTokens = await prisma.passwordResetToken.count({
            where: {
                userId: user.id,
                createdAt: {
                    gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
                }
            }
        })

        if (recentTokens >= 3) {
            return NextResponse.json({
                success: false,
                error: 'Çok fazla istek. Lütfen 1 saat sonra tekrar deneyin.'
            }, { status: 429 })
        }

        // Generate reset token
        const token = randomUUID()
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes

        // Save token to database
        await prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                token,
                expiresAt
            }
        })

        // Send email
        const emailResult = await sendPasswordResetEmail(
            user.email!,
            token,
            user.name || undefined
        )

        if (!emailResult.success) {
            console.error('Failed to send reset email:', emailResult.error)
            return NextResponse.json({
                success: false,
                error: 'Email gönderilemedi. Lütfen daha sonra tekrar deneyin.'
            }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            message: 'Şifre sıfırlama linki email adresinize gönderildi.'
        })

    } catch (error) {
        console.error('Forgot password error:', error)
        return NextResponse.json(
            { error: 'Bir hata oluştu' },
            { status: 500 }
        )
    }
}
