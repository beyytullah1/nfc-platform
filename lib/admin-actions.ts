'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Admin kontrolü helper
async function requireAdmin() {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'admin') {
        throw new Error('Unauthorized: Admin access required')
    }
    return session
}

// Log oluşturma helper
async function createAdminLog(
    adminId: string,
    action: string,
    targetType: string,
    targetId: string,
    details?: any
) {
    await prisma.adminLog.create({
        data: {
            adminId,
            action,
            targetType,
            targetId,
            details: details ? JSON.stringify(details) : null
        }
    })
}

// Kullanıcı düzenle
export async function updateUser(userId: string, formData: FormData) {
    const session = await requireAdmin()

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const username = formData.get('username') as string
    const bio = formData.get('bio') as string

    await prisma.user.update({
        where: { id: userId },
        data: {
            name,
            email,
            username: username || null,
            bio: bio || null
        }
    })

    await createAdminLog(
        session.user.id,
        'user_edited',
        'user',
        userId,
        { name, email, username }
    )

    revalidatePath(`/admin/users/${userId}`)
    revalidatePath('/admin/users')
}

// Şifre sıfırla
export async function resetUserPassword(userId: string) {
    const session = await requireAdmin()

    // Rastgele güçlü şifre oluştur
    const newPassword = generateRandomPassword(12)
    const passwordHash = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
        where: { id: userId },
        data: { passwordHash }
    })

    await createAdminLog(session.user.id, 'password_reset', 'user', userId)

    revalidatePath(`/admin/users/${userId}`)

    return { success: true, newPassword }
}

function generateRandomPassword(length: number): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%'
    let password = ''
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
}

// Kullanıcı sil
export async function deleteUser(userId: string) {
    const session = await requireAdmin()

    // Kendi kendini silmeyi engelle
    if (userId === session.user.id) {
        throw new Error('Cannot delete your own account')
    }

    // İlişkili verileri sil (cascade tanımlı değilse)
    await prisma.$transaction(async (tx) => {
        // Card fields
        await tx.cardField.deleteMany({
            where: { card: { userId } }
        })

        // Cards
        await tx.card.deleteMany({ where: { userId } })

        // Plant logs
        await tx.plantLog.deleteMany({
            where: { plant: { ownerId: userId } }
        })

        // Plants
        await tx.plant.deleteMany({ where: { ownerId: userId } })

        // Mug logs
        await tx.mugLog.deleteMany({
            where: { mug: { ownerId: userId } }
        })

        // Mugs
        await tx.mug.deleteMany({ where: { ownerId: userId } })

        // Gifts
        await tx.gift.deleteMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            }
        })

        // Connections
        await tx.connection.deleteMany({
            where: {
                OR: [
                    { userId },
                    { friendId: userId }
                ]
            }
        })

        // User
        await tx.user.delete({ where: { id: userId } })
    })

    await createAdminLog(session.user.id, 'user_deleted', 'user', userId)

    revalidatePath('/admin/users')
    redirect('/admin/users')
}

// Admin yetkisi ver/kaldır
export async function toggleUserRole(userId: string) {
    const session = await requireAdmin()

    // Kendi kendine uygulama engelle
    if (userId === session.user.id) {
        throw new Error('Cannot change your own role')
    }

    // Mevcut role'ü al
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
    })

    const newRole = (user as any)?.role === 'admin' ? 'user' : 'admin'

    await prisma.$executeRaw`
    UPDATE users SET role = ${newRole} WHERE id = ${userId}
  `

    await createAdminLog(
        session.user.id,
        'role_changed',
        'user',
        userId,
        { from: (user as any)?.role, to: newRole }
    )

    revalidatePath(`/admin/users/${userId}`)
    revalidatePath('/admin/users')

    return { success: true, newRole }
}
