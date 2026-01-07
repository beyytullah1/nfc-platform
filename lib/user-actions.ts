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
    const username = formData.get("username") as string
    const bio = formData.get("bio") as string

    // Username validation
    if (username) {
        const usernameRegex = /^[a-z0-9_]{3,20}$/
        if (!usernameRegex.test(username)) {
            return { error: "Username 3-20 karakter olmalı ve sadece küçük harf, rakam, _ içerebilir" }
        }

        // Check if username is taken
        const existing = await prisma.user.findFirst({
            where: {
                username,
                NOT: { id: session.user.id }
            }
        })

        if (existing) {
            return { error: "Bu username zaten kullanılıyor" }
        }
    }

    try {
        await prisma.user.update({
            where: { id: session.user!.id },
            data: {
                name,
                email: email || undefined,
                ...(username && { username }),
                ...(bio !== undefined && { bio })
            }
        })
        revalidatePath("/dashboard")
        return { success: true, message: "Profil güncellendi" }
    } catch (error) {
        console.error("Profile update error:", error)
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
