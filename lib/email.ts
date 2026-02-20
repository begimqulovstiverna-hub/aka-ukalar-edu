import nodemailer from 'nodemailer';

// Email transporter yaratish
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER,        // Vercel’dagi nom
    pass: process.env.EMAIL_SERVER_PASSWORD,    // Vercel’dagi nom
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Parolni tiklash emailini yuborish
export async function sendPasswordResetEmail(toEmail: string, resetToken: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: `"aka-ukalar_markazi" <${process.env.EMAIL_FROM}>`,
    to: toEmail,
    subject: 'Parolni tiklash',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Parolni tiklash</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">aka-ukalar</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #444; margin-top: 0;">Parolni tiklash</h2>
          <p style="color: #666;">Hurmatli foydalanuvchi,</p>
          <p style="color: #666;">Sizning parolni tiklash so'rovingiz qabul qilindi. Quyidagi tugma orqali yangi parol o'rnatishingiz mumkin:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Parolni tiklash</a>
          </div>
          
          <p style="color: #666;">Agar yuqoridagi tugma ishlamasa, quyidagi linkdan nusxa oling:</p>
          <p style="background: #eee; padding: 10px; border-radius: 5px; word-break: break-all;">
            <code style="color: #667eea;">${resetUrl}</code>
          </p>
          
          <p style="color: #999; font-size: 14px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
            ⚠️ Bu link 1 soat davomida amal qiladi. Agar siz parolni tiklash so'rovini yubormagan bo'lsangiz, ushbu xabarni e'tiborsiz qoldiring.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© 2026 aka-ukalar o'quv markazi. Barcha huquqlar himoyalangan.</p>
          <p>3-QAVAT, Chilonzor tumani, Toshkent</p>
        </div>
      </body>
      </html>
    `,
    text: `
      Parolni tiklash
      
      Hurmatli foydalanuvchi,
      
      Sizning parolni tiklash so'rovingiz qabul qilindi. Quyidagi link orqali yangi parol o'rnatishingiz mumkin:
      
      ${resetUrl}
      
      ⚠️ Bu link 1 soat davomida amal qiladi. Agar siz parolni tiklash so'rovini yubormagan bo'lsangiz, ushbu xabarni e'tiborsiz qoldiring.
      
      © 2026 aka-ukalar o'quv markazi
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email yuborildi:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email yuborishda xatolik:', error);
    throw error;
  }
}
