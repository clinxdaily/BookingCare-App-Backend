require("dotenv").config();
const nodemailer = require("nodemailer");
let sendSimpleEmail = async (dataSend) => {
  try {
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_APP,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false, // ⚠️ không kiểm tra chứng chỉ SSL
      },
    });

    let info = await transporter.sendMail({
      from: '"HealthCare 👨‍⚕️" <bhcuonggg@gmail.com>',
      to: dataSend.receiverEmail,
      subject: "Xác nhận đặt lịch khám bệnh tại HealthCare",
      text: "Hello world?",
      html: getBodyHTMLEmail(dataSend.language, dataSend),
    });

    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error; // quan trọng: để postBookAppointment nhận được lỗi
  }
};
let getBodyHTMLEmail = (language, dataSend) => {
  let result = "";
  if (dataSend.language === "vi") {
    result = `
    <h3>Xin chào ${dataSend.patientName},</h3>
    <p>Bạn nhận được email này vì đã đặt lịch khám bệnh trên nền tảng <strong>HealthCare</strong>.</p>
    <p><strong>Thông tin đặt lịch khám của bạn:</strong></p>
    <ul>
      <li><strong>Thời gian:</strong> ${dataSend.time}</li>
      <li><strong>Bác sĩ:</strong> ${dataSend.doctorName}</li>
    </ul>
    <p>Nếu các thông tin trên là chính xác, vui lòng click vào đường link bên dưới để xác nhận.</p>
    <div><a href=${dataSend.redirectLink} target="_blank">Nhấn tại đây</a></div>
    <p>Trân trọng,<br/>HealthCare - Nền tảng chăm sóc sức khỏe toàn diện</p>
  `;
  }
  if (dataSend.language === "en") {
    result = `
  <h3>Dear ${dataSend.patientName},</h3>
  <p>You received this email because you have booked a medical appointment on the <strong>HealthCare</strong> platform.</p>
  <p><strong>Your appointment details:</strong></p>
  <ul>
    <li><strong>Time:</strong> ${dataSend.time}</li>
    <li><strong>Doctor:</strong> ${dataSend.doctorName}</li>
  </ul>
  <p>If the above information is correct, please click the link below to confirm your appointment.</p>
  <div><a href=${dataSend.redirectLink} target="_blank">Click here to confirm</a></div>
  <p>Sincerely,<br/>HealthCare – Comprehensive Health Care Platform</p>
`;
  }
  return result;
};
module.exports = { sendSimpleEmail: sendSimpleEmail };
