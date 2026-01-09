import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import NfcTagsClient from './NfcTagsClient'

export const metadata = {
    title: 'NFC Etiketlerim - Temasal',
    description: 'Sahip olduğunuz NFC etiketlerini görüntüleyin ve yönetin'
}

export default async function NfcTagsPage() {
    const session = await auth()

    if (!session) {
        redirect('/login')
    }

    return <NfcTagsClient />
}
