import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function exportNfcTagsToCSV() {
    try {
        console.log('📊 Fetching NFC tags from database...')

        const tags = await prisma.nfcTag.findMany({
            include: {
                owner: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                card: {
                    select: {
                        title: true,
                        slug: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        console.log(`✅ Found ${tags.length} NFC tags`)

        // CSV header
        const header = 'Tag ID,Code,Status,Type,Owner Name,Owner Email,Linked Card,Card Slug,Created At,Last Scanned'

        // CSV rows
        const rows = tags.map(tag => {
            const ownerName = tag.owner?.name || 'N/A'
            const ownerEmail = tag.owner?.email || 'N/A'
            const cardTitle = tag.card?.title || 'Not Linked'
            const cardSlug = tag.card?.slug || 'N/A'
            const createdAt = tag.createdAt.toISOString().split('T')[0]
            const lastScan = tag.lastScannedAt ? tag.lastScannedAt.toISOString().split('T')[0] : 'Never'

            return [
                tag.id,
                tag.code,
                tag.status,
                tag.type,
                `"${ownerName}"`,
                ownerEmail,
                `"${cardTitle}"`,
                cardSlug,
                createdAt,
                lastScan
            ].join(',')
        })

        // Combine header and rows
        const csv = [header, ...rows].join('\n')

        // Save to file
        const outputPath = path.join(process.cwd(), 'nfc_tags_export.csv')
        fs.writeFileSync(outputPath, csv, 'utf-8')

        console.log(`\n✅ CSV exported successfully!`)
        console.log(`📁 File location: ${outputPath}`)
        console.log(`\n📋 Preview (first 5 rows):`)
        console.log(header)
        rows.slice(0, 5).forEach(row => console.log(row))

        if (tags.length > 5) {
            console.log(`... and ${tags.length - 5} more rows`)
        }

    } catch (error) {
        console.error('❌ Error exporting NFC tags:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

exportNfcTagsToCSV()
