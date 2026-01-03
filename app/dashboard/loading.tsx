import styles from "./dashboard.module.css"

export default function DashboardLoading() {
    return (
        <>
            <header className={styles.header}>
                <div>
                    <div className={styles.skeleton} style={{ width: '200px', height: '28px', marginBottom: '8px' }}></div>
                    <div className={styles.skeleton} style={{ width: '180px', height: '16px' }}></div>
                </div>
                <div className={styles.skeleton} style={{ width: '150px', height: '36px', borderRadius: '20px' }}></div>
            </header>

            <div className={styles.stats}>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={styles.statCard}>
                        <div className={styles.skeleton} style={{ width: '56px', height: '56px', borderRadius: '12px' }}></div>
                        <div className={styles.statInfo}>
                            <div className={styles.skeleton} style={{ width: '40px', height: '28px', marginBottom: '4px' }}></div>
                            <div className={styles.skeleton} style={{ width: '60px', height: '14px' }}></div>
                        </div>
                    </div>
                ))}
            </div>

            <section className={styles.recentSection}>
                <div className={styles.sectionHeader}>
                    <div className={styles.skeleton} style={{ width: '150px', height: '24px' }}></div>
                </div>
                <div className={styles.activityList}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className={styles.activityItem}>
                            <div className={styles.skeleton} style={{ width: '40px', height: '40px', borderRadius: '10px' }}></div>
                            <div className={styles.activityContent}>
                                <div className={styles.skeleton} style={{ width: '80px', height: '14px', marginBottom: '4px' }}></div>
                                <div className={styles.skeleton} style={{ width: '120px', height: '12px' }}></div>
                            </div>
                            <div className={styles.skeleton} style={{ width: '60px', height: '12px' }}></div>
                        </div>
                    ))}
                </div>
            </section>
        </>
    )
}
