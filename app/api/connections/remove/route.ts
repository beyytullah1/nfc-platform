export const runtime = "nodejs"

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function DELETE(request: Request) {
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { connectionId } = await request.json()

        if (!connectionId) {
            return NextResponse.json({ error: 'Connection ID gerekli' }, { status: 400 })
        }

        // Connection'ı kontrol et ve kullanıcıya ait mi doğrula
        const connection = await prisma.connection.findUnique({
            where: { id: connectionId }
        })

        if (!connection) {
            return NextResponse.json({ error: 'Bağlantı bulunamadı' }, { status: 404 })
        }

        if (connection.userId !== session.user.id) {
            return NextResponse.json({ error: 'Bu bağlantıyı silemezsiniz' }, { status: 403 })
        }

        // Connection'ı sil
        await prisma.connection.delete({
            where: { id: connectionId }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Remove connection error:', error)
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
    }
}
