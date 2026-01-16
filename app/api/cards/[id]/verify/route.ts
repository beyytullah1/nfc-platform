export const runtime = "nodejs"

import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const { password, level } = await request.json()

    const card = await prisma.card.findUnique({
        where: { id },
        select: {
            level1Password: true,
            level2Password: true
        }
    })

    if (!card) {
        return NextResponse.json({ error: "Kartvizit bulunamadı" }, { status: 404 })
    }

    // Şifre kontrolü - seviye bazlı
    const targetPassword = level === 1 ? card.level1Password : card.level2Password

    if (targetPassword === password) {
        return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Yanlış şifre" }, { status: 401 })
}
