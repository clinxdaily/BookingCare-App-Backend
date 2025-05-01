import userService from '../services/userService';

let handleLogin = async(req,res)=>{
    let email = req.body.email; //lấy dữ liệu từ client gửi lên
    let password = req.body.password;

    if(!email || !password){
        return res.status(500).json({
            errCode: 1, //mã lỗi
            message: 'Missing inputs parameter',
            });
    }

    let userData = await userService.handleUserLogin(email,password);
    return res.status(200).json({
        errCode: userData.errCode, //mã lỗi
        message: userData.errMessage, //thông báo lỗi
        user: userData.user ? userData.user : {}, //nếu có user thì trả về , k có thì trả về {}
    });
}
let handleGetAllUsers = async(req,res)=>{
    let id = req.body.id; //lấy dữ liệu từ client gửi lên
    if(!id){
        return res.status(200).json({
            errCode: 1, //mã lỗi
            message: 'Missing required parameters', //thông báo lỗi
            users: []//trả về danh sách người dùng
        })
    }
    let users = await userService.getAllUsers(id);
    return res.status(200).json({
        errCode: 0, //mã lỗi
        message: 'OK', //thông báo lỗi
        users //trả về danh sách người dùng
    })
}
module.exports = {
    handleLogin: handleLogin,
    handleGetAllUsers:handleGetAllUsers
}
