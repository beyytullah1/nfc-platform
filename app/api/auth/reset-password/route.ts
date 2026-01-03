import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
    try {
        const { email, newPassword } = await request.json()

        if (!email || !newPassword) {
            return NextResponse.json(
                { error: 'Email ve şifre gerekli' },
                { status: 400 }
            )
        }

        // Kullanıcıyı bul
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Bu email ile kayıtlı kullanıcı bulunamadı' },
                { status: 404 }
            )
        }

        // Yeni şifreyi hashle
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        // Şifreyi güncelle
        await prisma.user.update({
            where: { email },
            data: { passwordHash: hashedPassword }
        })

        return NextResponse.json({
            success: true,
            message: 'Şifre başarıyla güncellendi'
        })
    } catch (error) {
        console.error('Reset password error:', error)
        return NextResponse.json(
            { error: 'Şifre güncellenirken hata oluştu' },
            { status: 500 }
        )
    }
}
