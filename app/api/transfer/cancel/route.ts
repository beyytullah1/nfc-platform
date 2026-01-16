export const runtime = "nodejs"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: "Oturum açmalısınız" }, { status: 401 })
        }

        const body = await req.json()
        const { requestId } = body

        if (!requestId) {
            return NextResponse.json({ error: "İstek ID gerekli" }, { status: 400 })
        }

        const request = await prisma.transferRequest.findUnique({
            where: { id: requestId }
        })

        if (!request) {
            return NextResponse.json({ error: "Transfer isteği bulunamadı" }, { status: 404 })
        }

        // Only sender can cancel
        if (request.fromUserId !== session.user.id) {
            return NextResponse.json({ error: "Bu işlemi yapmaya yetkiniz yok" }, { status: 403 })
        }

        if (request.status !== 'pending') {
            return NextResponse.json({ error: "Bu istek zaten sonuçlanmış" }, { status: 400 })
        }

        // Update status to cancelled
        await prisma.transferRequest.update({
            where: { id: requestId },
            data: { status: 'cancelled' }
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error("Cancel transfer error:", error)
        return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 })
    }
}
