import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import EditMugClient from "./EditMugClient"

export default async function EditMugPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    const mug = await prisma.mug.findUnique({
        where: { id }
    })

    if (!mug || mug.ownerId !== session.user.id) {
        redirect("/dashboard/mugs")
    }

    return <EditMugClient mug={mug} />
}
