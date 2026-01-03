import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(request: NextRequest) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const type = formData.get("type") as string // "logo" | "avatar" | "vcard"

    if (!file) {
        return NextResponse.json({ error: "Dosya gerekli" }, { status: 400 })
    }

    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: "Dosya boyutu 5MB'dan büyük olamaz" }, { status: 400 })
    }

    // Dosya tipi kontrolü
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "text/vcard", "text/x-vcard"]
    if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: "Geçersiz dosya tipi" }, { status: 400 })
    }

    try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Benzersiz dosya adı oluştur
        const timestamp = Date.now()
        const ext = file.name.split(".").pop() || "jpg"
        const filename = `${session.user.id}-${type}-${timestamp}.${ext}`

        // Uploads klasörü oluştur
        const uploadsDir = path.join(process.cwd(), "public", "uploads", type)
        await mkdir(uploadsDir, { recursive: true })

        // Dosyayı kaydet
        const filepath = path.join(uploadsDir, filename)
        await writeFile(filepath, buffer)

        // URL'yi döndür
        const url = `/uploads/${type}/${filename}`
        return NextResponse.json({ url })
    } catch (error) {
        console.error("Upload error:", error)
        return NextResponse.json({ error: "Dosya yüklenemedi" }, { status: 500 })
    }
}
