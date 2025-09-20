import doctorService from "../services/doctorService";
let getTopDoctorHome = async (req, res) => {
  let limit = req.query.limit; // lấy giới hạn từ query
  if (!limit) limit = 10; // nếu không có giới hạn thì mặc định là 10
  try {
    let response = await doctorService.getTopDoctorHome(+limit); // gọi service để lấy danh sách bác sĩ hàng đầu
    return res.status(200).json({
      errCode: 0, // mã lỗi 0 - OK
      data: response, // trả về dữ liệu bác sĩ
    });
  } catch (error) {
    return res.status(200).json({
      errCode: -1, // mã lỗi 1 - có lỗi xảy ra
      message: "Error from sever", // thông báo lỗi
    });
  }
};
let getAllDoctor = async (req, res) => {
  try {
    let doctors = await doctorService.getAllDoctor(); // gọi service để lấy tất cả bác sĩ
    return res.status(200).json(doctors);
  } catch (error) {
    console.log("Error in handleGetAllDoctor: ", error);
    return res.status(200).json({
      errCode: -1, // mã lỗi 1 - có lỗi xảy ra
      message: "Error from server", // thông báo lỗi
    });
  }
};
let postInfoDoctor = async (req, res) => {
  try {
    let response = await doctorService.postInfoDoctor(req.body); // gọi service để lưu thông tin bác sĩ
    return res.status(200).json(response); // trả về thông báo thành công
  } catch (error) {
    return res.status(200).json({
      errCode: -1, // mã lỗi 1 - có lỗi xảy ra
      message: "Error from server", // thông báo lỗi
    });
  }
};
let getDetailDoctorById = async (req, res) => {
  try {
    let response = await doctorService.getDetailDoctorById(req.query.id); // gọi service để lấy chi tiết bác sĩ theo id
    return res.status(200).json(response); // trả về thông tin chi tiết bác sĩ
  } catch (error) {
    return res.status(200).json({
      errCode: -1, // mã lỗi 1 - có lỗi xảy ra
      message: "Error from server", // thông báo lỗi
    });
  }
};
let bulkCreateSchedule = async (req, res) => {
  try {
    let response = await doctorService.bulkCreateSchedule(req.body);
    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(200)
      .json({ errCode: -1, errMesssage: "Error from server" });
  }
};
let getScheduleDoctorByDate = async (req, res) => {
  try {
    let response = await doctorService.getScheduleDoctorByDate(
      req.query.doctorId,
      req.query.date
    );
    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(200)
      .json({ errCode: -1, errMesssage: "Error from server" });
  }
};
let getExtraInfoDoctorById = async (req, res) => {
  try {
    let response = await doctorService.getExtraInfoDoctorById(
      req.query.doctorId
    );
    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(200)
      .json({ errCode: -1, errMesssage: "Error from server" });
  }
};
let getProfileDoctorById = async (req, res) => {
  try {
    let response = await doctorService.getProfileDoctorById(req.query.doctorId);
    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(200)
      .json({ errCode: -1, errMesssage: "Error from server" });
  }
};
let getListPatientForDoctor = async (req, res) => {
  try {
    let response = await doctorService.getListPatientForDoctor(
      req.query.doctorId,
      req.query.date
    );
    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(200)
      .json({ errCode: -1, errMesssage: "Error from server" });
  }
};
let sendRemedy = async (req, res) => {
  try {
    let response = await doctorService.sendRemedy(req.body);
    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(200)
      .json({ errCode: -1, errMesssage: "Error from server" });
  }
};
let handleGetRemedyByBooking = async (req, res) => {
  try {
    let response = await doctorService.getRemedyByBooking(req.body);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in handleGetRemedyByBooking:", error);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};
let deleteScheduleDoctorById = async (req, res) => {
  try {
    const { doctorId, date, timeType } = req.body;

    console.log("doctorId:", doctorId, "date:", date, "timeType:", timeType);

    let response = await doctorService.deleteScheduleDoctorById(req.body);

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};
let cancelAppointment = async (req, res) => {
  try {
    const { doctorId, patientId, timeType, date, reason } = req.body;

    if (!doctorId || !patientId || !timeType || !date) {
      return res.status(400).json({
        errCode: 1,
        errMessage: "Missing required parameters",
      });
    }

    const result = await doctorService.cancelAppointmentByDoctor({
      doctorId,
      patientId,
      timeType,
      date,
      reason,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in cancelAppointment:", error);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};
let getHistoryAppointment = async (req, res) => {
  try {
    const data = await doctorService.getHistoryAppointment(req.query.doctorId);
    return res.status(200).json(data);
  } catch (e) {
    return res
      .status(500)
      .json({ errCode: -1, errMessage: "Error from server" });
  }
};
let deleteHistoryAppointment = async (req, res) => {
  try {
    const { doctorId, patientId, timeType, date } = req.body;

    if (!doctorId || !patientId || !timeType || !date) {
      return res.status(400).json({
        errCode: 1,
        errMessage: "Missing required parameters",
      });
    }

    const result = await doctorService.deleteAppointment({
      doctorId,
      patientId,
      timeType,
      date,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in deleteHistoryAppointment:", error);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};
let getRevenue = async (req, res) => {
  try {
    const { doctorId, date, filterType } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({
        errCode: 1,
        errMessage: "Missing required parameters",
      });
    }

    const revenueData = await doctorService.getRevenue(
      doctorId,
      date,
      filterType
    );

    return res.status(200).json(revenueData);
  } catch (error) {
    console.error("Error in getRevenue:", error);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};
module.exports = {
  getTopDoctorHome: getTopDoctorHome,
  getAllDoctor: getAllDoctor,
  postInfoDoctor: postInfoDoctor,
  getDetailDoctorById: getDetailDoctorById,
  bulkCreateSchedule: bulkCreateSchedule,
  getScheduleDoctorByDate: getScheduleDoctorByDate,
  getExtraInfoDoctorById: getExtraInfoDoctorById,
  getProfileDoctorById: getProfileDoctorById,
  getListPatientForDoctor: getListPatientForDoctor,
  sendRemedy: sendRemedy,
  deleteScheduleDoctorById: deleteScheduleDoctorById,
  cancelAppointment: cancelAppointment,
  getHistoryAppointment: getHistoryAppointment,
  deleteHistoryAppointment: deleteHistoryAppointment,
  getRevenue: getRevenue,
  handleGetRemedyByBooking: handleGetRemedyByBooking,
};
