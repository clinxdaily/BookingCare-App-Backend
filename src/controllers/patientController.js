import patientService from "../services/patientService";
let postBookAppointment = async (req, res) => {
  try {
    let response = await patientService.postBookAppointment(req.body);
    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(200)
      .json({ errCode: -1, errMesssage: "Error from server" });
  }
};
module.exports = { postBookAppointment: postBookAppointment };
