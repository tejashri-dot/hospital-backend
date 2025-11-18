import express from "express";
import { doctorsList } from "../controllers/doctorController.js";

const doctorRouter = express.Router();

// Route to get the list of doctors
doctorRouter.get("/list", doctorsList);

export default doctorRouter;
