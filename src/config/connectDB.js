const { Sequelize } = require('sequelize');

// Kết nối tới CSDL bằng sequelize 
const sequelize = new Sequelize('hihi', 'root', null , {
  host: 'localhost',
  dialect: 'mysql',
  logging: false
});

let connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
      } catch (error) {
        console.error('Unable to connect to the database:', error);
      }
}
module.exports = connectDB;