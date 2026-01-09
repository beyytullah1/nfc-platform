import nodemailer from 'nodemailer'

/**
 * Email service using Gmail SMTP
 * 
 * Setup:
 * 1. Gmail hesabına gir
 * 2. Google Account → Security → 2-Step Verification (aktif et)
 * 3. App Passwords → Generate
 * 4. .env dosyasına ekle:
 *    EMAIL_USER="your-email@gmail.com"
 *    EMAIL_PASS="your-app-password"
 */

// Create transporter
const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
})

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
    email: string,
    token: string,
    userName?: string
) {
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`

    const mailOptions = {
        from: `"Temasal" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Şifre Sıfırlama Talebi - Temasal',
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 30px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            color: #2ecc71;
          }
          .slogan {
            color: #666;
            font-size: 14px;
            margin-top: 5px;
          }
          .content {
            background: white;
            padding: 30px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .button {
            display: inline-block;
            padding: 14px 30px;
            background: #2ecc71;
            color: white !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
          }
          .button:hover {
            background: #27ae60;
          }
          .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            text-align: center;
            color: #666;
            font-size: 12px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🏷️ Temasal</div>
            <div class="slogan">Bir temas, bir anlam.</div>
          </div>

          <div class="content">
            <h2>Merhaba${userName ? ` ${userName}` : ''},</h2>
            
            <p>Hesabınız için şifre sıfırlama talebinde bulundunuz.</p>
            
            <p>Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Şifremi Sıfırla</a>
            </div>
            
            <div class="warning">
              <strong>⚠️ Önemli:</strong> Bu link 30 dakika içinde geçerliliğini yitirecektir.
            </div>
            
            <p>Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              Buton çalışmıyorsa, aşağıdaki linki kopyalayıp tarayıcınıza yapıştırabilirsiniz:<br>
              <a href="${resetUrl}" style="color: #2ecc71; word-break: break-all;">${resetUrl}</a>
            </p>
          </div>

          <div class="footer">
            <p>Bu e-posta Temasal tarafından otomatik olarak gönderilmiştir.</p>
            <p>Lütfen bu e-postayı yanıtlamayın.</p>
            <p style="margin-top: 10px;">
              © ${new Date().getFullYear()} Temasal. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
        text: `
Merhaba${userName ? ` ${userName}` : ''},

Hesabınız için şifre sıfırlama talebinde bulundunuz.

Şifrenizi sıfırlamak için aşağıdaki linke tıklayın:
${resetUrl}

Bu link 30 dakika içinde geçerliliğini yitirecektir.

Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.

---
Temasal - Bir temas, bir anlam.
    `.trim(),
    }

    try {
        await transporter.sendMail(mailOptions)
        return { success: true }
    } catch (error) {
        console.error('Email send error:', error)
        return { success: false, error }
    }
}

/**
 * Verify email configuration
 */
export async function verifyEmailConfig() {
    try {
        await transporter.verify()
        return true
    } catch (error) {
        console.error('Email config error:', error)
        return false
    }
}
