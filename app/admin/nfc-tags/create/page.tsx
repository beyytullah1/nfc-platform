import Link from "next/link"
import styles from "../../admin.module.css"
import { CreateTagForm } from "./CreateTagForm"
import { BulkCreateForm } from "./BulkCreateForm"

export default async function CreateNfcTagPage() {
    return (
        <div>
            <Link href="/admin/nfc-tags" className={styles.backLink}>
                ← NFC Etiketlere Dön
            </Link>

            <div className={styles.header}>
                <h1>Yeni NFC Etiket Oluştur</h1>
                <p>Tek veya toplu etiket oluşturabilirsiniz</p>
            </div>

            <div className={styles.detailGrid}>
                {/* Tek Etiket Oluştur */}
                <div className={styles.detailCard}>
                    <h2>🏷️ Tek Etiket Oluştur</h2>
                    <CreateTagForm />
                </div>

                {/* Toplu Etiket Oluştur */}
                <div className={styles.detailCard}>
                    <h2>📦 Toplu Etiket Oluştur</h2>
                    <BulkCreateForm />
                </div>
            </div>

            {/* Bilgi Kartları */}
            <div className={styles.section} style={{ marginTop: '2rem' }}>
                <h2>💡 Bilgiler</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                    <div className={styles.infoBox}>
                        <strong>Public Code Nedir?</strong>
                        <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                            Kullanıcıların etikete erişmek için kullandığı benzersiz kod. Örn: <code>ABCD1234</code>
                        </p>
                    </div>
                    <div className={styles.infoBox}>
                        <strong>Tag ID Nedir?</strong>
                        <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                            Fiziksel NFC etiketin benzersiz kimliği. Otomatik oluşturulur veya manuel girebilirsiniz.
                        </p>
                    </div>
                    <div className={styles.infoBox}>
                        <strong>Modül Tipi</strong>
                        <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                            Etiketin hangi modüle özel olduğunu belirtir. Boş bırakılırsa genel amaçlı olur.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
