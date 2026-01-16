export const runtime = "nodejs"


import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: "Oturum açmalısınız" }, { status: 401 })
        }

        const body = await req.json()
        const { requestId, action } = body // action: 'accept' | 'reject'

        if (!requestId || !action) {
            return NextResponse.json({ error: "İstek ID ve aksiyon gerekli" }, { status: 400 })
        }

        const request = await prisma.transferRequest.findUnique({
            where: { id: requestId },
            include: { tag: true }
        })

        if (!request) {
            return NextResponse.json({ error: "Transfer isteği bulunamadı" }, { status: 404 })
        }

        // Only receiver can respond
        if (request.toUserId !== session.user.id) {
            return NextResponse.json({ error: "Bu işlemi yapmaya yetkiniz yok" }, { status: 403 })
        }

        if (request.status !== 'pending') {
            return NextResponse.json({ error: "Bu istek zaten sonuçlanmış" }, { status: 400 })
        }

        if (action === 'reject') {
            await prisma.transferRequest.update({
                where: { id: requestId },
                data: { status: 'rejected' }
            })
            return NextResponse.json({ success: true, message: 'İstek reddedildi' })
        }

        if (action === 'accept') {
            // Transaction: Update request, Update Tag Owner, Create/Update Transfer history if needed
            await prisma.$transaction(async (tx) => {
                // 1. Update Request
                await tx.transferRequest.update({
                    where: { id: requestId },
                    data: { status: 'accepted' }
                })

                // 2. Transfer Tag
                // Note: We keep the linked module as is? Or should we unlink it?
                // Usually transferring a tag assumes transferring the item too?
                // If it's a gift, the gift stays with the tag. 
                // If it's a plant, the plant stays with the tag.
                // So we just update the ownerId of the TAG. 
                // BUT, the modules (Plant/Mug/Card) also have 'ownerId' or 'userId'.
                // If we transfer the tag, we should probably update the Module owner too, 
                // OR unlink the module if it's strictly personal.

                // For now, let's assume the physical tag is transferred. 
                // If linked to a 'Card', the card is user specific. So we should UNLINK the card.
                // If linked to 'Plant'/'Mug', these are physical objects, so ownership transfers.
                // If linked to 'Gift', it's a one-time thing, maybe unlink or transfer?

                // Let's check logic:
                // If moduleType is 'card' or 'page' (personal), unlink.
                // If moduleType is 'plant' or 'mug' or 'gift' (physical/transferable), transfer ownership of module too.

                const tag = request.tag

                if (tag.moduleType === 'card' || tag.moduleType === 'page') {
                    // Unlink personal modules
                    await tx.nfcTag.update({
                        where: { id: tag.id },
                        data: {
                            ownerId: session.user!.id,
                            moduleType: null,
                            status: 'claimed'
                        }
                    })

                    // Nullify relation in module
                    if (tag.moduleType === 'card') {
                        // find card with this tag
                        await tx.card.updateMany({ where: { tagId: tag.id }, data: { tagId: null } })
                    }
                    if (tag.moduleType === 'page') {
                        await tx.page.updateMany({ where: { tagId: tag.id }, data: { tagId: null } })
                    }

                } else {
                    // Transfer ownership for Plant, Mug, Gift
                    const newOwnerId = session.user!.id

                    await tx.nfcTag.update({
                        where: { id: tag.id },
                        data: { ownerId: newOwnerId }
                    })

                    if (tag.moduleType === 'plant') {
                        await tx.plant.updateMany({ where: { tagId: tag.id }, data: { ownerId: newOwnerId } })
                    }
                    else if (tag.moduleType === 'mug') {
                        await tx.mug.updateMany({ where: { tagId: tag.id }, data: { ownerId: newOwnerId } })
                    }
                    // Gift sender usually doesn't change, but 'owner' might be the recipient?
                    // Gift model has 'senderId'. It doesn't have 'ownerId'. 
                    // So we just transfer the Tag. The gift data remains as "sent by X".
                }

                // Transfer history logging removed as model is not ready
                /*
                await tx.ownershipTransfer.create({
                    data: {
                        tagId: tag.id,
                        fromUserId: request.fromUserId,
                        toUserId: session.user!.id,
                        status: 'completed'
                    }
                })
                */
            })

            return NextResponse.json({ success: true, message: 'Transfer kabul edildi' })
        }

        return NextResponse.json({ error: "Geçersiz aksiyon" }, { status: 400 })

    } catch (error) {
        console.error("Respond transfer error:", error)
        return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 })
    }
}
