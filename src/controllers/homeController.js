import db from '../models/index';
import SRUDService from '../services/CRUDService';
let getHomePage = async(req,res) =>{
    try {
        let data = await db.User.findAll();
        return res.render('./homepage.ejs',{
            data: JSON.stringify(data)
        });
    } catch (e) {
        console.log(e)
    }
    
}
let getAboutPage = (req,res) =>{
    return res.render('./about.ejs');
}
let getCRUD = (req,res) =>{
    return res.render('crud.ejs');
}
let postCRUD = async(req,res) =>{
    let messsage = await SRUDService.createNewUser(req.body);
    console.log(messsage)
    return res.send('cRUD form view sever ')
}
let displayGetCRUD = async(req,res)=>{
    let data= await SRUDService.getAllUser();
    return res.render('displayCRUD.ejs', {
        dataTable: data
    })
}
let getEditCRUD = async(req,res)=>{
    let userId = req.query.id;
    if(userId){
        let userData = await SRUDService.getUserInfoById(userId);
        //check userData notfond 
        return res.render('editCRUD.ejs',{
            user:userData
        });      
    }
    else{
        return res.send('User not found');
    }
     
}
let putCRUD = async(req,res)=>{
    let data = req.body;
    let allUsers = await SRUDService.updateUserData(data);
    return res.render('displayCRUD.ejs', {
        dataTable: allUsers
    })      
}
let deleteCRUD = async(req,res)=>{
    let id = req.query.id;
    if(id){
        await SRUDService.deleteUserById(id);
        return res.send('Delete user succeed')
       
    }else{
        return res.send('User not found');
    }
    
}
module.exports={
    getHomePage: getHomePage,
    getAboutPage: getAboutPage,
    getCRUD: getCRUD,
    postCRUD: postCRUD,
    displayGetCRUD:displayGetCRUD,
    getEditCRUD: getEditCRUD,
    putCRUD:putCRUD,
    deleteCRUD:deleteCRUD
}