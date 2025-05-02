import e from 'express';
import db from '../models/index';
import bcrypt from 'bcryptjs';
import { raw } from 'body-parser';
import { where } from 'sequelize';

const salt = bcrypt.genSaltSync(10);
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

let handleUserLogin = (email, password) => {
    return new Promise(async(resolve,reject)=>{
        try {
            let userData ={};
            let isExist= await checkUserEmail(email);
            if(isExist){
                let user = await db.User.findOne({
                    attributes : ['email', 'roleId', 'password'],
                    where: { email: email },
                    raw:true
                   
                });
                if(user){
                    let check = await bcrypt.compareSync(password, user.password);
                    
                    if(check){
                        userData.errCode =0;
                        userData.errMessage = 'OK';
                        delete user.password; // xóa password ra khỏi object
                        userData.user = user;
                    }else{
                        userData.errCode =3;
                        userData.errMessage = 'Wrong password';
                    }
                }else{
                    userData.errCode =2;
                    userData.errMessage = 'User is not found';
                }
            }else{
                userData.errCode =1;
                userData.errMessage = 'Email not exist';
               
            }
            resolve(userData)
        } catch (error) {
            reject(error);
        }
    })
}

let checkUserEmail = (userEmail) => {
    return new Promise( async(resolve, reject) => {
       try {
        let user = await db.User.findOne({
            where: { email: userEmail }
        })
        if(user) {
            resolve(true);
        }else{
            resolve(false);
        }
       } catch (error) { 
           reject(error);
        
       }
    })
}
let getAllUsers = (userId) => {
    return new Promise(async(resolve, reject) => {
        try {
            let users = '';
            if(userId === 'ALL'){
                 users = await db.User.findAll({
                    attributes: {
                        exclude: ['password']
                    },
                })
                
            }
            if(userId && userId !== 'ALL'){
                users = await db.User.findOne({
                    where: { id: userId },
                   attributes: {
                        exclude: ['password']
                    },
                })
            }
            resolve(users);
        } catch (error) {
            reject(error);
        }
    })
}
let createNewUser = (data) => {
    return new Promise(async(resolve, reject) => {
        try {
                let check = await checkUserEmail(data.email);
                if(check === true){
                    resolve({
                        errCode: 1,
                        errMessage: 'Email is already in use, please try another email'
                    })
                }
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
                        resolve({errCode:0, errMessage:'ok create new user succeed'})
        } catch (error) {
            reject(error);
        }
    })
}
let deleteUser = (userId) => {
    return new Promise(async(resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { id: userId }
            })
            if(!user){
                resolve({
                    errCode: 2,
                    errMessage: 'The user is not exist'
                })
            }
            await db.User.destroy({
                where: { id: userId }
            })
            resolve({
                errCode: 0,
                errMessage: 'The user is deleted'
            })
        } catch (error) {
            reject(error);
        }
    })
}
let updateUserData = (data)=>{
    return new Promise(async(resolve, reject) => {
        try {
            if(!data.id){
                resolve({
                    errCode: 2,
                    errMessage: 'Missing required parameter'
                })
            }
            let user = await db.User.findOne({ //Tìm user theo id
                            where: {id: data.id},
                            raw: false
                        })
                        if(user){
                           user.firstName = data.firstName;
                            user.lastName = data.lastName;
                            user.address = data.address;

                            await  user.save(); //Lưu lại thông tin user
                            
                            
                           resolve({
                                errCode: 0,
                                message: 'Update the user succeed'
                           })
                        }else{
                            resolve({
                                errCode: 1,
                                message: 'User not found'
                            });
                        }
        } catch (error) {
            reject(error);
        }
    })
}
module.exports = {
    handleUserLogin:handleUserLogin,
    getAllUsers:getAllUsers,
    createNewUser:createNewUser,
    deleteUser:deleteUser,
    updateUserData:updateUserData
}