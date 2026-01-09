import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
    try {
        const { token, password } = await req.json()

        if (!token || !password) {
            return NextResponse.json(
                { error: 'Token ve şifre gerekli' },
                { status: 400 }
            )
        }

        // Validate password strength
        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Şifre en az 6 karakter olmalıdır' },
                { status: 400 }
            )
        }

        // Find token
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token },
            include: { user: true }
        })

        if (!resetToken) {
            return NextResponse.json(
                { error: 'Geçersiz veya süresi dolmuş token' },
                { status: 400 }
            )
        }

        // Check if token is expired
        if (resetToken.expiresAt < new Date()) {
            return NextResponse.json(
                { error: 'Token süresi dolmuş. Lütfen yeni bir şifre sıfırlama talebi oluşturun.' },
                { status: 400 }
            )
        }

        // Check if token is already used
        if (resetToken.used) {
            return NextResponse.json(
                { error: 'Bu token zaten kullanılmış' },
                { status: 400 }
            )
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(password, 10)

        // Update user password and mark token as used
        await prisma.$transaction([
            prisma.user.update({
                where: { id: resetToken.userId },
                data: { passwordHash }
            }),
            prisma.passwordResetToken.update({
                where: { id: resetToken.id },
                data: { used: true }
            })
        ])

        return NextResponse.json({
            success: true,
            message: 'Şifreniz başarıyla güncellendi. Şimdi giriş yapabilirsiniz.'
        })

    } catch (error) {
        console.error('Reset password error:', error)
        return NextResponse.json(
            { error: 'Bir hata oluştu' },
            { status: 500 }
        )
    }
}
