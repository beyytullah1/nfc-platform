import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { createRateLimiter, RATE_LIMITS } from "@/lib/rate-limit"
import { logger } from "@/lib/logger"
import { FILE_UPLOAD, FILE_SIGNATURES } from "@/lib/constants"

export async function POST(request: NextRequest) {
    // Rate limiting
    const rateLimiter = createRateLimiter(RATE_LIMITS.upload)
    const rateLimitResponse = await rateLimiter(request)
    if (rateLimitResponse) {
        return rateLimitResponse
    }

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

    // Dosya boyutu kontrolü
    if (file.size > FILE_UPLOAD.MAX_SIZE) {
        return NextResponse.json({ error: `Dosya boyutu ${FILE_UPLOAD.MAX_SIZE / 1024 / 1024}MB'dan büyük olamaz` }, { status: 400 })
    }

    // Dosya tipi kontrolü
    if (!FILE_UPLOAD.ALLOWED_TYPES.includes(file.type as typeof FILE_UPLOAD.ALLOWED_TYPES[number])) {
        return NextResponse.json({ error: "Geçersiz dosya tipi" }, { status: 400 })
    }

    try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Additional security: Check file content (magic numbers)
        // Image files have specific signatures
        const isImage = buffer.length >= 4 && (
            // JPEG
            (buffer[0] === FILE_SIGNATURES.JPEG[0] && buffer[1] === FILE_SIGNATURES.JPEG[1] && buffer[2] === FILE_SIGNATURES.JPEG[2]) ||
            // PNG
            (buffer[0] === FILE_SIGNATURES.PNG[0] && buffer[1] === FILE_SIGNATURES.PNG[1] && buffer[2] === FILE_SIGNATURES.PNG[2] && buffer[3] === FILE_SIGNATURES.PNG[3]) ||
            // GIF
            (buffer[0] === FILE_SIGNATURES.GIF[0] && buffer[1] === FILE_SIGNATURES.GIF[1] && buffer[2] === FILE_SIGNATURES.GIF[2] && buffer[3] === FILE_SIGNATURES.GIF[3]) ||
            // WebP: Starts with RIFF
            (buffer[0] === FILE_SIGNATURES.WEBP_RIFF[0] && buffer[1] === FILE_SIGNATURES.WEBP_RIFF[1] && buffer[2] === FILE_SIGNATURES.WEBP_RIFF[2] && buffer[3] === FILE_SIGNATURES.WEBP_RIFF[3])
        )

        // For vCard files, check if it starts with BEGIN:VCARD
        const isVCard = buffer.slice(0, 11).toString().toUpperCase().startsWith(FILE_SIGNATURES.VCARD_PREFIX)

        // Validate file content matches declared type
        if (file.type.startsWith('image/') && !isImage) {
            return NextResponse.json({ error: "Dosya içeriği belirtilen tiple uyuşmuyor" }, { status: 400 })
        }

        if ((file.type === 'text/vcard' || file.type === 'text/x-vcard') && !isVCard) {
            return NextResponse.json({ error: "Geçersiz vCard dosyası" }, { status: 400 })
        }

        // Sanitize filename to prevent path traversal and injection
        const sanitizeFilename = (name: string): string => {
            // Remove any path separators and dangerous characters
            return name
                .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace non-alphanumeric (except . and -) with _
                .replace(/^\.+|\.+$/g, '') // Remove leading/trailing dots
                .substring(0, 255) // Limit length
        }

        // Benzersiz dosya adı oluştur (sanitized)
        const timestamp = Date.now()
        const originalExt = file.name.split(".").pop()?.toLowerCase() || "jpg"
        const safeExt = sanitizeFilename(originalExt) || "jpg"
        
        // Ensure extension is one of allowed types
        const ext = FILE_UPLOAD.ALLOWED_EXTENSIONS.includes(safeExt as typeof FILE_UPLOAD.ALLOWED_EXTENSIONS[number]) ? safeExt : 'jpg'
        
        const safeFilename = sanitizeFilename(`${session.user.id}-${type}-${timestamp}`)
        const filename = `${safeFilename}.${ext}`

        // Uploads klasörü oluştur
        const uploadsDir = path.join(process.cwd(), "public", "uploads", type)
        await mkdir(uploadsDir, { recursive: true })

        // Dosyayı kaydet
        const filepath = path.join(uploadsDir, filename)
        await writeFile(filepath, buffer)

        // URL'yi döndür
        const url = `/uploads/${type}/${filename}`
        logger.info("File uploaded successfully", { context: "Upload", data: { type, filename, userId: session.user.id } })
        return NextResponse.json({ url })
    } catch (error) {
        logger.error("Upload error", { context: "Upload", error, data: { type, userId: session.user?.id } })
        return NextResponse.json({ error: "Dosya yüklenemedi" }, { status: 500 })
    }
}
