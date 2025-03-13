const path = require('path');
const nodemailer = require('nodemailer');
const { htmlToText } = require('html-to-text');
const pug = require('pug');

module.exports = class {
  constructor(user, code) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.code = code;
    this.from = `E-Shop <${process.env.EMAIL_FROM}>`;
  }

  createTransport() {
    // Service that will send the email
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    const html = pug.renderFile(`${__dirname}/../templates/${template}.pug`, { code: this.code });

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    };

    await this.createTransport().sendMail(mailOptions);
  }

  async sendVerifyEmail() {
    const subject = 'Your password reset token (valid for only 10 mins)';
    await this.send('verifyEmail', subject);
  }

  async sendPasswordReset() {
    const subject = 'Your password reset token (valid for only 10 mins)';
    await this.send('resetPassword', subject);
  }
};
