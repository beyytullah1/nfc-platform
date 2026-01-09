export default function TestLayout({ children }: { children: React.ReactNode }) {
    console.log('[TestLayout] Rendering without auth check')
    return <div>{children}</div>
}
