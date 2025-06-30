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
module.exports = {
  getTopDoctorHome: getTopDoctorHome,
  getAllDoctor: getAllDoctor,
  postInfoDoctor: postInfoDoctor,
  getDetailDoctorById: getDetailDoctorById,
  bulkCreateSchedule: bulkCreateSchedule,
  getScheduleDoctorByDate: getScheduleDoctorByDate,
};
