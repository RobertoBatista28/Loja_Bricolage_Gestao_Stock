const nodemailer = require('nodemailer');

// Crie um transporte de e-mail
const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: 'jr.bricolage-suporte@hotmail.com',
    pass: 'JRbricolage!',
  },
});

async function sendPasswordResetEmail(email, resetToken) {
  const mailOptions = {
    from: 'jr.bricolage-suporte@hotmail.com',
    to: email,
    subject: 'Recuperação de palavra-passe',
    text: `Houve um pedido por parte do cliente para a redefenir a palavra-passe.\nUse o seguinte token temporário para o efeito: ${resetToken}`,
  };
  await transporter.sendMail(mailOptions);
}

async function sendVerificationEmail(email, verificationToken) {
  const mailOptions = {
      from: 'jr.bricolage-suporte@hotmail.com',
      to: email,
      subject: 'Verificação de Email',
      text: `Obrigado por se registar. Clique no link abaixo para confirmar a sua conta:\nhttp://127.0.0.1:3001/auth/verify-email?token=${verificationToken}`,
  };
  await transporter.sendMail(mailOptions);
}

module.exports = { sendPasswordResetEmail, sendVerificationEmail};