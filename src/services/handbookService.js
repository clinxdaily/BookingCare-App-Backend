import db from "../models/index";

let createHandbook = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.name ||
        !data.imgBase64 ||
        !data.descriptionHTML ||
        !data.descriptionMarkdown
      ) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameters",
        });
      } else {
        let handbook = await db.Handbook.create({
          name: data.name,
          image: data.imgBase64,
          descriptionHTML: data.descriptionHTML,
          descriptionMarkdown: data.descriptionMarkdown,
        });
        if (handbook) {
          resolve({
            errCode: 0,
            errMessage: "Create handbook succeed",
            handbook: handbook,
          });
        } else {
          resolve({
            errCode: 2,
            errMessage: "Error creating handbook",
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

let editHandbook = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.id) {
        return resolve({
          errCode: 1,
          errMessage: "Missing required parameter: id",
        });
      }

      let handbook = await db.Handbook.findOne({
        where: { id: data.id },
        raw: false,
      });

      if (!handbook) {
        return resolve({
          errCode: 2,
          errMessage: "Handbook not found",
        });
      }

      if (data.name !== undefined) handbook.name = data.name;
      if (data.descriptionHTML !== undefined)
        handbook.descriptionHTML = data.descriptionHTML;
      if (data.descriptionMarkdown !== undefined)
        handbook.descriptionMarkdown = data.descriptionMarkdown;
      if (data.imgBase64 !== undefined && data.imgBase64 !== "")
        handbook.image = data.imgBase64;

      await handbook.save();

      return resolve({
        errCode: 0,
        errMessage: "Update handbook succeed",
        handbook,
      });
    } catch (e) {
      reject(e);
    }
  });
};

let deleteHandbook = async (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!id) {
        return resolve({
          errCode: 1,
          errMessage: "Missing required parameter: id",
        });
      }

      let handbook = await db.Handbook.findOne({
        where: { id: id },
      });

      if (!handbook) {
        return resolve({
          errCode: 2,
          errMessage: "Handbook not found",
        });
      }

      await db.Handbook.destroy({
        where: { id: id },
      });

      return resolve({
        errCode: 0,
        errMessage: "Delete handbook succeed",
      });
    } catch (e) {
      reject(e);
    }
  });
};

let getAllHandbook = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      let data = await db.Handbook.findAll({});
      if (data && data.length > 0) {
        data.map((item) => {
          item.image = Buffer.from(item.image, "base64").toString("binary");
          return item;
        });
      }
      resolve({
        errCode: 0,
        errMessage: "Get all handbooks succeed",
        data: data,
      });
    } catch (error) {
      reject(error);
    }
  });
};
let getDetailHandbookByID = async (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!id) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter: id",
        });
      } else {
        let data = await db.Handbook.findOne({
          where: { id: id },
          attributes: [
            "name",
            "descriptionHTML",
            "descriptionMarkdown",
            "image",
          ],
        });

        if (data) {
          data.image = Buffer.from(data.image, "base64").toString("binary");
        } else {
          data = {};
        }

        resolve({
          errCode: 0,
          data,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  createHandbook,
  editHandbook,
  deleteHandbook,
  getAllHandbook,
  getDetailHandbookByID,
};
