// Modül tipleri
export type ModuleType = 'card' | 'plant' | 'mug' | 'gift' | 'canvas';

// Privacy seviyeleri
export enum PrivacyLevel {
    PUBLIC = 0,      // Herkes görebilir
    CONNECTIONS = 1, // Sadece bağlantılar
    VIP = 2,         // VIP şifre gerekli
    PRIVATE = 3,     // Sadece sahip
}

// Field tipleri
export type CardFieldType =
    | 'phone'
    | 'email'
    | 'instagram'
    | 'twitter'
    | 'linkedin'
    | 'website'
    | 'telegram'
    | 'whatsapp'
    | 'custom';

// Log tipleri
export type PlantLogType = 'water' | 'photo' | 'note' | 'fertilize' | 'repot';
export type MugLogType = 'coffee' | 'tea' | 'water';

// Block tipleri
export type PageBlockType =
    | 'text'
    | 'image'
    | 'video'
    | 'music'
    | 'link'
    | 'countdown'
    | 'gallery';

// Transfer tipleri
export type TransferType = 'gift' | 'sale' | 'claim';

// Connection durumları
export type ConnectionStatus = 'pending' | 'accepted' | 'blocked';

// Notification tipleri
export type NotificationType =
    | 'connection_request'
    | 'connection_accepted'
    | 'coffee_break'
    | 'plant_reminder'
    | 'gift_received'
    | 'gift_claimed';

// Modül seçenekleri
export const MODULE_OPTIONS = [
    { id: 'card', emoji: '📇', name: 'Akıllı Kartvizit', description: 'Dijital kartvizit ve networking' },
    { id: 'plant', emoji: '🪴', name: 'Akıllı Saksı', description: 'Bitki takibi ve AI asistan' },
    { id: 'mug', emoji: '☕', name: 'Akıllı Kupa', description: 'İçecek takibi ve sosyal paylaşım' },
    { id: 'gift', emoji: '🎁', name: 'Hediye', description: 'Sürpriz mesaj ve medya' },
    { id: 'canvas', emoji: '✏️', name: 'Serbest', description: 'Blok tabanlı sayfa oluşturucu' },
] as const;

// Theme presets
export const THEME_PRESETS = {
    modern: { color: '#2ecc71', style: 'modern' },
    romantic: { color: '#e74c3c', style: 'romantic' },
    minimal: { color: '#95a5a6', style: 'minimal' },
    nature: { color: '#27ae60', style: 'nature' },
    dark: { color: '#1a1a1a', style: 'dark' },
} as const;

// Extended user types for NextAuth
export interface ExtendedUser {
    id: string
    email: string | null
    name: string | null
    image: string | null
    username?: string | null
    bio?: string | null
}

// Extended session types
declare module "next-auth" {
    interface Session {
        user: ExtendedUser
    }

    interface User extends ExtendedUser { }

    interface JWT {
        id?: string
        username?: string | null
        bio?: string | null
        role?: string
    }
}