'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Breadcrumb.module.css'

const pathNames: Record<string, string> = {
    'dashboard': 'Dashboard',
    'cards': 'Kartvizitler',
    'plants': 'Bitkiler',
    'mugs': 'Kupalar',
    'pages': 'Sayfalar',
    'new': 'Yeni',
    'edit': 'Düzenle',
}

export function Breadcrumb() {
    const pathname = usePathname()

    if (!pathname.startsWith('/dashboard')) return null

    const segments = pathname.split('/').filter(Boolean)

    // Don't show breadcrumb on main dashboard
    if (segments.length <= 1) return null

    const breadcrumbs = segments.map((segment, index) => {
        const href = '/' + segments.slice(0, index + 1).join('/')
        const label = pathNames[segment] || segment
        const isLast = index === segments.length - 1

        // Skip showing IDs in breadcrumb, just show context
        const isId = segment.length > 20 || segment.startsWith('cm')

        return { href, label: isId ? '📋' : label, isLast, isId }
    })

    return (
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, index) => (
                <span key={crumb.href} className={styles.crumbItem}>
                    {index > 0 && <span className={styles.separator}>/</span>}
                    {crumb.isLast ? (
                        <span className={styles.current}>{crumb.label}</span>
                    ) : (
                        <Link href={crumb.href} className={styles.link}>
                            {crumb.label}
                        </Link>
                    )}
                </span>
            ))}
        </nav>
    )
}
