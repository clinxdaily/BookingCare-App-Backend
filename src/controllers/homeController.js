import db from '../models/index'; // import model sequelize
import SRUDService from '../services/CRUDService'; // import service xử lý CRUD

let getHomePage = async (req, res) => { // lấy trang chủ và hiển thị danh sách user
    try {
        let data = await db.User.findAll(); // lấy toàn bộ user từ DB
        return res.render('./homepage.ejs', { // render ra trang homepage.ejs
            data: JSON.stringify(data) // truyền dữ liệu user dưới dạng chuỗi JSON
        });
    } catch (e) {
        console.log(e) // in lỗi nếu có
    }
}

let getAboutPage = (req, res) => { // trả về trang about
    return res.render('./about.ejs'); // render trang about.ejs
}

let getCRUD = (req, res) => { // hiển thị form CRUD
    return res.render('crud.ejs'); // render trang crud.ejs
}

let postCRUD = async (req, res) => { // nhận dữ liệu từ form và thêm user mới
    let messsage = await SRUDService.createNewUser(req.body); // gọi hàm tạo user trong service
    console.log(messsage) // in ra kết quả
    return res.send('cRUD form view sever ') // phản hồi lại client
}

let displayGetCRUD = async (req, res) => { // hiển thị danh sách user
    let data = await SRUDService.getAllUser(); // lấy toàn bộ user từ DB
    return res.render('displayCRUD.ejs', { // render ra trang hiển thị
        dataTable: data // truyền dữ liệu user cho EJS
    })
}

let getEditCRUD = async (req, res) => { // lấy thông tin user theo id để chỉnh sửa
    let userId = req.query.id; // lấy id từ query
    if (userId) {
        let userData = await SRUDService.getUserInfoById(userId); // gọi service lấy dữ liệu user
        return res.render('editCRUD.ejs', { // render form chỉnh sửa
            user: userData // truyền dữ liệu user vào view
        });
    } else {
        return res.send('User not found'); // nếu không có id
    }
}

let putCRUD = async (req, res) => { // cập nhật dữ liệu user
    let data = req.body; // lấy dữ liệu từ body
    let allUsers = await SRUDService.updateUserData(data); // gọi service cập nhật
    return res.render('displayCRUD.ejs', { // render lại danh sách sau khi cập nhật
        dataTable: allUsers // truyền lại danh sách mới
    })
}

let deleteCRUD = async (req, res) => { // xoá user theo id
    let id = req.query.id; // lấy id từ query
    if (id) {
        await SRUDService.deleteUserById(id); // gọi service xoá user
        return res.send('Delete user succeed') // phản hồi thành công
    } else {
        return res.send('User not found'); // nếu không có id
    }
}

module.exports = { // xuất các hàm để router sử dụng
    getHomePage: getHomePage,
    getAboutPage: getAboutPage,
    getCRUD: getCRUD,
    postCRUD: postCRUD,
    displayGetCRUD: displayGetCRUD,
    getEditCRUD: getEditCRUD,
    putCRUD: putCRUD,
    deleteCRUD: deleteCRUD
}
