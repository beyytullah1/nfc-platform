export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const { password } = await request.json()

    if (!password) {
        return NextResponse.json({ error: "Şifre gerekli" }, { status: 400 })
    }

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

    // Seviye 2 şifresini kontrol et (hepsini açar)
    if (card.level2Password && password === card.level2Password) {
        return NextResponse.json({ level: 2 })
    }

    // Seviye 1 şifresini kontrol et
    if (card.level1Password && password === card.level1Password) {
        return NextResponse.json({ level: 1 })
    }

    return NextResponse.json({ error: "Yanlış şifre" }, { status: 401 })
}
