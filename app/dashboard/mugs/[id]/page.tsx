import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import MugDetailClient from "./MugDetailClient"

export default async function MugDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    const mug = await prisma.mug.findUnique({
        where: { id },
        include: {
            logs: { orderBy: { createdAt: 'desc' }, take: 50 },
            tag: { select: { id: true } }
        }
    })

    if (!mug || mug.ownerId !== session.user.id) {
        redirect("/dashboard/mugs")
    }

    return <MugDetailClient mug={mug} />
}
