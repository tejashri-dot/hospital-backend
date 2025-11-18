import express from "express";
import {
  getProfile,
  resgisterUser,
  UpdateProfile,
  userLogin,
  bookAppointment,
  listAppointments,
  cancelAppointment,
} from "../controllers/userController.js";

import authUser from "../middlewares/authUser.js";
import upload from "../middlewares/multer.js";

const UserRouter = express.Router();

// API to Register User
UserRouter.post("/register", resgisterUser);
// API to Login User
UserRouter.post("/login", userLogin);
// API to get user profile
// Note: The getProfile function is protected by authUser middleware
UserRouter.get("/get-profile", authUser, getProfile);
// API to update user profile
// Note: The UpdateProfile function is protected by authUser middleware
UserRouter.post(
  "/update-profile",
  upload.single("image"),
  authUser,
  UpdateProfile
);
// API to book appointment
UserRouter.post("/book-appointment", authUser, bookAppointment);

// API for List Appintment for display booked Appointment
UserRouter.get("/appoitments", authUser, listAppointments);
// API for Cancel Appointment
UserRouter.post("/cancel-appointment", authUser, cancelAppointment);

export default UserRouter;
