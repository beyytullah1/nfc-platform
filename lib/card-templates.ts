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
    },
    {
        id: 'lost_pet',
        name: 'Kayıp Hayvan',
        icon: '🐶',
        description: 'Kayıp evcil hayvan bilgileri',
        fields: [
            { name: 'petName', label: 'Hayvan Adı', value: '', fieldType: 'text', icon: '🐾', privacyLevel: 0, groupName: 'Hayvan Bilgisi' },
            { name: 'petType', label: 'Hayvan Türü', value: '', fieldType: 'text', icon: '🐕', privacyLevel: 0, groupName: 'Hayvan Bilgisi' },
            { name: 'petBreed', label: 'Cinsi', value: '', fieldType: 'text', icon: '📋', privacyLevel: 0, groupName: 'Hayvan Bilgisi' },
            { name: 'petColor', label: 'Renk/Özellik', value: '', fieldType: 'text', icon: '🎨', privacyLevel: 0, groupName: 'Hayvan Bilgisi' },
            { name: 'emergencyPhone', label: 'Acil Telefon', value: '', fieldType: 'phone', icon: '🚨', privacyLevel: 0, groupName: 'İletişim' },
            { name: 'phone', label: 'Telefon', value: '', fieldType: 'phone', icon: '📞', privacyLevel: 0, groupName: 'İletişim' },
            { name: 'location', label: 'Ev Konumu', value: '', fieldType: 'location', icon: '📍', privacyLevel: 0, groupName: 'Konum' },
            { name: 'reward', label: 'Ödül', value: '', fieldType: 'text', icon: '💰', privacyLevel: 0, groupName: 'Diğer' },
        ],
        theme: {
            primaryColor: '#f97316',
            secondaryColor: '#fbbf24',
            style: 'alert'
        }
    },
    {
        id: 'health',
        name: 'Sağlık/Yaşlı',
        icon: '🧓',
        description: 'Sağlık ve acil durum bilgileri',
        fields: [
            { name: 'fullName', label: 'Ad Soyad', value: '', fieldType: 'text', icon: '👤', privacyLevel: 0, groupName: 'Kişisel' },
            { name: 'bloodType', label: 'Kan Grubu', value: '', fieldType: 'text', icon: '🩸', privacyLevel: 0, groupName: 'Sağlık' },
            { name: 'medicalConditions', label: 'Kronik Hastalıklar', value: '', fieldType: 'textarea', icon: '🏥', privacyLevel: 0, groupName: 'Sağlık' },
            { name: 'medications', label: 'Kullanılan İlaçlar', value: '', fieldType: 'textarea', icon: '💊', privacyLevel: 0, groupName: 'Sağlık' },
            { name: 'allergies', label: 'Alerjiler', value: '', fieldType: 'text', icon: '⚠️', privacyLevel: 0, groupName: 'Sağlık' },
            { name: 'emergencyPhone', label: 'Acil Kişi Telefonu', value: '', fieldType: 'phone', icon: '🚨', privacyLevel: 0, groupName: 'Acil Durum' },
            { name: 'emergencyName', label: 'Acil Kişi Adı', value: '', fieldType: 'text', icon: '👥', privacyLevel: 0, groupName: 'Acil Durum' },
            { name: 'location', label: 'Ev Konumu', value: '', fieldType: 'location', icon: '🏠', privacyLevel: 0, groupName: 'Konum' },
            { name: 'doctor', label: 'Doktor', value: '', fieldType: 'text', icon: '👨‍⚕️', privacyLevel: 1, groupName: 'Sağlık' },
            { name: 'doctorPhone', label: 'Doktor Telefonu', value: '', fieldType: 'phone', icon: '📱', privacyLevel: 1, groupName: 'Sağlık' },
        ],
        theme: {
            primaryColor: '#ef4444',
            secondaryColor: '#f97316',
            style: 'emergency'
        }
    },
    {
        id: 'emergency',
        name: 'Acil Durum',
        icon: '🧑‍⚕️',
        description: 'Minimal acil durum kartı',
        fields: [
            { name: 'fullName', label: 'Ad Soyad', value: '', fieldType: 'text', icon: '👤', privacyLevel: 0, groupName: 'Kişisel' },
            { name: 'bloodType', label: 'Kan Grubu', value: '', fieldType: 'text', icon: '🩸', privacyLevel: 0, groupName: 'Sağlık' },
            { name: 'emergencyPhone', label: 'Acil Durum Telefonu', value: '', fieldType: 'phone', icon: '🚨', privacyLevel: 0, groupName: 'Acil' },
            { name: 'location', label: 'Ev Konumu', value: '', fieldType: 'location', icon: '📍', privacyLevel: 0, groupName: 'Konum' },
            { name: 'allergies', label: 'Alerjiler', value: '', fieldType: 'text', icon: '⚠️', privacyLevel: 0, groupName: 'Sağlık' },
        ],
        theme: {
            primaryColor: '#dc2626',
            secondaryColor: '#b91c1c',
            style: 'emergency'
        }
    }
]
