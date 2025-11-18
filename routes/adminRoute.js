import express from "express";
import {
  addDoctor,
  adminLogin,
  getAllDoctors,
} from "../controllers/adminController.js";
import upload from "../middlewares/multer.js";
import authAdmin from "../middlewares/authAdmin.js";
import { changeAvailability } from "../controllers/doctorController.js";

const adminRouter = express.Router();

//API for Adding a doctor
// yamde apn multer made upload krto single file name image
adminRouter.post("/add-doctor", authAdmin, upload.single("image"), addDoctor);
adminRouter.post("/login", adminLogin);
adminRouter.post("/all-doctors", authAdmin, getAllDoctors);
adminRouter.post("/change-availability", authAdmin, changeAvailability);

export default adminRouter;
