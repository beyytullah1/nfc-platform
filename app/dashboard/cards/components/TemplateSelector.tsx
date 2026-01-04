"use client"

import { CARD_TEMPLATES } from '@/lib/card-templates'
import styles from './TemplateSelector.module.css'

interface TemplateSelectorProps {
    onSelect: (templateId: string) => void
    onSkip: () => void
}

export default function TemplateSelector({ onSelect, onSkip }: TemplateSelectorProps) {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>🎨 Şablon Seç</h1>
                <p>Hızlıca başlamak için hazır bir şablon seçin veya boş başlayın</p>
            </div>

            <div className={styles.grid}>
                {CARD_TEMPLATES.map((template) => (
                    <button
                        key={template.id}
                        onClick={() => onSelect(template.id)}
                        className={styles.templateCard}
                    >
                        <div className={styles.templateIcon}>{template.icon}</div>
                        <h3>{template.name}</h3>
                        <p>{template.description}</p>
                        <div className={styles.fieldPreview}>
                            {template.fields.slice(0, 3).map((field, i) => (
                                <span key={i} className={styles.fieldTag}>
                                    {field.icon} {field.label}
                                </span>
                            ))}
                            {template.fields.length > 3 && (
                                <span className={styles.moreFields}>
                                    +{template.fields.length - 3} alan
                                </span>
                            )}
                        </div>
                    </button>
                ))}

                {/* Boş Başla */}
                <button onClick={onSkip} className={`${styles.templateCard} ${styles.blankCard}`}>
                    <div className={styles.templateIcon}>✨</div>
                    <h3>Boş Başla</h3>
                    <p>Sıfırdan kendiniz oluşturun</p>
                </button>
            </div>
        </div>
    )
}
