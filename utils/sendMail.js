const nodemailer = require("nodemailer");


const sendMail = async function(option){
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
          // TODO: replace `user` and `pass` values from <https://forwardemail.net>
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      
    // send mail with defined transport object
    await transporter.sendMail({
        from: 'ok@tcs.com', // sender address
        to: option.to, // list of receivers
        subject: option.subject, // Subject line
        text: option.message, // plain text body
    });
}

module.exports = sendMail