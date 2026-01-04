'use server'

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function updateProfile(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Oturum açmanız gerekiyor" }

    const name = formData.get("name") as string
    const email = formData.get("email") as string

    try {
        await prisma.user.update({
            where: { id: session.user!.id },
            data: { name, email: email || undefined }
        })
        revalidatePath("/dashboard")
        return { success: true, message: "Profil güncellendi" }
    } catch (error) {
        return { error: "Güncelleme başarısız" }
    }
}

export async function changePassword(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Oturum açmanız gerekiyor" }

    const currentPassword = formData.get("currentPassword") as string
    const newPassword = formData.get("newPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (!currentPassword || !newPassword || !confirmPassword) {
        return { error: "Tüm alanları doldurun" }
    }

    if (newPassword !== confirmPassword) {
        return { error: "Yeni şifreler eşleşmiyor" }
    }

    // Mevcut kullanıcıyı bul
    const user = await prisma.user.findUnique({
        where: { id: session.user!.id }
    })

    if (!user || !user.passwordHash) {
        return { error: "Kullanıcı bulunamadı" }
    }

    // Eski şifre kontrolü
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isValid) {
        return { error: "Mevcut şifre yanlış" }
    }

    // Yeni şifreyi hashle
    const passwordHash = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
        where: { id: session.user!.id },
        data: { passwordHash }
    })

    return { success: true, message: "Şifre değiştirildi" }
}
