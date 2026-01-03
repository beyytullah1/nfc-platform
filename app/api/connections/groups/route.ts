import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// POST - Yeni grup oluştur
export async function POST(request: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Giriş yapmanız gerekiyor.' },
                { status: 401 }
            )
        }

        const { name, color, icon } = await request.json()

        if (!name) {
            return NextResponse.json(
                { error: 'Grup adı gerekli.' },
                { status: 400 }
            )
        }

        const category = await prisma.connectionCategory.create({
            data: {
                userId: session.user.id,
                name,
                color: color || '#3498db',
                icon: icon || '📁'
            }
        })

        return NextResponse.json({ success: true, category })
    } catch (error) {
        console.error('Create category error:', error)
        return NextResponse.json(
            { error: 'Grup oluşturulamadı.' },
            { status: 500 }
        )
    }
}

// GET - Kullanıcının grupları
export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Giriş yapmanız gerekiyor.' },
                { status: 401 }
            )
        }

        const categories = await prisma.connectionCategory.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ categories })
    } catch (error) {
        console.error('Get categories error:', error)
        return NextResponse.json(
            { error: 'Gruplar getirilemedi.' },
            { status: 500 }
        )
    }
}
