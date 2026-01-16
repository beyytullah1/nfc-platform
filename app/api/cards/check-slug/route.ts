export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function GET(request: NextRequest) {
    const slug = request.nextUrl.searchParams.get("slug")

    if (!slug) {
        return NextResponse.json({ error: "Slug gerekli" }, { status: 400 })
    }

    const card = await prisma.card.findUnique({
        where: { slug },
        select: { id: true }
    })

    return NextResponse.json({ exists: !!card })
}
