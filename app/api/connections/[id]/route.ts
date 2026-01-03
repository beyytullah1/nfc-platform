import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

// PATCH - Connection güncelle (grup, not, etiket)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Giriş yapmanız gerekiyor.' },
                { status: 401 }
            )
        }

        const { id } = await params
        const body = await request.json()
        const { categoryId, myNote, myTags } = body

        // Connection sahibini kontrol et
        const connection = await prisma.connection.findUnique({
            where: { id }
        })

        if (!connection || connection.userId !== session.user.id) {
            return NextResponse.json(
                { error: 'Yetkisiz erişim.' },
                { status: 403 }
            )
        }

        // Güncelle
        const updated = await prisma.connection.update({
            where: { id },
            data: {
                categoryId: categoryId === '' ? null : categoryId,
                myNote,
                myTags: myTags ? JSON.stringify(myTags) : null
            }
        })

        return NextResponse.json({ success: true, connection: updated })
    } catch (error) {
        console.error('Update connection error:', error)
        return NextResponse.json(
            { error: 'Güncelleme başarısız.' },
            { status: 500 }
        )
    }
}

// DELETE - Connection sil
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Giriş yapmanız gerekiyor.' },
                { status: 401 }
            )
        }

        const { id } = await params

        // Connection sahibini kontrol et
        const connection = await prisma.connection.findUnique({
            where: { id }
        })

        if (!connection || connection.userId !== session.user.id) {
            return NextResponse.json(
                { error: 'Yetkisiz erişim.' },
                { status: 403 }
            )
        }

        await prisma.connection.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete connection error:', error)
        return NextResponse.json(
            { error: 'Silme başarısız.' },
            { status: 500 }
        )
    }
}
