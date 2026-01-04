// Card Templates - Hazır şablonlar
export const CARD_TEMPLATES = [
    {
        id: 'minimal',
        name: 'Minimal',
        icon: '✨',
        description: 'Sade ve şık',
        fields: [
            { name: 'phone', label: 'Telefon', value: '', fieldType: 'phone', icon: '📞', privacyLevel: 0 },
            { name: 'email', label: 'Email', value: '', fieldType: 'email', icon: '✉️', privacyLevel: 0 },
        ],
        theme: {
            primaryColor: '#3b82f6',
            secondaryColor: '#8b5cf6',
            style: 'minimal'
        }
    },
    {
        id: 'business',
        name: 'İş',
        icon: '💼',
        description: 'Profesyonel iş kartı',
        fields: [
            { name: 'phone', label: 'Telefon', value: '', fieldType: 'phone', icon: '📞', privacyLevel: 0 },
            { name: 'email', label: 'Email', value: '', fieldType: 'email', icon: '✉️', privacyLevel: 0 },
            { name: 'company', label: 'Şirket', value: '', fieldType: 'text', icon: '🏢', privacyLevel: 0 },
            { name: 'title', label: 'Ünvan', value: '', fieldType: 'text', icon: '💼', privacyLevel: 0 },
            { name: 'website', label: 'Website', value: '', fieldType: 'url', icon: '🌐', privacyLevel: 0 },
            { name: 'linkedin', label: 'LinkedIn', value: '', fieldType: 'url', icon: '💼', privacyLevel: 0 },
        ],
        theme: {
            primaryColor: '#1e293b',
            secondaryColor: '#3b82f6',
            style: 'professional'
        }
    },
    {
        id: 'social',
        name: 'Sosyal',
        icon: '🎨',
        description: 'Sosyal medya odaklı',
        fields: [
            { name: 'phone', label: 'Telefon', value: '', fieldType: 'phone', icon: '📞', privacyLevel: 0 },
            { name: 'email', label: 'Email', value: '', fieldType: 'email', icon: '✉️', privacyLevel: 0 },
            { name: 'instagram', label: 'Instagram', value: '', fieldType: 'url', icon: '📸', privacyLevel: 0 },
            { name: 'twitter', label: 'Twitter', value: '', fieldType: 'url', icon: '🐦', privacyLevel: 0 },
            { name: 'youtube', label: 'YouTube', value: '', fieldType: 'url', icon: '📹', privacyLevel: 0 },
            { name: 'tiktok', label: 'TikTok', value: '', fieldType: 'url', icon: '🎵', privacyLevel: 0 },
        ],
        theme: {
            primaryColor: '#ec4899',
            secondaryColor: '#8b5cf6',
            style: 'colorful'
        }
    },
    {
        id: 'complete',
        name: 'Tam',
        icon: '🎯',
        description: 'Tüm alan grupları',
        fields: [
            { name: 'phone', label: 'Telefon', value: '', fieldType: 'phone', icon: '📞', privacyLevel: 0 },
            { name: 'email', label: 'Email', value: '', fieldType: 'email', icon: '✉️', privacyLevel: 0 },
            { name: 'company', label: 'Şirket', value: '', fieldType: 'text', icon: '🏢', privacyLevel: 0 },
            { name: 'title', label: 'Ünvan', value: '', fieldType: 'text', icon: '💼', privacyLevel: 0 },
            { name: 'website', label: 'Website', value: '', fieldType: 'url', icon: '🌐', privacyLevel: 0 },
            { name: 'linkedin', label: 'LinkedIn', value: '', fieldType: 'url', icon: '💼', privacyLevel: 1 },
            { name: 'address', label: 'Adres', value: '', fieldType: 'text', icon: '📍', privacyLevel: 1 },
            { name: 'birthday', label: 'Doğum Günü', value: '', fieldType: 'date', icon: '🎂', privacyLevel: 2 },
        ],
        theme: {
            primaryColor: '#3b82f6',
            secondaryColor: '#8b5cf6',
            style: 'complete'
        }
    },
    {
        id: 'creative',
        name: 'Yaratıcı',
        icon: '🎨',
        description: 'Sanatçılar ve tasarımcılar için',
        fields: [
            { name: 'phone', label: 'Telefon', value: '', fieldType: 'phone', icon: '📞', privacyLevel: 0 },
            { name: 'email', label: 'Email', value: '', fieldType: 'email', icon: '✉️', privacyLevel: 0 },
            { name: 'portfolio', label: 'Portfolio', value: '', fieldType: 'url', icon: '🎨', privacyLevel: 0 },
            { name: 'behance', label: 'Behance', value: '', fieldType: 'url', icon: '🎭', privacyLevel: 0 },
            { name: 'dribbble', label: 'Dribbble', value: '', fieldType: 'url', icon: '🏀', privacyLevel: 0 },
            { name: 'github', label: 'GitHub', value: '', fieldType: 'url', icon: '💻', privacyLevel: 0 },
        ],
        theme: {
            primaryColor: '#f59e0b',
            secondaryColor: '#ec4899',
            style: 'creative'
        }
    }
]
