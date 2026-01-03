import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const { password } = await request.json()

    const card = await prisma.card.findUnique({
        where: { id },
        select: { password: true }
    })

    if (!card) {
        return NextResponse.json({ error: "Kartvizit bulunamadı" }, { status: 404 })
    }

    // Şifre kontrolü
    if (card.password === password) {
        return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Yanlış şifre" }, { status: 401 })
}
