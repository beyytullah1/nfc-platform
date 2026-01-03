import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import EditPlantClient from "./EditPlantClient"

export default async function EditPlantPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    const plant = await prisma.plant.findUnique({
        where: { id }
    })

    if (!plant || plant.ownerId !== session.user.id) {
        redirect("/dashboard/plants")
    }

    return <EditPlantClient plant={plant} />
}
