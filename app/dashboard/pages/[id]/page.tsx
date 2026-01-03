import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import PageEditorClient from "./PageEditorClient"

export default async function PageEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    const page = await prisma.page.findUnique({
        where: { id },
        include: {
            blocks: { orderBy: { displayOrder: 'asc' } }
        }
    })

    if (!page || page.ownerId !== session.user.id || page.moduleType !== 'canvas') {
        redirect("/dashboard/pages")
    }

    return <PageEditorClient page={page} />
}
