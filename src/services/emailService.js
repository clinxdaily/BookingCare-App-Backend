require("dotenv").config();
const nodemailer = require("nodemailer");

// ==========================
// Hàm gửi email thông thường
// ==========================
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
      tls: { rejectUnauthorized: false },
    });

    let htmlBody = getBodyHTMLEmail(dataSend.language, dataSend);

    let info = await transporter.sendMail({
      from: '"HealthCare 👨‍⚕️" <bhcuonggg@gmail.com>',
      to: dataSend.receiverEmail,
      subject: getEmailSubject(dataSend.language),
      html: htmlBody,
    });

    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

let getEmailSubject = (language) => {
  return language === "vi"
    ? "Xác nhận đặt lịch khám bệnh tại HealthCare"
    : "Appointment confirmation from HealthCare";
};

// ==========================
// Email đặt lịch hoặc bác sĩ đồng ý
// ==========================
let getBodyHTMLEmail = (language, dataSend) => {
  let result = "";
  if (language === "vi") {
    result = `
      <h3>Xin chào ${dataSend.patientName},</h3>
      <p>Bạn nhận được email này vì đã đặt lịch khám bệnh trên <strong>HealthCare</strong>.</p>
      <p><strong>Thông tin đặt lịch:</strong></p>
      <ul>
        <li><strong>Thời gian:</strong> ${dataSend.time}</li>
        <li><strong>Bác sĩ:</strong> ${dataSend.doctorName}</li>
      </ul>
      <p>Nhấn vào link dưới để xác nhận:</p>
      <div><a href="${dataSend.redirectLink}" target="_blank">Xác nhận lịch khám</a></div>
      <p>Trân trọng,<br/>HealthCare</p>
    `;
  } else {
    result = `
      <h3>Dear ${dataSend.patientName},</h3>
      <p>You received this email because you booked a medical appointment on <strong>HealthCare</strong>.</p>
      <p><strong>Your appointment details:</strong></p>
      <ul>
        <li><strong>Time:</strong> ${dataSend.time}</li>
        <li><strong>Doctor:</strong> ${dataSend.doctorName}</li>
      </ul>
      <p>Click the link below to confirm:</p>
      <div><a href="${dataSend.redirectLink}" target="_blank">Confirm appointment</a></div>
      <p>Sincerely,<br/>HealthCare</p>
    `;
  }
  return result;
};

// ==========================
// Email gửi hóa đơn (có file đính kèm)
// ==========================
let sendAttachmentEmail = async (dataSend) => {
  try {
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_APP,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
      tls: { rejectUnauthorized: false },
    });

    let attachments = [];

    if (dataSend.type === "image") {
      // Đính kèm tất cả ảnh
      attachments = dataSend.imgBase64List.map((base64, index) => ({
        filename: `remedy-${dataSend.patientId}-${Date.now()}-${index + 1}.png`,
        content: base64.split("base64,")[1],
        encoding: "base64",
      }));
    }

    let info = await transporter.sendMail({
      from: '"HealthCare 👨‍⚕️" <bhcuonggg@gmail.com>',
      to: dataSend.email,
      subject:
        dataSend.language === "vi"
          ? "Kết quả khám bệnh - HealthCare"
          : "Your Medical Result - HealthCare",
      html: getBodyHTMLEmailRemedy(dataSend.language, dataSend),
      attachments,
    });

    console.log("Email Remedy sent:", info.messageId);
  } catch (error) {
    console.error("Error sending remedy email:", error);
    throw error;
  }
};

// ==========================
// Body email gửi đơn thuốc
// ==========================
let getBodyHTMLEmailRemedy = (language, dataSend) => {
  if (language === "vi") {
    if (dataSend.type === "manual") {
      const medicineList = dataSend.medicines
        .map(
          (med, idx) =>
            `<li>${idx + 1}. <b>${med.name}</b> - SL: ${med.quantity} ${
              med.unit || ""
            } - Thời gian uống: ${med.time}</li>`
        )
        .join("");

      return `
        <h3>Xin chào ${dataSend.patientName},</h3>
        <p>Bác sĩ đã gửi đơn thuốc sau cho buổi khám:</p>
        <p><b>Chuẩn đoán ban đầu:</b> ${dataSend.initialDiagnosis}</p>
        <p><b>Kết luận:</b> ${dataSend.conclusion}</p>
        <p><b>Danh sách thuốc:</b></p>
        <ul>${medicineList}</ul>
        <p>Trân trọng,<br/>HealthCare</p>
      `;
    }

    // Với ảnh
    return `
      <h3>Xin chào ${dataSend.patientName},</h3>
      <p>Bác sĩ đã gửi kết quả/đơn thuốc của buổi khám.</p>
      <p>Vui lòng xem file đính kèm.</p>
      <p>Trân trọng,<br/>HealthCare</p>
    `;
  }

  // English
  if (dataSend.type === "manual") {
    const medicineList = dataSend.medicines
      .map(
        (med, idx) =>
          `<li>${idx + 1}. <b>${med.name}</b> - Qty: ${med.quantity} ${
            med.unit || ""
          } - Time: ${med.time}</li>`
      )
      .join("");

    return `
      <h3>Dear ${dataSend.patientName},</h3>
      <p>Your doctor has sent the following prescription:</p>
      <p><b>Initial Diagnosis:</b> ${dataSend.initialDiagnosis}</p>
      <p><b>Conclusion:</b> ${dataSend.conclusion}</p>
      <p><b>Medicines:</b></p>
      <ul>${medicineList}</ul>
      <p>Sincerely,<br/>HealthCare</p>
    `;
  }

  return `
    <h3>Dear ${dataSend.patientName},</h3>
    <p>Your doctor has sent you the result/prescription.</p>
    <p>Please check the attached file.</p>
    <p>Sincerely,<br/>HealthCare</p>
  `;
};

module.exports = {
  sendSimpleEmail,
  sendAttachmentEmail,
};
