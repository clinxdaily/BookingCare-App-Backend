import e from "express";
import userService from "../services/userService"; // import service xử lý logic liên quan đến user

let handleLogin = async (req, res) => {
  let email = req.body.email; // lấy email từ client gửi lên
  let password = req.body.password; // lấy password từ client gửi lên

  if (!email || !password) {
    // kiểm tra nếu thiếu email hoặc password
    return res.status(500).json({
      errCode: 1, // mã lỗi 1 - thiếu thông tin
      message: "Missing inputs parameter", // thông báo lỗi
    });
  }

  let userData = await userService.handleUserLogin(email, password); // gọi service để xử lý đăng nhập
  return res.status(200).json({
    errCode: userData.errCode, // mã lỗi từ service
    message: userData.errMessage, // thông báo từ service
    user: userData.user ? userData.user : {}, // nếu có user thì trả về, nếu không thì trả object rỗng
  });
};

let handleGetAllUsers = async (req, res) => {
  let id = req.query.id; // lấy id từ query (client gửi lên)

  if (!id) {
    // nếu không có id thì trả lỗi
    return res.status(200).json({
      errCode: 1, // mã lỗi 1 - thiếu tham số bắt buộc
      message: "Missing required parameters", // thông báo lỗi
      users: [], // trả về danh sách rỗng
    });
  }

  let users = await userService.getAllUsers(id); // lấy danh sách user theo id (all hoặc cụ thể)
  return res.status(200).json({
    errCode: 0, // mã lỗi 0 - OK
    message: "OK", // thông báo thành công
    users, // trả về danh sách user
  });
};

let handleCreateNewUser = async (req, res) => {
  let message = await userService.createNewUser(req.body); // gọi service để tạo user mới
  return res.status(200).json(message); // trả về kết quả từ service
};

let handleDeleteUser = async (req, res) => {
  if (!req.body.id) {
    // nếu không có id thì trả lỗi
    return res.status(200).json({
      errCode: 1, // mã lỗi
      message: "Missing required parameters", // thông báo lỗi
    });
  }

  let message = await userService.deleteUser(req.body.id); // gọi service để xoá user theo id
  return res.status(200).json(message); // trả kết quả về client
};

let handleEditUser = async (req, res) => {
  let data = req.body; // lấy dữ liệu user cần sửa
  let message = await userService.updateUserData(data); // gọi service để cập nhật user
  return res.status(200).json(message); // trả kết quả về client
};
let getAllCode = async (req, res) => {
  try {
    let data = await userService.getAllCodeService(req.query.type); // gọi service để lấy tất cả mã code
    return res.status(200).json(data); // trả về mã lỗi 0 và dữ liệu
  } catch (error) {
    console.log("get all code error: ", error); // log lỗi nếu có
    return res.status(200).json({ errCode: -1, message: "Error from server" }); // nếu có lỗi thì trả về mã lỗi và thông báo
  }
};
module.exports = {
  // export tất cả hàm controller
  handleLogin: handleLogin,
  handleGetAllUsers: handleGetAllUsers,
  handleCreateNewUser: handleCreateNewUser,
  handleEditUser: handleEditUser,
  handleDeleteUser: handleDeleteUser,
  getAllCode: getAllCode,
};
