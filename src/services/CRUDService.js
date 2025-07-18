import bcrypt from 'bcryptjs';
import db from '../models/index';
import { raw } from 'body-parser';
import { where } from 'sequelize';

const salt = bcrypt.genSaltSync(10);
// chứa các thao tác CRUD của người dùng trong hệ thống
let createNewUser = async (data) =>{
    return new Promise(async(resolve,reject) =>{
        try {
            let hashPasswordFromBcrypt = await hashUserPassword(data.password);
            await db.User.create({
                email: data.email,
                password: hashPasswordFromBcrypt,
                firstName: data.firstName,
                lastName: data.lastName,
                address: data.address,
                phonenumber:data.phonenumber,
                gender: data.gender === "1"?true:false,
                roleId:data.roleId
                
            })
            resolve('ok creae new user succeed')
        } catch (e) {
            reject(e)
        }
    })
    
    
}
let hashUserPassword = (password)=>{
    return new Promise(async(resolve, reject) =>{
    try {
        let hashPassword = await bcrypt.hashSync(password, salt);
        resolve(hashPassword);
    } catch (e) {
        reject(e);
    }      
        
    })

    
}
let getAllUser= () =>{
    return new Promise(async(resolve, reject)=>{
        try {
            let users = db.User.findAll({
                raw: true,
            });
            resolve(users)
        } catch (e) {
            reject(e)
        }
    })
}
let getUserInfoById = (userId)=> {
    return new Promise(async(resolve, reject)=>{
        try {
            let user = await db.User.findOne({
                where: {id: userId},
                raw: true
            })
            if(user){
                resolve(user);
            }else{
                resolve({});
            }
        }catch(e){
            reject(e)
        }
    })

}
let updateUserData = (data) =>{
    return new Promise(async(resolve, reject)=>{
        try {
            let user = await db.User.findOne({ //Tìm user theo id
                where: {id: data.id},
            })
            if(user){
                user.firstName = data.firstName; 
                user.lastName = data.lastName;
                user.address = data.address;

                await user.save();
                let allUsers = await db.User.findAll();
                resolve(allUsers);
            }else{
                resolve();
            }
        } catch (e) {
            console.log(e);
        }
    })
}
let deleteUserById = (userId) =>{
    return new Promise(async(resonlve, reject)=>{
        try {
            let user= await db.User.findOne({
                where: {id: userId}
            })
            if(user){
                await user.destroy();
            }
            resonlve();
        } catch (error) {
            reject(error);
        }
    })
}
module.exports = {
    createNewUser:createNewUser,
    getAllUser: getAllUser,
    getUserInfoById: getUserInfoById,
    updateUserData:updateUserData,
    deleteUserById:deleteUserById
}
