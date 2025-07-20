import clinicService from "../services/clinicService";
let createClinic = async (req, res) => {
  try {
    let response = await clinicService.createClinic(req.body);
    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(200)
      .json({ errCode: -1, errMesssage: "Error from server" });
  }
};
let getAllClinic = async (req, res) => {
  try {
    let response = await clinicService.getAllClinic();
    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(200)
      .json({ errCode: -1, errMesssage: "Error from server" });
  }
};
let editClinic = async (req, res) => {
  try {
    let response = await clinicService.editClinic(req.body);
    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(200)
      .json({ errCode: -1, errMesssage: "Error from server" });
  }
};
let deleteClinic = async (req, res) => {
  try {
    let response = await clinicService.deleteClinic(req.query.id);
    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(200)
      .json({ errCode: -1, errMesssage: "Error from server" });
  }
};
let getDetailClinicByID = async (req, res) => {
  try {
    let response = await clinicService.getDetailClinicByID(req.query.id);
    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(200)
      .json({ errCode: -1, errMesssage: "Error from server" });
  }
};
module.exports = {
  createClinic: createClinic,
  getAllClinic: getAllClinic,
  getDetailClinicByID: getDetailClinicByID,
  editClinic: editClinic,
  deleteClinic: deleteClinic,
};
const db = require("../models");
