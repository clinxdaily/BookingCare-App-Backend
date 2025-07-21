import handbookService from "../services/handbookService.js";
let createHandbook = async (req, res) => {
  try {
    let response = await handbookService.createHandbook(req.body);
    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(200)
      .json({ errCode: -1, errMesssage: "Error from server" });
  }
};
let editHandbook = async (req, res) => {
  try {
    let response = await handbookService.editHandbook(req.body);
    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(200)
      .json({ errCode: -1, errMesssage: "Error from server" });
  }
};
let deleteHandbook = async (req, res) => {
  try {
    let response = await handbookService.deleteHandbook(req.query.id);
    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(200)
      .json({ errCode: -1, errMesssage: "Error from server" });
  }
};
let getAllHandbook = async (req, res) => {
  try {
    let response = await handbookService.getAllHandbook();
    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(200)
      .json({ errCode: -1, errMesssage: "Error from server" });
  }
};
let getDetailHandbookByID = async (req, res) => {
  try {
    let response = await handbookService.getDetailHandbookByID(req.query.id);
    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(200)
      .json({ errCode: -1, errMesssage: "Error from server" });
  }
};
module.exports = {
  createHandbook: createHandbook,
  editHandbook: editHandbook,
  deleteHandbook: deleteHandbook,
  getAllHandbook: getAllHandbook,
  getDetailHandbookByID: getDetailHandbookByID,
};
