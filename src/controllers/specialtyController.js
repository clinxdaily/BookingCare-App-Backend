import specialtyService from "../services/specialtyService.js";
let createSpecialty = async (req, res) => {
  try {
    let response = await specialtyService.createSpecialty(req.body);
    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(200)
      .json({ errCode: -1, errMesssage: "Error from server" });
  }
};
let editSpecialty = async (req, res) => {
  try {
    let response = await specialtyService.editSpecialty(req.body);
    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(200)
      .json({ errCode: -1, errMesssage: "Error from server" });
  }
};
let deleteSpecialty = async (req, res) => {
  try {
    let response = await specialtyService.deleteSpecialty(req.query.id);
    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(200)
      .json({ errCode: -1, errMesssage: "Error from server" });
  }
};
let getAllSpecialty = async (req, res) => {
  try {
    let response = await specialtyService.getAllSpecialty();
    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(200)
      .json({ errCode: -1, errMesssage: "Error from server" });
  }
};
let getDetailSpecialtyByID = async (req, res) => {
  try {
    let response = await specialtyService.getDetailSpecialtyByID(
      req.query.id,
      req.query.location
    );
    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(200)
      .json({ errCode: -1, errMesssage: "Error from server" });
  }
};
module.exports = {
  createSpecialty: createSpecialty,
  getAllSpecialty: getAllSpecialty,
  getDetailSpecialtyByID: getDetailSpecialtyByID,
  editSpecialty: editSpecialty,
  deleteSpecialty: deleteSpecialty,
};
