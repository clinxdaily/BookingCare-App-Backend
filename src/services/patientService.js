import { where } from "sequelize";
import db from "../models/index";
require("dotenv").config();
import emailService from "./emailService";
import { v4 as uuidv4 } from "uuid";
import { raw } from "body-parser";

let buildUrlEmail = (doctorId, token) => {
  let result = `${process.env.URL_REACT}/verify-booking?token=${token}&doctorId=${doctorId}`;
  return result;
};
let postBookAppointment = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      // ✅ Kiểm tra đầy đủ các trường
      if (
        !data.email ||
        !data.doctorId ||
        !data.date ||
        !data.timeType ||
        !data.fullName ||
        !data.selectedGender ||
        !data.address ||
        !data.cccd ||
        !data.phoneNumber ||
        !data.reason
      ) {
        return resolve({
          errCode: 1,
          errMessage: "Missing required parameters",
        });
      }

      const token = uuidv4();

      // ✅ Gửi email xác nhận
      await emailService.sendSimpleEmail({
        receiverEmail: data.email,
        patientName: data.fullName,
        time: data.timeString,
        doctorName: data.doctorName,
        language: data.language,
        redirectLink: buildUrlEmail(data.doctorId, token),
      });

      // ✅ Tìm hoặc tạo user
      let user = await db.User.findOne({
        where: { email: data.email },
        raw: false,
      });

      if (user) {
        // ✅ Nếu user đã tồn tại, cập nhật thông tin
        user.firstName = data.fullName;
        user.address = data.address;
        user.gender = data.selectedGender;
        user.cccd = data.cccd;
        user.phonenumber = data.phoneNumber;
        await user.save();
      } else {
        // ✅ Nếu chưa có user, tạo mới
        user = await db.User.create({
          email: data.email,
          roleId: "R3",
          address: data.address,
          gender: data.selectedGender,
          firstName: data.fullName,
          cccd: data.cccd,
          phonenumber: data.phoneNumber,
        });
      }

      // ✅ Kiểm tra xem đã có lịch trùng chưa
      let existingBooking = await db.Booking.findOne({
        where: {
          doctorId: data.doctorId,
          patientId: user.id,
          date: data.date,
          timeType: data.timeType,
        },
      });

      if (existingBooking) {
        if (existingBooking.statusId === "S4") {
          // ✅ Lịch cũ đã bị hủy -> cho phép tạo mới
          await db.Booking.create({
            statusId: "S1",
            doctorId: data.doctorId,
            patientId: user.id,
            date: data.date,
            timeType: data.timeType,
            token: token,
            patientName: data.fullName,
            reason: data.reason,
          });
        } else {
          return resolve({
            errCode: 2,
            errMessage: "Lịch khám này đã tồn tại và chưa bị hủy",
          });
        }
      } else {
        // ✅ Không có booking trùng -> tạo mới
        await db.Booking.create({
          statusId: "S1",
          doctorId: data.doctorId,
          patientId: user.id,
          date: data.date,
          timeType: data.timeType,
          token: token,
          patientName: data.fullName,
          reason: data.reason,
        });
      }

      return resolve({
        errCode: 0,
        errMessage: "Save info patient success",
      });
    } catch (error) {
      console.error("Booking error:", error);
      return reject({
        errCode: -1,
        errMessage: "Internal server error",
      });
    }
  });
};

let postVerifyBookAppointment = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.token || !data.doctorId) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameters",
        });
      } else {
        let appointment = await db.Booking.findOne({
          where: {
            doctorId: data.doctorId,
            token: data.token,
            statusId: "S1",
          },
          raw: false,
        });
        if (appointment) {
          appointment.statusId = "S2";
          await appointment.save();
          resolve({
            errCode: 0,
            errMessage: "Update the apppointment succeed!",
          });
        } else {
          resolve({
            errCode: 2,
            errMessage: "Apppointment has been activated or does not exist",
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};
module.exports = {
  postBookAppointment: postBookAppointment,
  postVerifyBookAppointment: postVerifyBookAppointment,
};
