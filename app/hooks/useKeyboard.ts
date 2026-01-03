'use client'

import { useEffect } from 'react'

/**
 * Custom hook to handle Escape key press
 * @param onEscape - Callback function to call when Escape is pressed
 * @param isActive - Whether the hook should be active (default: true)
 */
export function useEscapeKey(onEscape: () => void, isActive: boolean = true) {
    useEffect(() => {
        if (!isActive) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onEscape()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [onEscape, isActive])
}

/**
 * Custom hook to lock body scroll when a modal is open
 * @param isLocked - Whether body scroll should be locked
 */
export function useBodyScrollLock(isLocked: boolean) {
    useEffect(() => {
        if (isLocked) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }

        return () => {
            document.body.style.overflow = ''
        }
    }, [isLocked])
}
