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

    // Map to match PageEditorClient interface
    const pageData = {
        id: page.id,
        title: page.title || "",
        blocks: page.blocks.map(b => ({
            id: b.id,
            blockType: b.blockType,
            content: b.content,
            displayOrder: b.displayOrder
        }))
    }

    return <PageEditorClient page={pageData} />
}
