'use client'

import { useState, useCallback } from 'react'
import { useToast } from '../components/Toast'

interface UseCopyOptions {
    successMessage?: string
    errorMessage?: string
    resetDelay?: number
}

/**
 * Hook for copying text to clipboard with toast feedback
 */
export function useCopyToClipboard(options: UseCopyOptions = {}) {
    const {
        successMessage = 'Kopyalandı!',
        errorMessage = 'Kopyalama başarısız',
        resetDelay = 2000
    } = options

    const [copied, setCopied] = useState(false)
    const { showToast } = useToast()

    const copy = useCallback(async (text: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            showToast(successMessage, 'success')

            setTimeout(() => setCopied(false), resetDelay)
            return true
        } catch (err) {
            showToast(errorMessage, 'error')
            return false
        }
    }, [successMessage, errorMessage, resetDelay, showToast])

    return { copy, copied }
}

/**
 * Hook for sharing content using Web Share API with fallback to clipboard
 */
export function useShare() {
    const { copy } = useCopyToClipboard({ successMessage: 'Link kopyalandı!' })
    const { showToast } = useToast()

    const share = useCallback(async (data: { title?: string; text?: string; url: string }) => {
        if (navigator.share) {
            try {
                await navigator.share(data)
                return true
            } catch (err) {
                // User cancelled or error - fall back to copy
                if ((err as Error).name !== 'AbortError') {
                    return copy(data.url)
                }
                return false
            }
        } else {
            // No Web Share API - use clipboard
            return copy(data.url)
        }
    }, [copy])

    return { share }
}
