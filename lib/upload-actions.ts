"use server"

import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import sharp from "sharp"

export async function uploadImage(formData: FormData) {
    try {
        const file = formData.get("file") as File
        if (!file) {
            return { error: "Dosya bulunamadı" }
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Klasör kontrolü
        const uploadDir = join(process.cwd(), "public", "uploads")
        try {
            await mkdir(uploadDir, { recursive: true })
        } catch (error) {
            // Klasör zaten varsa sorun yok
        }

        // Benzersiz dosya adı oluştur
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
        const filename = `image-${uniqueSuffix}.webp`
        const filepath = join(uploadDir, filename)

        // Sharp ile optimize et ve kaydet
        await sharp(buffer)
            .resize(1200, 1200, { // Max genişlik/yükseklik 1200px
                fit: "inside",    // Orantılı küçült
                withoutEnlargement: true // Küçük resimleri büyütme
            })
            .webp({ quality: 80 }) // WebP formatına çevir, %80 kalite
            .toFile(filepath)

        return { success: true, url: `/uploads/${filename}` }
    } catch (error) {
        console.error("Upload error:", error)
        return { error: "Resim yüklenirken bir hata oluştu" }
    }
}
