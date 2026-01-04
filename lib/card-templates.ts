// Card Templates - Hazır şablonlar
export const CARD_TEMPLATES = [
    {
        id: 'minimal',
        name: 'Minimal',
        icon: '✨',
        description: 'Sade ve şık',
        fields: [
            { name: 'phone', label: 'Telefon', value: '', fieldType: 'phone', icon: '📞', privacyLevel: 0, groupName: 'İletişim' },
            { name: 'email', label: 'Email', value: '', fieldType: 'email', icon: '✉️', privacyLevel: 0, groupName: 'İletişim' },
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
            { name: 'phone', label: 'Telefon', value: '', fieldType: 'phone', icon: '📞', privacyLevel: 0, groupName: 'İletişim' },
            { name: 'email', label: 'Email', value: '', fieldType: 'email', icon: '✉️', privacyLevel: 0, groupName: 'İletişim' },
            { name: 'company', label: 'Şirket', value: '', fieldType: 'text', icon: '🏢', privacyLevel: 0, groupName: 'İş Bilgileri' },
            { name: 'title', label: 'Ünvan', value: '', fieldType: 'text', icon: '💼', privacyLevel: 0, groupName: 'İş Bilgileri' },
            { name: 'website', label: 'Website', value: '', fieldType: 'url', icon: '🌐', privacyLevel: 0, groupName: 'Linkler' },
            { name: 'linkedin', label: 'LinkedIn', value: '', fieldType: 'url', icon: '💼', privacyLevel: 0, groupName: 'Sosyal Medya' },
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
            { name: 'phone', label: 'Telefon', value: '', fieldType: 'phone', icon: '📞', privacyLevel: 0, groupName: 'İletişim' },
            { name: 'email', label: 'Email', value: '', fieldType: 'email', icon: '✉️', privacyLevel: 0, groupName: 'İletişim' },
            { name: 'instagram', label: 'Instagram', value: '', fieldType: 'url', icon: '📸', privacyLevel: 0, groupName: 'Sosyal Medya' },
            { name: 'twitter', label: 'Twitter', value: '', fieldType: 'url', icon: '🐦', privacyLevel: 0, groupName: 'Sosyal Medya' },
            { name: 'youtube', label: 'YouTube', value: '', fieldType: 'url', icon: '📹', privacyLevel: 0, groupName: 'Sosyal Medya' },
            { name: 'tiktok', label: 'TikTok', value: '', fieldType: 'url', icon: '🎵', privacyLevel: 0, groupName: 'Sosyal Medya' },
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
            { name: 'phone', label: 'Telefon', value: '', fieldType: 'phone', icon: '📞', privacyLevel: 0, groupName: 'İletişim' },
            { name: 'email', label: 'Email', value: '', fieldType: 'email', icon: '✉️', privacyLevel: 0, groupName: 'İletişim' },
            { name: 'company', label: 'Şirket', value: '', fieldType: 'text', icon: '🏢', privacyLevel: 0, groupName: 'İş' },
            { name: 'title', label: 'Ünvan', value: '', fieldType: 'text', icon: '💼', privacyLevel: 0, groupName: 'İş' },
            { name: 'website', label: 'Website', value: '', fieldType: 'url', icon: '🌐', privacyLevel: 0, groupName: 'Linkler' },
            { name: 'linkedin', label: 'LinkedIn', value: '', fieldType: 'url', icon: '💼', privacyLevel: 1, groupName: 'Sosyal' },
            { name: 'address', label: 'Adres', value: '', fieldType: 'text', icon: '📍', privacyLevel: 1, groupName: 'Diğer' },
            { name: 'birthday', label: 'Doğum Günü', value: '', fieldType: 'date', icon: '🎂', privacyLevel: 2, groupName: 'Diğer' },
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
            { name: 'phone', label: 'Telefon', value: '', fieldType: 'phone', icon: '📞', privacyLevel: 0, groupName: 'İletişim' },
            { name: 'email', label: 'Email', value: '', fieldType: 'email', icon: '✉️', privacyLevel: 0, groupName: 'İletişim' },
            { name: 'portfolio', label: 'Portfolio', value: '', fieldType: 'url', icon: '🎨', privacyLevel: 0, groupName: 'Portfolyo' },
            { name: 'behance', label: 'Behance', value: '', fieldType: 'url', icon: '🎭', privacyLevel: 0, groupName: 'Sosyal' },
            { name: 'dribbble', label: 'Dribbble', value: '', fieldType: 'url', icon: '🏀', privacyLevel: 0, groupName: 'Sosyal' },
            { name: 'github', label: 'GitHub', value: '', fieldType: 'url', icon: '💻', privacyLevel: 0, groupName: 'Kod' },
        ],
        theme: {
            primaryColor: '#f59e0b',
            secondaryColor: '#ec4899',
            style: 'creative'
        }
    }
]
