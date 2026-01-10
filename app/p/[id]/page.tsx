import { auth } from '@/lib/auth'
import { getPlantWithLogs } from '@/app/actions'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { prisma } from '@/lib/db'
import WaterButton from './WaterButton'
import { FollowButton } from '@/app/components/FollowButton'

type Props = {
    params: Promise<{ id: string }>
}

// Dynamic metadata for social sharing
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params

    const plant = await prisma.plant.findUnique({
        where: { id },
        include: { owner: true }
    })

    if (!plant) {
        return {
            title: "Bitki Bulunamadı",
            description: "Bu akıllı saksı bulunamadı."
        }
    }

    const title = plant.name
    const description = plant.species
        ? `${plant.name} - ${plant.species}`
        : `${plant.name} akıllı saksı`
    const imageUrl = plant.coverImageUrl

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "website",
            images: imageUrl ? [{ url: imageUrl, width: 400, height: 400 }] : [],
        },
        twitter: {
            card: "summary",
            title,
            description,
            images: imageUrl ? [imageUrl] : [],
        },
    }
}


export default async function PlantPage({ params }: Props) {
    const { id } = await params
    const session = await auth()
    const plant = await getPlantWithLogs(id)

    if (!plant) {
        notFound()
    }

    // Follow Logic
    let isFollowing = false
    let followerCount = 0

    if (plant.tag) {
        followerCount = await prisma.follow.count({
            where: { tagId: plant.tag.id }
        })

        if (session?.user?.id) {
            const follow = await prisma.follow.findUnique({
                where: {
                    userId_tagId: {
                        userId: session.user.id,
                        tagId: plant.tag.id
                    }
                }
            })
            isFollowing = !!follow
        }
    }

    const waterLogs = plant.logs.filter(log => log.logType === 'water')
    const lastWatered = waterLogs[0]?.createdAt

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            {/* Hediye Banner */}
            {plant.isGift && plant.giftedBy && (
                <div className="card" style={{
                    marginBottom: '1.5rem',
                    background: 'linear-gradient(135deg, rgba(231, 76, 60, 0.15), rgba(155, 89, 182, 0.15))',
                    border: '1px solid rgba(231, 76, 60, 0.3)',
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '1.5rem' }}>🎁</span>
                        <p style={{ margin: '8px 0 0', color: 'var(--color-text-muted)' }}>
                            <strong>{plant.giftedBy.name || 'Birisi'}</strong> tarafından hediye edildi
                        </p>
                        {plant.giftMessage && (
                            <p style={{
                                marginTop: '8px',
                                fontStyle: 'italic',
                                color: 'var(--color-text)'
                            }}>
                                "{plant.giftMessage}"
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{
                    fontSize: '5rem',
                    marginBottom: '1rem',
                    filter: 'drop-shadow(0 0 20px rgba(46, 204, 113, 0.4))'
                }}>
                    🪴
                </div>
                <h1 className="title-gradient" style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>
                    {plant.name}
                </h1>
                {plant.species && (
                    <p style={{ color: 'var(--color-accent)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                        {plant.species}
                    </p>
                )}
                {lastWatered && (
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                        Son sulama: {formatDate(lastWatered)}
                    </p>
                )}

                {/* Follow Button */}
                {plant.tag && (
                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
                        <FollowButton
                            tagId={plant.tag.id}
                            initialIsFollowing={isFollowing}
                            followerCount={followerCount}
                        />
                    </div>
                )}
            </div>

            {/* Water Button */}
            <div style={{ marginBottom: '2rem' }}>
                <WaterButton plantId={plant.id} />
            </div>

            {/* Stats */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                    <div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                            {waterLogs.length}
                        </div>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                            Sulama
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-accent)' }}>
                            {daysSince(plant.createdAt)}
                        </div>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                            Gün
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#9b59b6' }}>
                            {plant.logs.filter(l => l.logType === 'photo').length}
                        </div>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                            Fotoğraf
                        </div>
                    </div>
                </div>
            </div>


            {/* Timeline */}
            {plant.logs.length > 0 && (
                <div className="card">
                    <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--color-text-muted)' }}>
                        📜 Geçmiş
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {plant.logs.map((log) => (
                            <div
                                key={log.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '8px 0',
                                    borderBottom: '1px solid var(--color-border)'
                                }}
                            >
                                <span style={{ fontSize: '1.5rem' }}>
                                    {log.logType === 'water' ? '💧' :
                                        log.logType === 'photo' ? '📸' :
                                            log.logType === 'fertilize' ? '🌱' :
                                                log.logType === 'repot' ? '🪴' : '📝'}
                                </span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 500 }}>
                                        {log.logType === 'water' ? `Sulandı${log.amountMl ? ` (${log.amountMl}ml)` : ''}` :
                                            log.logType === 'photo' ? 'Fotoğraf' :
                                                log.logType === 'fertilize' ? 'Gübre' :
                                                    log.logType === 'repot' ? 'Saksı değişimi' : 'Not'}
                                    </div>
                                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                                        {formatDate(log.createdAt)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

function formatDate(date: Date): string {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Az önce'
    if (minutes < 60) return `${minutes} dakika önce`
    if (hours < 24) return `${hours} saat önce`
    if (days < 7) return `${days} gün önce`

    return new Date(date).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short'
    })
}

function daysSince(date: Date): number {
    const diff = new Date().getTime() - new Date(date).getTime()
    return Math.floor(diff / 86400000) + 1
}
