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
    await prisma.user.create({
        data: {
            email,
            name,
            passwordHash
        }
    })

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
    redirect("/dashboard")
}

export async function loginWithGoogle() {
    await signIn("google", { redirectTo: "/dashboard" })
}

export async function logout() {
    await signOut({ redirectTo: "/" })
}

