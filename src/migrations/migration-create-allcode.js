'use strict';
// dùng để quản lý và tự động hóa việc tạo, chỉnh sửa hoặc xoá bảng trong cơ sở dữ liệu Sequelize trong Node.js
// Ưu điểm của dùng Migration:

// ✔ Quản lý lịch sử thay đổi trong database (thêm/xóa/sửa bảng).
// ✔ Dễ dàng rollback về trạng thái cũ nếu có lỗi.
// ✔ Giúp team làm việc đồng bộ, ai cũng có cùng cấu trúc DB.
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('allcodes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      key: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.STRING
      },
      valueEn: {
        type: Sequelize.STRING
      },
      valueVi: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('allcodes');
  }
};