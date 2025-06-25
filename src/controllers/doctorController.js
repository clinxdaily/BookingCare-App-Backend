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

module.exports = { getTopDoctorHome };
