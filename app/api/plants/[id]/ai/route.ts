import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: plantId } = await params
        const { message, imageUrl } = await request.json()

        // Bitki bilgilerini çek
        const plant = await prisma.plant.findUnique({
            where: { id: plantId },
            include: {
                logs: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        })

        if (!plant) {
            return NextResponse.json(
                { error: 'Bitki bulunamadı.' },
                { status: 404 }
            )
        }

        // Son sulama bilgisi
        const lastWatering = plant.logs.find((l: { logType: string }) => l.logType === 'water')
        const daysSinceWatering = lastWatering
            ? Math.floor((Date.now() - new Date(lastWatering.createdAt).getTime()) / 86400000)
            : null

        // Context prompt oluştur
        const systemPrompt = `
Sen bir bitki bakımı uzmanısın. Aşağıdaki bitki hakkında yardımcı ol:

BİTKİ BİLGİLERİ:
- İsim: ${plant.name}
- Tür: ${plant.species || 'Bilinmiyor'}
- Kayıt Tarihi: ${plant.createdAt.toLocaleDateString('tr-TR')}
- Son Sulama: ${lastWatering
                ? `${daysSinceWatering} gün önce${lastWatering.amountMl ? `, ${lastWatering.amountMl}ml` : ''}`
                : 'Kayıt yok'}
- Toplam Sulama: ${plant.logs.filter((l: { logType: string }) => l.logType === 'water').length} kez
${imageUrl ? '- Kullanıcı bir fotoğraf paylaştı, lütfen görsel olarak analiz et.' : ''}

KURALLAR:
- Türkçe yanıt ver
- Kısa ve öz ol (2-3 paragraf max)
- Pratik öneriler sun
- Eğer fotoğraf varsa hastalık/sorun analizi yap
        `.trim()

        // OpenAI API çağrısı (veya mock)
        let reply: string

        if (process.env.OPENAI_API_KEY) {
            // Gerçek OpenAI çağrısı
            const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                },
                body: JSON.stringify({
                    model: imageUrl ? 'gpt-4-vision-preview' : 'gpt-4-turbo-preview',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        imageUrl ? {
                            role: 'user',
                            content: [
                                { type: 'text', text: message || 'Bu bitkimi analiz eder misin?' },
                                { type: 'image_url', image_url: { url: imageUrl } }
                            ]
                        } : {
                            role: 'user',
                            content: message
                        }
                    ],
                    max_tokens: 500,
                }),
            })

            const data = await openaiResponse.json()
            reply = data.choices?.[0]?.message?.content || 'Yanıt alınamadı.'
        } else {
            // Mock yanıt (API key yoksa)
            reply = getMockResponse(message, plant.name, daysSinceWatering)
        }

        // Sohbeti kaydet
        await prisma.plantAiChat.createMany({
            data: [
                { plantId, role: 'user', content: message || '[Fotoğraf]', imageUrl },
                { plantId, role: 'assistant', content: reply },
            ],
        })

        return NextResponse.json({ reply })
    } catch (error) {
        console.error('AI Chat error:', error)
        return NextResponse.json(
            { error: 'Bir hata oluştu.' },
            { status: 500 }
        )
    }
}

function getMockResponse(message: string, plantName: string, daysSinceWatering: number | null): string {
    const lowerMessage = message.toLowerCase()

    if (lowerMessage.includes('sula') || lowerMessage.includes('water')) {
        if (daysSinceWatering !== null && daysSinceWatering > 3) {
            return `${plantName} için sulama zamanı gelmiş görünüyor! Son sulamadan ${daysSinceWatering} gün geçmiş. Genellikle haftada 1-2 kez sulama yeterli olur, ancak toprağın üst kısmını kontrol etmeyi unutma - kurumuşsa sulama zamanıdır.`
        }
        return `${plantName}'ı düzenli sulamayı unutma! Çoğu ev bitkisi için toprak kuruduğunda sulamak en iyisidir. Aşırı sulamadan kaçın çünkü kök çürümesine neden olabilir.`
    }

    if (lowerMessage.includes('güneş') || lowerMessage.includes('ışık')) {
        return `${plantName} için dolaylı, parlak ışık ideal olur. Doğrudan güneş ışığı yaprakları yakabilir. Pencere kenarında tül perde arkası mükemmel bir konum olabilir.`
    }

    if (lowerMessage.includes('sarı') || lowerMessage.includes('yaprak')) {
        return `Sararan yapraklar genellikle aşırı sulama, yetersiz ışık veya besin eksikliğinden kaynaklanır. ${daysSinceWatering !== null && daysSinceWatering < 2 ? 'Son sulama yakın zamanda yapılmış, belki biraz bekleyin.' : 'Toprağın nemini kontrol edin ve gerekirse sulama programını ayarlayın.'}`
    }

    if (lowerMessage.includes('gübre') || lowerMessage.includes('besle')) {
        return `İlkbahar ve yaz aylarında ayda bir kez genel amaçlı sıvı gübre kullanabilirsiniz. Kış aylarında bitki dinlenme döneminde olduğu için gübrelemeye ara verin.`
    }

    return `${plantName} için yardımcı olabilirim! Sulama, ışık ihtiyacı, gübre veya hastalıklar hakkında sorularını yanıtlayabilirim. Ayrıca fotoğraf yükleyerek bitkinin durumunu analiz ettirebilirsin.`
}
