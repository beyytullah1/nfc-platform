"use server"

import { signIn, signOut } from "@/lib/auth"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"

export async function registerUser(formData: FormData) {
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const name = formData.get("name") as string

    if (!email || !password || !name) {
        return { error: "Tüm alanları doldurun" }
    }

    // Email kontrolü
    const existingUser = await prisma.user.findUnique({
        where: { email }
    })

    if (existingUser) {
        return { error: "Bu email zaten kayıtlı" }
    }

    // Şifre hash
    const passwordHash = await bcrypt.hash(password, 12)

    // Kullanıcı oluştur
    const newUser = await prisma.user.create({
        data: {
            email,
            name,
            passwordHash
        }
    })

    // Pending NFC varsa claim et
    try {
        const { cookies } = await import('next/headers')
        const cookieStore = await cookies()
        const pendingCode = cookieStore.get('pending_nfc_code')

        if (pendingCode?.value) {
            // Tag'i claim et
            await prisma.nfcTag.updateMany({
                where: {
                    publicCode: pendingCode.value,
                    ownerId: null // Sadece sahipsiz tag'leri claim et
                },
                data: {
                    ownerId: newUser.id,
                    claimedAt: new Date(),
                    status: 'claimed'
                }
            })

            // Cookie'yi temizle
            cookieStore.delete('pending_nfc_code')
        }
    } catch (error) {
        console.error('NFC claim after register error:', error)
        // Hata olursa da kayıt başarılı sayılır
    }

    return { success: true }
}

export async function loginWithCredentials(formData: FormData) {
    try {
        await signIn("credentials", {
            email: formData.get("email"),
            password: formData.get("password"),
            redirect: false
        })
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Email veya şifre hatalı" }
                default:
                    return { error: "Bir hata oluştu" }
            }
        }
        throw error
    }

    // Pending NFC varsa claim sayfasına yönlendir
    try {
        const { cookies } = await import('next/headers')
        const cookieStore = await cookies()
        const pendingCode = cookieStore.get('pending_nfc_code')

        if (pendingCode?.value) {
            redirect(`/claim?code=${pendingCode.value}`)
        }
    } catch (error) {
        console.error('Check pending NFC error:', error)
    }

    redirect("/dashboard")
}

export async function loginWithGoogle() {
    await signIn("google", { redirectTo: "/dashboard" })
}

export async function logout() {
    await signOut({ redirectTo: "/" })
}

