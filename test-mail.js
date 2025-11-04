// require("dotenv").config();

// const nodemailer = require("nodemailer");

// async function sendTest() {
//   const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 465,
//     secure: true,
//     auth: {
//       user: process.env.SMTP_USER,
//       pass: process.env.SMTP_PASS,
//     },
//   });

//   try {
//     const info = await transporter.sendMail({
//       from: `"test" <${process.env.SMTP_USER}>`,
//       to: "mxzlatan754@gmail.com",
//       subject: "Test Nodemailer",
//       text: "Bonjour, test SMTP",
//     });
//     console.log("Email envoyé:", info.messageId);
//   } catch (err) {
//     console.error(err);
//   }
// }

// sendTest();
