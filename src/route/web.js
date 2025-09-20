import express from "express";
import homeController from "../controllers/homeController";
import userController from "../controllers/userController";
import doctorController from "../controllers/doctorController";
import patientController from "../controllers/patientController";
import specialtyController from "../controllers/specialtyController";
import handbookController from "../controllers/handbookController";
let router = express.Router();
let initWebRoutes = (app) => {
  router.get("/", homeController.getHomePage);
  router.get("/about", homeController.getAboutPage);
  router.get("/crud", homeController.getCRUD);
  router.post("/post-crud", homeController.postCRUD);
  router.get("/get-crud", homeController.displayGetCRUD);
  router.get("/edit-crud", homeController.getEditCRUD);
  router.post("/put-crud", homeController.putCRUD);
  router.get("/delete-crud", homeController.deleteCRUD);
  router.post("/api/login", userController.handleLogin);
  router.get("/api/get-all-users", userController.handleGetAllUsers);
  router.post("/api/create-new-user", userController.handleCreateNewUser);
  router.put("/api/edit-user", userController.handleEditUser);
  router.delete("/api/delete-user", userController.handleDeleteUser);
  router.get("/api/allcode", userController.getAllCode);
  router.get("/api/top-doctor-home", doctorController.getTopDoctorHome);
  router.get("/api/get-all-doctor", doctorController.getAllDoctor);
  router.post("/api/save-info-doctor", doctorController.postInfoDoctor);
  router.get(
    "/api/get-detail-doctor_byid",
    doctorController.getDetailDoctorById
  );
  router.post("/api/bulk_create_schedule", doctorController.bulkCreateSchedule);
  router.post(
    "/api/delete-schedule-doctor_by_id",
    doctorController.deleteScheduleDoctorById
  );
  router.get(
    "/api/get-schedule-doctor_by_date",
    doctorController.getScheduleDoctorByDate
  );
  router.get(
    "/api/get-extra-info-doctor_by_id",
    doctorController.getExtraInfoDoctorById
  );
  router.get(
    "/api/get-profile-doctor_by_id",
    doctorController.getProfileDoctorById
  );

  router.get(
    "/api/get-list-patient-for-doctor",
    doctorController.getListPatientForDoctor
  );
  router.post("/api/send-remedy", doctorController.sendRemedy);
  router.post(
    "/api/get-remedy-by-booking",
    doctorController.handleGetRemedyByBooking
  );
  router.post("/api/cancel-appointment", doctorController.cancelAppointment);
  router.get(
    "/api/get-history-appointment",
    doctorController.getHistoryAppointment
  );
  router.get("/api/get-revenue", doctorController.getRevenue);

  router.post(
    "/api/delete-history-appointment",
    doctorController.deleteHistoryAppointment
  );
  router.post(
    "/api/patient-book-appointment",
    patientController.postBookAppointment
  );
  router.post(
    "/api/verify-book-appointment",
    patientController.postVerifyBookAppointment
  );
  router.post("/api/create-new-specialty", specialtyController.createSpecialty);
  router.post("/api/edit-specialty", specialtyController.editSpecialty);
  router.delete("/api/delete-specialty", specialtyController.deleteSpecialty);
  router.get("/api/get-all-specialty", specialtyController.getAllSpecialty);
  router.get(
    "/api/get-detail-specialty-by-id",
    specialtyController.getDetailSpecialtyByID
  );
  //
  router.post("/api/create-new-handbook", handbookController.createHandbook);
  router.post("/api/edit-handbook", handbookController.editHandbook);
  router.delete("/api/delete-handbook", handbookController.deleteHandbook);
  router.get("/api/get-all-handbook", handbookController.getAllHandbook);
  router.get(
    "/api/get-detail-handbook-by-id",
    handbookController.getDetailHandbookByID
  );
  //

  //

  return app.use("/", router);
};
module.exports = initWebRoutes;
