import styles from "./cards.module.css"

export default function CardsLoading() {
    return (
        <>
            <header className={styles.header}>
                <div>
                    <div className={styles.skeleton} style={{ width: '150px', height: '28px', marginBottom: '8px' }}></div>
                    <div className={styles.skeleton} style={{ width: '200px', height: '16px' }}></div>
                </div>
                <div className={styles.skeleton} style={{ width: '160px', height: '44px', borderRadius: '12px' }}></div>
            </header>

            <div className={styles.statsGrid}>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={styles.statCard}>
                        <div className={styles.skeleton} style={{ width: '48px', height: '48px', borderRadius: '12px' }}></div>
                        <div className={styles.statInfo}>
                            <div className={styles.skeleton} style={{ width: '80px', height: '12px', marginBottom: '4px' }}></div>
                            <div className={styles.skeleton} style={{ width: '40px', height: '28px' }}></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.cardList}>
                {[1, 2, 3].map((i) => (
                    <div key={i} className={styles.cardItem}>
                        <div className={styles.skeleton} style={{ width: '56px', height: '56px', borderRadius: '50%' }}></div>
                        <div className={styles.cardInfo} style={{ flex: 1 }}>
                            <div className={styles.skeleton} style={{ width: '120px', height: '16px', marginBottom: '6px' }}></div>
                            <div className={styles.skeleton} style={{ width: '180px', height: '12px' }}></div>
                        </div>
                        <div className={styles.skeleton} style={{ width: '100px', height: '32px', borderRadius: '8px' }}></div>
                    </div>
                ))}
            </div>
        </>
    )
}
