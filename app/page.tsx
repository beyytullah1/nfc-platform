import Link from "next/link"
import { auth } from "@/lib/auth"
import styles from "./landing.module.css"
import MobileLandingMenu from "./MobileLandingMenu"
import { ProfileDropdown } from "@/app/components/ProfileDropdown"

export const metadata = {
  title: "Temasal - Bir temas, bir anlam",
  description: "Temasal, temasla anlam kazanan nesneler için kurulmuş dijital bir platformdur.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
}

export default async function Home() {
  const session = await auth()

  return (
    <div className={styles.page}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🏷️</span>
          <span className={styles.logoText}>Temasal</span>
        </div>
        <div className={styles.navLinks}>
          {session?.user ? (
            <ProfileDropdown />
          ) : (
            <>
              <Link href="/login" className={styles.navLink}>Giriş</Link>
              <Link href="/register" className={styles.navBtnPrimary}>Ücretsiz Başla</Link>
            </>
          )}
        </div>
        <MobileLandingMenu isLoggedIn={!!session?.user} />
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>🚀 Bir temas, bir anlam.</div>
          <h1 className={styles.heroTitle}>
            Fiziksel Nesnelerinizi
            <span className={styles.gradientText}> Dijitale </span>
            Dönüştürün
          </h1>
          <p className={styles.heroDesc}>
            Temasal ile kartvizitler, bitkiler, kupalar ve daha fazlasını
            akıllı dijital deneyimlere çevirin.
          </p>
          <div className={styles.heroCta}>
            <Link href="/register" className={styles.ctaPrimary}>
              Hemen Başla
              <span className={styles.ctaArrow}>→</span>
            </Link>
            <Link href="#features" className={styles.ctaSecondary}>
              Nasıl Çalışır?
            </Link>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.floatingCard}>
            <div className={styles.nfcIcon}>📱</div>
            <div className={styles.scanEffect}></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features} id="features">
        <div className={styles.sectionHeader}>
          <h2>5 Güçlü Modül</h2>
          <p>Her ihtiyaca uygun çözümler</p>
        </div>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>💳</div>
            <h3>Akıllı Kartvizit</h3>
            <p>Dijital kartvizitler oluşturun, kademeli gizlilik ile bilgilerinizi kontrol edin.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🌱</div>
            <h3>Akıllı Saksı</h3>
            <p>Bitkilerinizi takip edin, AI asistan ile bakım önerileri alın.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>☕</div>
            <h3>Akıllı Kupa</h3>
            <p>İçecek alışkanlıklarınızı takip edin, arkadaşlarınızla paylaşın.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🎁</div>
            <h3>Hediye Modu</h3>
            <p>Sürpriz mesajlar, müzik ve videolar ile özel anlar yaratın.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>✨</div>
            <h3>Serbest Canvas</h3>
            <p>Tamamen özelleştirilebilir sayfalar oluşturun.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.howItWorks}>
        <div className={styles.sectionHeader}>
          <h2>Nasıl Çalışır?</h2>
          <p>3 basit adımda başlayın</p>
        </div>
        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <h3>NFC Etiketine Dokun</h3>
            <p>Telefonunuzu etikete yaklaştırın</p>
          </div>
          <div className={styles.stepLine}></div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <h3>Profilinizi Oluşturun</h3>
            <p>Modül seçin ve özelleştirin</p>
          </div>
          <div className={styles.stepLine}></div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <h3>Paylaşmaya Başlayın</h3>
            <p>Dijital deneyiminiz hazır!</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2>Hemen Başlamaya Hazır mısınız?</h2>
          <p>Ücretsiz hesap oluşturun ve NFC etiketinizi aktifleştirin.</p>
          <Link href="/register" className={styles.ctaPrimary}>
            Ücretsiz Kayıt Ol
            <span className={styles.ctaArrow}>→</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLogo}>
            <span>🏷️</span> Temasal
          </div>
          <div className={styles.footerLinks}>
            <Link href="/login">Giriş</Link>
            <Link href="/register">Kayıt</Link>
            <Link href="#features">Özellikler</Link>
          </div>
          <p className={styles.footerCopy}>© 2024 Temasal. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  )
}
